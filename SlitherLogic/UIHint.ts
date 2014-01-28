/// <reference path="lib\jquery.d.ts" />
/// <reference path="lib\kinetic.d.ts" />

class UIHint implements UIElement {
  static fontSize = 20;
  static fontFamily = 'Calibri';
  static yesColor = 'white';
  static noColor = 'red';

  p: Point;
  drawSize: Point;
  num: number;

  text: Kinetic.Text = null;
  hint: Hint;

  constructor(public name: string, p, es: Array<UIEdge>) {
    this.p = Point.from(p);
    this.drawSize = new Point();

    this.text = new Kinetic.Text({
      text: ' ',
      fontSize: UIHint.fontSize,
      fontFamily: UIHint.fontFamily,
      fill: UIHint.yesColor,
      listening: false
    });

    Game.layer.add(this.text);

    this.hint = new Hint(this.name, es.map(e => e.edge), () => {
      this.text.setFill(this.hint.valid() !== false ? UIHint.yesColor : UIHint.noColor);
    });
  }

  destroy() {
    this.hint.destroy();
    this.hint = null;
    this.text.destroy();
    this.drawSize = null;
    this.p = null;
  }

  setNum(s: string) {
    if (s !== ' ') {
      this.num = parseInt(s, 36);
      this.hint.num = this.num;
      s = '' + this.num;
    }

    this.text.setText(s);
    this.drawSize.x = this.text.getTextWidth();
    this.drawSize.y = this.text.getTextHeight();

    this.reposition();
    this.hint.updateUI();
  }

  reposition() {
    var draw = Game.getVirtualPoint(this.p).add(this.drawSize.scaled(-0.5));
    this.text.setPosition(draw.x, draw.y);
  }

  reset() {
    this.hint.reset();
  }
}
