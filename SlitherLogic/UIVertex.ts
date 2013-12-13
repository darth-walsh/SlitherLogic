/// <reference path="lib\jquery.d.ts" />
/// <reference path="lib\kinetic.d.ts" />

class UIVertex {
  static radius = 7;
  static yesColor = 'white';
  static noColor = 'red';

  vertex: Vertex;
  p: Point;
  shape: Kinetic.Circle;

  constructor(public name: string, o) {
    this.shape = new Kinetic.Circle({
      radius: UIVertex.radius,
    });
    Game.layer.add(this.shape);
    this.shape.setZIndex(1);

    this.p = Point.from(o);
    this.vertex = new Vertex(this.name, () => {
      this.shape.setFill(this.vertex.valid() !== false ? UIVertex.yesColor : UIVertex.noColor);
    });

    this.vertex.updateUI();
  }

  reposition() {
    var draw = Game.getVirtualPoint(this.p);
    this.shape.setPosition(draw.x, draw.y);
  }
}
