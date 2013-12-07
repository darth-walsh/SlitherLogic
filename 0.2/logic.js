var Vertex = (function () {
    function Vertex(updateUI) {
        this.updateUI = updateUI;
        this.surroundings = [];
        Logic.vertices.push(this);
    }
    Vertex.prototype.valid = function () {
        var yesCount = 0;
        var unCount = 0;
        for (var i = 0; i < this.surroundings.length; ++i) {
            switch (this.surroundings[i].selected) {
                case true:
                    ++yesCount;
                    break;
                case null:
                    ++unCount;
            }
        }
        return yesCount <= 2 && !(yesCount === 1 && unCount === 0);
    };
    return Vertex;
})();

var Edge = (function () {
    function Edge(v1, v2, updateUI) {
        this.v1 = v1;
        this.v2 = v2;
        this.updateUI = updateUI;
        this._selected = null;
        this.hints = [];
        v1.surroundings.push(this);
        v2.surroundings.push(this);

        Logic.edges.push(this);
        Logic.Unknown();
    }
    Object.defineProperty(Edge.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (newSelected) {
            var oldSelected = this._selected;

            this._selected = newSelected;
            this.v1.updateUI();
            this.v2.updateUI();
            for (var i = 0; i < this.hints.length; ++i)
                this.hints[i].updateUI();
            this.updateUI();

            if (oldSelected === null && newSelected !== null)
                Logic.Known();
            else if (oldSelected !== null && newSelected === null)
                Logic.Unknown();
        },
        enumerable: true,
        configurable: true
    });
    return Edge;
})();

var Hint = (function () {
    function Hint(surroundings, updateUI) {
        this.surroundings = surroundings;
        this.updateUI = updateUI;
        for (var i = 0; i < surroundings.length; ++i)
            surroundings[i].hints.push(this);
    }
    Hint.prototype.valid = function () {
        var yesCount = 0;
        var unCount = 0;
        for (var i = 0; i < this.surroundings.length; ++i) {
            switch (this.surroundings[i].selected) {
                case true:
                    ++yesCount;
                    break;
                case null:
                    ++unCount;
            }
        }
        return yesCount <= this.num && this.num <= yesCount + unCount;
    };
    return Hint;
})();

var Logic = (function () {
    function Logic() {
    }
    Logic.Unknown = function () {
        ++Logic.unknown;
    };
    Logic.Known = function () {
        --Logic.unknown;

        if (Logic.unknown === 0) {
            var done = true;
            for (var i = 0; i < Logic.vertices.length; ++i)
                if (!Logic.vertices[i].valid())
                    done = false;
            for (var i = 0; i < Logic.edges.length; ++i)
                if (Logic.edges[i].selected === null)
                    done = false;
            for (var i = 0; i < Logic.hints.length; ++i)
                if (!Logic.hints[i].valid())
                    done = false;

            if (done)
                alert('You win!');
        }
    };
    Logic.unknown = 0;

    Logic.vertices = [];
    Logic.edges = [];
    Logic.hints = [];
    return Logic;
})();
