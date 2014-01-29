var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Logic = (function () {
    function Logic() {
    }
    Logic.init = function () {
        Logic.logics.push(new VictoryLogic());
        Logic.logics.push(new VertexLogic());
        Logic.logics.push(new HintLogic());
    };

    Logic.destroy = function () {
        Logic.edgeQueue.length = 0;
        Logic.vertices.length = 0;
        Logic.edges.length = 0;
        Logic.hints.length = 0;
        Logic.logics.length = 0;
    };

    Logic.reset = function () {
        for (var i = 0; i < Logic.logics.length; ++i)
            Logic.logics[i]._reset();
    };

    Logic.changed = function (edge) {
        for (var i = 0; i < Logic.logics.length; ++i)
            Logic.logics[i]._changed(edge);
    };

    Logic.setEdge = function (setTo, edges) {
        if (setTo !== null)
            for (var i = 0; i < edges.length; ++i)
                Logic.edgeQueue.push({ setTo: setTo, edge: edges[i] });

        while (Logic.edgeQueue.length > 0) {
            var toSet = Logic.edgeQueue.shift();
            toSet.edge.selected = toSet.setTo;
        }
    };

    Logic.prototype._changed = function (edge) {
        throw "Logic._changed() is abstract and shouldn't be called";
    };
    Logic.prototype._reset = function () {
    };
    Logic.edgeQueue = [];

    Logic.vertices = [];
    Logic.edges = [];
    Logic.hints = [];

    Logic.logics = [];
    return Logic;
})();

var VictoryLogic = (function (_super) {
    __extends(VictoryLogic, _super);
    function VictoryLogic() {
        _super.call(this);
        this._reset();
    }
    VictoryLogic.prototype._reset = function () {
        this.unknown = Logic.edges.length;
    };

    VictoryLogic.prototype._changed = function (edge) {
        if (edge.valid() === null)
            ++this.unknown;
        else {
            --this.unknown;
            this.tryVictory();
        }
    };

    VictoryLogic.prototype.tryVictory = function () {
        var loopId = null;

        if (this.unknown === 0) {
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

            if (done)
                VictoryLogic.onVictory();
        }
    };
    return VictoryLogic;
})(Logic);

var VertexLogic = (function (_super) {
    __extends(VertexLogic, _super);
    function VertexLogic() {
        _super.apply(this, arguments);
    }
    VertexLogic.prototype._changed = function (edge) {
        this.vertexLogic(edge.v1);
        this.vertexLogic(edge.v2);
    };

    VertexLogic.prototype.vertexLogic = function (vertex) {
        var yesEdges = [];
        var noEdges = [];
        var nullEdges = [];

        for (var i = 0; i < vertex.surroundings.length; ++i) {
            var e = vertex.surroundings[i];
            switch (e.selected) {
                case true:
                    yesEdges.push(e);
                    break;
                case false:
                    noEdges.push(e);
                    break;
                case null:
                    nullEdges.push(e);
                    break;
            }
        }

        var setTo = null;
        if (yesEdges.length === 2 || yesEdges.length === 0 && nullEdges.length === 1)
            setTo = false;

        if (yesEdges.length === 1 && nullEdges.length === 1)
            setTo = true;

        Logic.setEdge(setTo, nullEdges);
    };
    return VertexLogic;
})(Logic);

var HintLogic = (function (_super) {
    __extends(HintLogic, _super);
    function HintLogic() {
        _super.apply(this, arguments);
    }
    HintLogic.prototype._changed = function (edge) {
        for (var i = 0; i < edge.hints.length; ++i)
            this.hintLogic(edge.hints[i]);
    };

    HintLogic.prototype.hintLogic = function (hint) {
        var yesEdges = [];
        var noEdges = [];
        var nullEdges = [];

        for (var i = 0; i < hint.surroundings.length; ++i) {
            var e = hint.surroundings[i];
            switch (e.selected) {
                case true:
                    yesEdges.push(e);
                    break;
                case false:
                    noEdges.push(e);
                    break;
                case null:
                    nullEdges.push(e);
                    break;
            }
        }

        var setTo = null;
        if (yesEdges.length + nullEdges.length === hint.num)
            setTo = true;

        if (yesEdges.length === hint.num)
            setTo = false;

        Logic.setEdge(setTo, nullEdges);
    };
    return HintLogic;
})(Logic);
