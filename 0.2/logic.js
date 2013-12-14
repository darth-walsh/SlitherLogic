var Vertex = (function () {
    function Vertex(name, updateUI) {
        this.name = name;
        this.updateUI = updateUI;
        this.surroundings = [];
        Logic.vertices.push(this);
    }
    Vertex.prototype.connectedSelected = function (from) {
        var fromV;
        if (this === from.v1)
            if (this === from.v2)
                throw "Edges can't be a loop";
            else
                fromV = from.v2;
        else if (this === from.v2)
            fromV = from.v1;
        else
            throw "Edge didn't connect to this Vertex";

        var found = [];
        for (var i = 0; i < this.surroundings.length; ++i) {
            var to = this.surroundings[i];
            if (to.selected === true && to !== from)
                found.push(to);
        }

        return found;
    };

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
        var possible = yesCount <= 2 && !(yesCount === 1 && unCount === 0);
        if (unCount !== 0 && possible)
            return null;
        return possible;
    };
    return Vertex;
})();

var Edge = (function () {
    function Edge(name, v1, v2, updateUI) {
        this.name = name;
        this.v1 = v1;
        this.v2 = v2;
        this.updateUI = updateUI;
        this.hints = [];
        this._selected = null;
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
            if (this._selected === newSelected)
                return;

            if (this._selected || newSelected) {
                var v1Edges = {};
                this.allConnectedSearch(this.v2, v1Edges);
                var v1Count = 0;
                var v1Id = null;
                for (var key in v1Edges) {
                    ++v1Count;
                    if (!v1Id)
                        v1Id = v1Edges[key].id;
                }

                var v2Edges = {};
                this.allConnectedSearch(this.v1, v2Edges);
                var v2Count = 0;
                var v2Id = null;
                for (var key in v2Edges) {
                    ++v2Count;
                    if (!v2Id)
                        v2Id = v2Edges[key].id;
                }

                if (v1Count && v2Count) {
                    var reassignV2 = v1Count > v2Count;
                    var toAssignEdges = reassignV2 ? v2Edges : v1Edges;
                    var toAssignId = newSelected === true ? (reassignV2 ? v1Id : v2Id) : Edge.uniqueId++;

                    this.id = toAssignId;
                    for (var key in toAssignEdges) {
                        toAssignEdges[key].id = toAssignId;
                        toAssignEdges[key].updateUI();
                    }
                } else if (newSelected === true) {
                    this.id = v1Id || v2Id;
                    if (this.id === null)
                        this.id = Edge.uniqueId++;
                }
            }

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

    Edge.prototype.valid = function () {
        return this.selected === null ? null : true;
    };

    Edge.prototype.allConnectedSearch = function (from, edges) {
        var toV = from === this.v1 ? this.v2 : this.v1;

        var toEdges = toV.connectedSelected(this);
        for (var i = 0; i < toEdges.length; ++i) {
            var to = toEdges[i];
            if (!edges[to.name]) {
                edges[to.name] = to;
                to.allConnectedSearch(toV, edges);
            }
        }
    };
    Edge.uniqueId = 1;
    return Edge;
})();

var Hint = (function () {
    function Hint(name, surroundings, updateUI) {
        this.name = name;
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
        var possible = yesCount <= this.num && this.num <= yesCount + unCount;
        if (unCount !== 0 && possible)
            return null;
        return possible;
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

        var loopId = null;

        if (Logic.unknown === 0) {
            var done = true;
            for (var i = 0; i < Logic.vertices.length && done; ++i)
                if (Logic.vertices[i].valid() !== true)
                    done = false;

            for (var i = 0; i < Logic.edges.length; ++i) {
                var edge = Logic.edges[i];
                if (edge.valid() !== true)
                    done = false;
                if (edge.selected)
                    if (edge.id !== loopId)
                        if (loopId === null)
                            loopId = edge.id;
                        else
                            done = false;
            }

            for (var i = 0; i < Logic.hints.length && done; ++i)
                if (Logic.hints[i].valid() !== true)
                    done = false;

            if (done) {
                Game.layer.draw();
                alert('You win!');
            }
        }
    };
    Logic.unknown = 0;

    Logic.vertices = [];
    Logic.edges = [];
    Logic.hints = [];
    return Logic;
})();
