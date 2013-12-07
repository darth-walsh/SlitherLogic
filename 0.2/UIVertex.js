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
