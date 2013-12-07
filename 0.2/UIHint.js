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
