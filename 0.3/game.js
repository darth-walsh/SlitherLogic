
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

    Object.defineProperty(Game, "currentPuzzle", {
        get: function () {
            return localStorage && localStorage[Game.level] || Game._currentPuzzle;
        },
        set: function (n) {
            Game._currentPuzzle = n;
            if (localStorage)
                localStorage[Game.level] = n;
        },
        enumerable: true,
        configurable: true
    });

    Game.init = function () {
        var ua = navigator.userAgent.toLowerCase();
        Game.android = ua.indexOf('android') > -1;
        Game.ios = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);

        window.addEventListener('click', function (e) {
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

        Game.newLayer = new Kinetic.Layer();
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
            Game.loadPuzzle();

            Logic.reset();
            for (var e in Game.edges)
                Game.edges[e].reset();
            for (var v in Game.vertices)
                Game.vertices[v].reset();
            for (var h in Game.hints)
                Game.hints[h].reset();

            Game.newLayer.hide();
            Game.layer.draw();
        });
        Game.newText = new Kinetic.Text({
            text: 'New',
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'aqua',
            listening: false
        });
        Game.newText.setX(-Game.newText.getTextWidth() / 2);
        Game.newText.setY(-Game.newText.getTextHeight() / 2);

        Game.newLayer.add(Game.newButton);
        Game.newLayer.add(Game.newText);
        Game.stage.add(Game.newLayer);

        Game.newLayer.moveToTop();
        Game.newLayer.hide();

        Game.menuLayer = new Kinetic.Layer();
        Game.levelButton = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 30,
            height: 30,
            fill: 'blue'
        });
        Game.levelButton.on('click', function () {
            var newLevel = prompt('Type a new level! (square hex triangle dodec test)', Game.level);
            Game.unloadLevel();
            Game.level = newLevel;
            Game.loadLevel();
        });

        Game.menuLayer.add(Game.levelButton);

        Game.stage.add(Game.menuLayer);

        VictoryLogic.onVictory = function () {
            Game.layer.draw();
            Game.newLayer.show();
            Game.newLayer.draw();
        };

        Game.loadLevel();
    };

    Game.loadLevel = function () {
        var url = Game.levelFolder + 'level.json';
        Game.layer = new Kinetic.Layer();
        Game.stage.add(Game.layer);
        Game.layer.moveToBottom();

        Game.edgeSibs = new Kinetic.Group({});
        Game.layer.add(Game.edgeSibs);

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

            for (var e in Game.edges)
                Game.edges[e].setPositionFromHints();

            Logic.init();

            Game.loadPuzzle();

            Game.resize();
        }).fail(function () {
            return alert("Can't load " + url + ", sorry.");
        });
    };

    Game.unloadLevel = function () {
        Logic.destroy();

        for (var h in Game.hints)
            Game.hints[h].destroy();

        for (var e in Game.edges)
            Game.edges[e].destroy();

        for (var v in Game.vertices)
            Game.vertices[v].destroy();

        Game.hints = {};
        Game.edges = {};
        Game.vertices = {};

        Edge.uniqueId = 1;

        if (Game.edgeSibs.hasChildren())
            throw 'not all elements removed from edgeSibs';

        Game.edgeSibs.destroy();

        if (Game.layer.hasChildren())
            throw 'not all elements removed from layer';

        Game.layer.destroy();
    };

    Game.loadPuzzle = function () {
        var folder = Game.levelFolder;
        var url = folder + Game.currentPuzzle + '.txt';
        $.get(url, function (hints) {
            hints = hints.replace(/[\r\n]/g, "");
            for (var i = 0; i < hints.length; ++i)
                Game.hints['h' + i].setNum(hints.charAt(i));
            Game.layer.draw();
        }).fail(function () {
            if (confirm("Can't load the puzzle, sorry.\nDo you want to reset your progress (just for the " + Game.level + " level)?")) {
                Game.currentPuzzle = 0;
                Game.loadPuzzle();
            }
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

        Game.newLayer.setOffset(-Game.stage.getWidth() / 2, -Game.stage.getHeight() / 2);
        Game.menuLayer.setOffset(-Game.stage.getWidth() + Game.levelButton.getWidth(), 0);
        Game.layer.setOffset(-Game.stage.getWidth() / 2, -Game.stage.getHeight() / 2);

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

        return new Point(Math.floor((p.x - (Game.puzzleBR.x + Game.puzzleTL.x) / 2) * ratio), Math.floor((p.y - (Game.puzzleBR.y + Game.puzzleTL.y) / 2) * ratio));
    };

    Game.loop = function () {
        requestAnimFrame(Game.loop);
    };
    Game.level = 'hex';

    Game._currentPuzzle = 0;

    Game.resizing = false;

    Game.margin = 20;
    return Game;
})();

window.addEventListener('load', Game.init, false);
window.addEventListener('resize', Game.onResize, false);
window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
