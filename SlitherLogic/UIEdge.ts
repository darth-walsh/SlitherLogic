/// <reference path="lib\jquery.d.ts" />
/// <reference path="lib\kinetic.d.ts" />

class UIEdge {
  static yesWidth = 5;
  static noWidth = 2;
  static unWidth = 2;
  static hitWidth = 25;

  get yesColor(): string {
    // 24 steps is nice, but we want to avoid steps 0,1,2,22,23 because they are too red
    // Generate a number ranged 0 - 18 and add 3
    var step = (this.edge.id * 3 ) % 19
    return UIEdge.rainbow(24, step + 3);
  }
  static noColor = '#222';
  static unColor = 'white';

  shape: Kinetic.Line;
  edge: Edge;
  hit1: Point;
  hit2: Point;

  constructor(public name: string, private v1: UIVertex, private v2: UIVertex) {
    var thisEdge = this;
    this.shape = new Kinetic.Line({
      points: [0, 0],
      lineCap: 'round',
      dashArray: [1, UIEdge.unWidth * 4],
      //http://stackoverflow.com/a/17746563/771768
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

    //TODO#6 handle tap, and add dblclick dbltap logic that works?
    this.shape.on('click', (...evts: MouseEvent[]) => {
      var evt = evts[0];
      if (evt.which === 2) // middle
        return;

      if (Game.menuLayer.getVisible())
        return;

      if (this.edge.selected !== null)
        this.edge.selected = null;
      else
        this.edge.selected = evt.which === 1; // left

      Game.layer.drawScene();
    });
    Game.edgeSibs.add(this.shape);
    
    this.edge = new Edge(this.name, v1.vertex, v2.vertex, () => {
      switch (this.edge.selected) {
        case true:
          this.shape.setDashArrayEnabled(false);
          this.shape.setStroke(this.yesColor);
          this.shape.moveToTop();
          break;
        case false:
          this.shape.setDashArrayEnabled(false);
          this.shape.setStroke(UIEdge.noColor);
          this.shape.moveToBottom();
          break;
        case null:
          this.shape.setDashArrayEnabled(true);
          this.shape.setStroke(UIEdge.unColor);
          break;
      }
      this.shape.setStrokeWidth(this.strokeWidth);
    });
    this.edge.updateUI();
  }

  get strokeWidth(): number {
    switch (this.edge.selected) {
      case true:
        return UIEdge.yesWidth;
      case false:
        return UIEdge.noWidth;
      case null:
        return UIEdge.unWidth;
    }
  }

  reposition() {
    var draw1 = Game.getVirtualPoint(this.v1.p);
    var draw2 = Game.getVirtualPoint(this.v2.p);
    this.shape.setPoints([draw1.x, draw1.y, draw2.x, draw2.y]);
  }

  reset() {
    this.edge.selected = null;
  }

  setHints() {
    var l = this.edge.hints.length
    if (l == 0 || l > 2)
      throw this.name + ": doesn't have 1 or 2 edges";

    this.hit1 = Game.hints[this.edge.hints[0].name].p;
    if (l === 2)
      this.hit2 = Game.hints[this.edge.hints[1].name].p
    else {
      if (Game.level === 'dodec') {
        // special case the inferred hint location to be closer
        var x = 0.1547; // = 1/(3+2sqrt(3))
        this.hit2 = this.v1.p.add(this.v2.p).scaled((1 + x) / 2)
          .sub(this.hit1.scaled(x));
      }
      else
        // mid = 0.5(v1 + v2)
        // h2 = mid + (mid - h1) = v1 + v2 - h1
        this.hit2 = this.v1.p.add(this.v2.p).sub(this.hit1);
    }
  }

  // http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
  static rainbow(numOfSteps: number, step: number): string {
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch (i % 6) {
      case 0: r = 1, g = f, b = 0; break;
      case 1: r = q, g = 1, b = 0; break;
      case 2: r = 0, g = 1, b = f; break;
      case 3: r = 0, g = q, b = 1; break;
      case 4: r = f, g = 0, b = 1; break;
      case 5: r = 1, g = 0, b = q; break;
    }
    return "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  }
}
