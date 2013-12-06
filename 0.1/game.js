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

var UIVertex = (function () {
    function UIVertex(o) {
        var _this = this;
        this.shape = new Kinetic.Circle({
            radius: UIVertex.radius
        });
        Game.layer.add(this.shape);
        this.shape.setZIndex(1);

        this.p = Point.from(o);
        this.vertex = new Vertex(function () {
            _this.shape.setFill(_this.vertex.valid() ? UIVertex.yesColor : UIVertex.noColor);
        });

        this.vertex.updateUI();
    }
    UIVertex.prototype.reposition = function () {
        var draw = Game.getVirtualPoint(this.p);
        this.shape.setPosition(draw.x, draw.y);
    };
    UIVertex.radius = 7;
    UIVertex.yesColor = 'white';
    UIVertex.noColor = 'red';
    return UIVertex;
})();

var UIEdge = (function () {
    function UIEdge(v1, v2) {
        var _this = this;
        this.v1 = v1;
        this.v2 = v2;
        this.shape = new Kinetic.Line({
            points: [0, 0],
            lineCap: 'round',
            dashArray: [1, UIEdge.unWidth * 2]
        });

        this.shape.on('click', function () {
            var evts = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                evts[_i] = arguments[_i + 0];
            }
            var evt = evts[0];
            if (evt.which == 2)
                return;

            if (_this.edge.selected !== null)
                _this.edge.selected = null;
else
                _this.edge.selected = evt.which == 1;

            return {};
        });
        Game.layer.add(this.shape);
        this.shape.setZIndex(0);

        this.yesColor = UIEdge.getRandomColor();
        this.edge = new Edge(v1.vertex, v2.vertex, function () {
            switch (_this.edge.selected) {
                case true:
                    _this.shape.setDashArrayEnabled(false);
                    _this.shape.setStroke(_this.yesColor);
                    _this.shape.setStrokeWidth(UIEdge.yesWidth);
                    break;
                case false:
                    _this.shape.setDashArrayEnabled(false);
                    _this.shape.setStroke(UIEdge.noColor);
                    _this.shape.setStrokeWidth(UIEdge.noWidth);
                    break;
                case null:
                    _this.shape.setDashArrayEnabled(true);
                    _this.shape.setStroke(UIEdge.unColor);
                    _this.shape.setStrokeWidth(UIEdge.unWidth);
                    break;
            }
            Game.layer.draw();
        });
        this.edge.updateUI();
    }
    UIEdge.prototype.reposition = function () {
        var draw1 = Game.getVirtualPoint(this.v1.p);
        var draw2 = Game.getVirtualPoint(this.v2.p);
        this.shape.setPoints([draw1.x, draw1.y, draw2.x, draw2.y]);
    };

    UIEdge.getRandomColor = function () {
        return 'blue';
    };

    UIEdge.rainbow = function (numOfSteps, step) {
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch (i % 6) {
            case 0:
                r = 1, g = f, b = 0;
                break;
            case 1:
                r = q, g = 1, b = 0;
                break;
            case 2:
                r = 0, g = 1, b = f;
                break;
            case 3:
                r = 0, g = q, b = 1;
                break;
            case 4:
                r = f, g = 0, b = 1;
                break;
            case 5:
                r = 1, g = 0, b = q;
                break;
        }
        return "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
    };
    UIEdge.yesWidth = 5;
    UIEdge.noWidth = 2;
    UIEdge.unWidth = 3;

    UIEdge.noColor = '#222';
    UIEdge.unColor = 'white';
    return UIEdge;
})();

var UIHint = (function () {
    function UIHint(p, es) {
        var _this = this;
        this.text = null;
        this.p = Point.from(p);
        this.drawSize = new Point();

        this.text = new Kinetic.Text({
            text: ' ',
            fontSize: UIHint.fontSize,
            fontFamily: UIHint.fontFamily,
            fill: UIHint.yesColor
        });

        Game.layer.add(this.text);

        this.hint = new Hint(es.map(function (e) {
            return e.edge;
        }), function () {
            _this.text.setFill(_this.hint.valid() ? UIHint.yesColor : UIHint.noColor);
        });
    }
    UIHint.prototype.setNum = function (s) {
        if (s !== ' ') {
            this.num = parseInt(s, 36);
            this.hint.num = this.num;
            s = '' + this.num;
        }

        this.text.setText(s);
        this.drawSize.x = this.text.getTextWidth();
        this.drawSize.y = this.text.getTextHeight();

        this.reposition();
    };

    UIHint.prototype.reposition = function () {
        var draw = Game.getVirtualPoint(this.p).add(this.drawSize.scaled(-0.5));
        this.text.setPosition(draw.x, draw.y);
    };
    UIHint.fontSize = 20;
    UIHint.fontFamily = 'Calibri';
    UIHint.yesColor = 'white';
    UIHint.noColor = 'red';
    return UIHint;
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

        Game.loadLevel('data/test/level.json');
    };

    Game.loadLevel = function (url) {
        Game.layer = new Kinetic.Layer();
        Game.stage.add(Game.layer);

        Game.vertices = {};
        Game.edges = {};
        Game.hints = {};

        Game.puzzleUL = new Point();
        Game.puzzleLR = new Point();

        $.getJSON(url).then(function (level) {
            for (var v in level.vertices) {
                Game.vertices[v] = new UIVertex(level.vertices[v]);
            }

            for (var e in level.edges) {
                var edge = level.edges[e];
                Game.edges[e] = new UIEdge(Game.vertices[edge[0]], Game.vertices[edge[1]]);
            }

            for (var h in level.hints) {
                var hint = level.hints[h];
                Game.hints[h] = new UIHint(hint.position, hint.edges.map(function (e) {
                    return Game.edges[e];
                }));
            }

            Game.loadPuzzle('data/test/1.txt');

            Game.resize();
        });
    };

    Game.loadPuzzle = function (url) {
        $.get(url, function (hints) {
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
        $('#container').css('height', window.innerHeight - 20);

        Game.stage.setWidth($('#container').width());
        Game.stage.setHeight($('#container').height());

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
        return new Point(p.x * 30 + 60, p.y * 30 + 60);
    };

    Game.loop = function () {
        requestAnimFrame(Game.loop);
    };
    Game.resizing = false;
    return Game;
})();

window.addEventListener('load', Game.init, false);
window.addEventListener('resize', Game.onResize, false);
window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});
