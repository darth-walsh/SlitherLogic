/// <reference path="lib\jquery.d.ts" />
/// <reference path="lib\kinetic.d.ts" />

class UIVertex {
  static radius = 5;
  static unColor = 'white';
  static noColor = 'red';

  vertex: Vertex;
  p: Point;
  shape: Kinetic.Circle;

  constructor(public name: string, o) {
    this.shape = new Kinetic.Circle({
      radius: UIVertex.radius,
    });
    Game.layer.add(this.shape);
    this.shape.moveToTop();

    this.p = Point.from(o);
    this.vertex = new Vertex(this.name, () => {
      switch (this.vertex.valid()) {
        case true:
          this.shape.hide();
          break;
        case false:
          this.shape.setFill(UIVertex.noColor);
          this.shape.show();
          break;
        case null:
          this.shape.setFill(UIVertex.unColor);
          this.shape.show();
          break;
      }
    });

    this.vertex.updateUI();
  }

  reposition() {
    var draw = Game.getVirtualPoint(this.p);
    this.shape.setPosition(draw.x, draw.y);
  }

  reset() {
    this.vertex.reset();
  }
}
