
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
    return Point;
})();

var Game = (function () {
    function Game() {
    }
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

        Game.loadLevel('data/square_7_7/level.json');
    };

    Game.loadLevel = function (url) {
        Game.layer = new Kinetic.Layer();
        Game.stage.add(Game.layer);

        Game.vertices = {};
        Game.edges = {};
        Game.hints = {};

        Game.puzzleTL = new Point(1e4, 1e4);
        Game.puzzleBR = new Point(-1e4, -1e4);

        $.getJSON(url).then(function (level) {
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

            Game.loadPuzzle('data/square_7_7/1.txt');

            Game.resize();
        });
    };

    Game.loadPuzzle = function (url) {
        $.get(url, function (hints) {
            hints = hints.replace(/[\r\n]/g, "");
            for (var i = 0; i < hints.length; ++i)
                Game.hints['h' + i].setNum(hints.charAt(i));
            Game.layer.draw();
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
    Game.resizing = false;

    Game.margin = 50;
    return Game;
})();

window.addEventListener('load', Game.init, false);
window.addEventListener('resize', Game.onResize, false);
window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
