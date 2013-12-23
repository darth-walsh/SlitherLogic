var UIEdge = (function () {
    function UIEdge(name, v1, v2) {
        var _this = this;
        this.name = name;
        this.v1 = v1;
        this.v2 = v2;
        var thisEdge = this;
        this.shape = new Kinetic.Line({
            points: [0, 0],
            lineCap: 'round',
            dashArray: [1, UIEdge.unWidth * 4],
            drawHitFunc: function (context) {
                context.beginPath();
                var draw1 = Game.getVirtualPoint(thisEdge.v1.p);
                var draw2 = Game.getVirtualPoint(thisEdge.v2.p);
                var drawHit1 = Game.getVirtualPoint(thisEdge.hit1);
                var drawHit2 = Game.getVirtualPoint(thisEdge.hit2);
                context.moveTo(draw1.x, draw1.y);
                context.lineTo(drawHit1.x, drawHit1.y);
                context.lineTo(draw2.x, draw2.y);
                context.lineTo(drawHit2.x, drawHit2.y);
                context.lineTo(draw1.x, draw1.y);
                context.fillStrokeShape(this);
            }
        });

        this.shape.on('click', function () {
            var evts = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                evts[_i] = arguments[_i + 0];
            }
            var evt = evts[0];
            if (evt.which === 2)
                return;

            if (Game.menuLayer.getVisible())
                return;

            if (_this.edge.selected !== null)
                _this.edge.selected = null;
            else
                _this.edge.selected = evt.which === 1;

            Game.layer.draw();
        });
        Game.layer.add(this.shape);
        this.shape.setZIndex(0);

        this.edge = new Edge(this.name, v1.vertex, v2.vertex, function () {
            switch (_this.edge.selected) {
                case true:
                    _this.shape.setDashArrayEnabled(false);
                    _this.shape.setStroke(_this.yesColor);
                    break;
                case false:
                    _this.shape.setDashArrayEnabled(false);
                    _this.shape.setStroke(UIEdge.noColor);
                    break;
                case null:
                    _this.shape.setDashArrayEnabled(true);
                    _this.shape.setStroke(UIEdge.unColor);
                    break;
            }
            _this.shape.setStrokeWidth(_this.strokeWidth);
        });
        this.edge.updateUI();
    }
    Object.defineProperty(UIEdge.prototype, "yesColor", {
        get: function () {
            var step = (this.edge.id * 3) % 19;
            return UIEdge.rainbow(24, step + 3);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(UIEdge.prototype, "strokeWidth", {
        get: function () {
            switch (this.edge.selected) {
                case true:
                    return UIEdge.yesWidth;
                case false:
                    return UIEdge.noWidth;
                case null:
                    return UIEdge.unWidth;
            }
        },
        enumerable: true,
        configurable: true
    });

    UIEdge.prototype.reposition = function () {
        var draw1 = Game.getVirtualPoint(this.v1.p);
        var draw2 = Game.getVirtualPoint(this.v2.p);
        this.shape.setPoints([draw1.x, draw1.y, draw2.x, draw2.y]);
    };

    UIEdge.prototype.reset = function () {
        this.edge.selected = null;
    };

    UIEdge.prototype.setHints = function () {
        var l = this.edge.hints.length;
        if (l == 0 || l > 2)
            throw this.name + ": doesn't have 1 or 2 edges";

        this.hit1 = Game.hints[this.edge.hints[0].name].p;
        if (l === 2)
            this.hit2 = Game.hints[this.edge.hints[1].name].p;
        else {
            if (Game.level === 'dodec') {
                var x = 0.1547;
                this.hit2 = this.v1.p.add(this.v2.p).scaled((1 + x) / 2).sub(this.hit1.scaled(x));
            } else
                this.hit2 = this.v1.p.add(this.v2.p).sub(this.hit1);
        }
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
    UIEdge.unWidth = 2;
    UIEdge.hitWidth = 25;

    UIEdge.noColor = '#222';
    UIEdge.unColor = 'white';
    return UIEdge;
})();
