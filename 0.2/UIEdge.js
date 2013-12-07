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
            if (evt.which === 2)
                return;

            if (_this.edge.selected !== null)
                _this.edge.selected = null;
            else
                _this.edge.selected = evt.which === 1;

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
