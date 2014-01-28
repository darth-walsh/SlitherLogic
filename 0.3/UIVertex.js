var UIVertex = (function () {
    function UIVertex(name, o) {
        var _this = this;
        this.name = name;
        this.shape = new Kinetic.Circle({
            radius: UIVertex.radius
        });
        Game.layer.add(this.shape);
        this.shape.moveToTop();

        this.p = Point.from(o);
        this.vertex = new Vertex(this.name, function () {
            switch (_this.vertex.valid()) {
                case true:
                    _this.shape.hide();
                    break;
                case false:
                    _this.shape.setFill(UIVertex.noColor);
                    _this.shape.show();
                    break;
                case null:
                    _this.shape.setFill(UIVertex.unColor);
                    _this.shape.show();
                    break;
            }
        });

        this.vertex.updateUI();
    }
    UIVertex.prototype.destroy = function () {
        this.vertex.destroy();
        this.vertex = null;
        this.shape.destroy();
    };

    UIVertex.prototype.reposition = function () {
        var draw = Game.getVirtualPoint(this.p);
        this.shape.setPosition(draw.x, draw.y);
    };

    UIVertex.prototype.reset = function () {
        this.vertex.reset();
    };
    UIVertex.radius = 5;
    UIVertex.unColor = 'white';
    UIVertex.noColor = 'red';
    return UIVertex;
})();
