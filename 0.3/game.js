
var Point = (function () {
    function Point(x, y) {
        if (typeof x === "undefined") { x = 0; }
        if (typeof y === "undefined") { y = 0; }
        this.x = x;
        this.y = y;
    }
    Point.from = function (o) {
        if (o.hasOwnProperty('x') && o.hasOwnProperty('y'))
            return new Point(o.x, o.y);
        throw "Can't make Point from: " + JSON.stringify(o);
    };
    Point.prototype.scaled = function (s) {
        return new Point(this.x * s, this.y * s);
    };
    Point.prototype.add = function (p) {
        return new Point(this.x + p.x, this.y + p.y);
    };
    Point.prototype.sub = function (p) {
        return this.add(p.scaled(-1));
        ;
    };
    return Point;
})();

var Game = (function () {
    function Game() {
    }
    Object.defineProperty(Game, "levelFolder", {
        get: function () {
            return 'data/' + Game.level + '/';
        },
        enumerable: true,
        configurable: true
    });

    Game.init = function () {
        var ua = navigator.userAgent.toLowerCase();
        Game.android = ua.indexOf('android') > -1;
        Game.ios = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);

        window.addEventListener('click', function (e) {
            Game.onResize();
            e.preventDefault();
        }, false);

        window.addEventListener('touchstart', function (e) {
            e.preventDefault();
        }, false);
        window.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
        window.addEventListener('touchend', function (e) {
            e.preventDefault();
        }, false);

        Game.stage = new Kinetic.Stage({
            container: 'container',
            width: window.innerWidth,
            height: window.innerHeight
        });

        Game.menuLayer = new Kinetic.Layer();
        Game.newButton = new Kinetic.Rect({
            x: -50,
            width: 100,
            y: -25,
            height: 50,
            fill: 'black',
            stroke: 'green',
            strokeWidth: 5
        });
        Game.newButton.on('click', function () {
            ++Game.currentPuzzle;
            Game.loadPuzzle(Game.levelFolder);
            for (var e in Game.edges)
                Game.edges[e].reset();
            Game.menuLayer.hide();
            Game.layer.draw();
        });
        Game.newText = new Kinetic.Text({
            text: 'New',
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'aqua'
        });
        Game.newText.on('click', function () {
            return Game.newButton.fire('click');
        });
        Game.newText.setX(-Game.newText.getTextWidth() / 2);
        Game.newText.setY(-Game.newText.getTextHeight() / 2);

        Game.menuLayer.add(Game.newButton);
        Game.menuLayer.add(Game.newText);
        Game.stage.add(Game.menuLayer);
        Game.menuLayer.setZIndex(10);
        Game.menuLayer.hide();

        Logic.onVictory = function () {
            Game.layer.draw();
            Game.menuLayer.show();
            Game.menuLayer.draw();
        };

        Game.loadLevel(Game.levelFolder + 'level.json');
    };

    Game.loadLevel = function (url) {
        Game.layer = new Kinetic.Layer();
        Game.stage.add(Game.layer);
        Game.layer.setZIndex(0);

        Game.vertices = {};
        Game.edges = {};
        Game.hints = {};

        Game.puzzleTL = new Point(1e4, 1e4);
        Game.puzzleBR = new Point(-1e4, -1e4);

        $.getJSON(url, function (level) {
            for (var v in level.vertices) {
                Game.vertices[v] = new UIVertex(v, level.vertices[v]);
                Game.puzzleTL.x = Math.min(Game.puzzleTL.x, Game.vertices[v].p.x);
                Game.puzzleTL.y = Math.min(Game.puzzleTL.y, Game.vertices[v].p.y);
                Game.puzzleBR.x = Math.max(Game.puzzleBR.x, Game.vertices[v].p.x);
                Game.puzzleBR.y = Math.max(Game.puzzleBR.y, Game.vertices[v].p.y);
            }

            for (var e in level.edges) {
                var edge = level.edges[e];
                Game.edges[e] = new UIEdge(e, Game.vertices[edge[0]], Game.vertices[edge[1]]);
            }

            for (var h in level.hints) {
                var hint = level.hints[h];
                Game.hints[h] = new UIHint(h, hint.position, hint.edges.map(function (e) {
                    return Game.edges[e];
                }));
            }

            for (var e in Game.edges) {
                Game.edges[e].setHints();
            }

            Game.loadPuzzle(Game.levelFolder);

            Game.resize();
        }).fail(function () {
            return alert("Can't load " + url + ", sorry.");
        });
    };

    Game.loadPuzzle = function (folder) {
        var url = folder + Game.currentPuzzle + '.txt';
        $.get(url, function (hints) {
            hints = hints.replace(/[\r\n]/g, "");
            for (var i = 0; i < hints.length; ++i)
                Game.hints['h' + i].setNum(hints.charAt(i));
            Game.layer.draw();
        }).fail(function () {
            return alert("Can't load " + url + ", sorry.");
        });
    };

    Game.onResize = function () {
        clearTimeout(Game.lastResize);
        Game.lastResize = setTimeout(Game.resize, 100);

        if (!Game.resizing) {
            Game.resize();
            Game.resizing = true;
            setTimeout(function () {
                Game.resizing = false;
            }, 100);
        }
    };

    Game.resize = function () {
        var container = $('#container');
        container.css('height', window.innerHeight - 20);

        Game.stage.setWidth(container.width());
        Game.stage.setHeight(container.height());

        Game.menuLayer.setOffset(-Game.stage.getWidth() / 2, -Game.stage.getHeight() / 2);

        for (var v in Game.vertices) {
            Game.vertices[v].reposition();
        }

        for (var e in Game.edges) {
            Game.edges[e].reposition();
        }

        for (var h in Game.hints) {
            Game.hints[h].reposition();
        }

        Game.layer.draw();
    };

    Game.getVirtualPoint = function (p) {
        var xRatio = (Game.stage.getWidth() - 2 * Game.margin) / (Game.puzzleBR.x - Game.puzzleTL.x);
        var yRatio = (Game.stage.getHeight() - 2 * Game.margin) / (Game.puzzleBR.y - Game.puzzleTL.y);

        var ratio = Math.min(xRatio, yRatio);

        return new Point(Math.floor((p.x - Game.puzzleTL.x) * ratio) + Game.margin, Math.floor((p.y - Game.puzzleTL.y) * ratio) + Game.margin);
    };

    Game.loop = function () {
        requestAnimFrame(Game.loop);
    };
    Game.currentPuzzle = 2;
    Game.level = 'hex';

    Game.resizing = false;

    Game.margin = 50;
    return Game;
})();

window.addEventListener('load', Game.init, false);
window.addEventListener('resize', Game.onResize, false);
window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
