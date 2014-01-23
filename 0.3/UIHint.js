var UIHint = (function () {
    function UIHint(name, p, es) {
        var _this = this;
        this.name = name;
        this.text = null;
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

        this.hint = new Hint(this.name, es.map(function (e) {
            return e.edge;
        }), function () {
            _this.text.setFill(_this.hint.valid() !== false ? UIHint.yesColor : UIHint.noColor);
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
        this.hint.updateUI();
    };

    UIHint.prototype.reposition = function () {
        var draw = Game.getVirtualPoint(this.p).add(this.drawSize.scaled(-0.5));
        this.text.setPosition(draw.x, draw.y);
    };

    UIHint.prototype.reset = function () {
        this.hint.reset();
    };
    UIHint.fontSize = 20;
    UIHint.fontFamily = 'Calibri';
    UIHint.yesColor = 'white';
    UIHint.noColor = 'red';
    return UIHint;
})();
