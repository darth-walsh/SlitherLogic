var UIVertex = (function () {
    function UIVertex(name, o) {
        var _this = this;
        this.name = name;
        this.shape = new Kinetic.Circle({
            radius: UIVertex.radius
        });
        Game.layer.add(this.shape);
        this.shape.setZIndex(1);

        this.p = Point.from(o);
        this.vertex = new Vertex(this.name, function () {
            _this.shape.setFill(_this.vertex.valid() !== false ? UIVertex.yesColor : UIVertex.noColor);
        });

        this.vertex.updateUI();
    }
    UIVertex.prototype.reposition = function () {
        var draw = Game.getVirtualPoint(this.p);
        this.shape.setPosition(draw.x, draw.y);
    };
    UIVertex.radius = 5;
    UIVertex.yesColor = 'white';
    UIVertex.noColor = 'red';
    return UIVertex;
})();
