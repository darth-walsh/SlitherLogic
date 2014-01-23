class Logic {
  public static init() {
    Logic.logics.push(new VictoryLogic());
    Logic.logics.push(new VertexLogic());
    Logic.logics.push(new HintLogic());
  }

  public static reset() {
    for (var i = 0; i < Logic.logics.length; ++i)
      Logic.logics[i]._reset();
  }

  public static changed(edge: Edge) {
    for (var i = 0; i < Logic.logics.length; ++i)
      Logic.logics[i]._changed(edge);
  }

  private static edgeQueue: { setTo: boolean; edge: Edge }[] = [];
  //TODO#22 make async?
  public static setEdge(setTo: boolean, edges: Edge[]) {
    if (setTo !== null)
      for (var i = 0; i < edges.length; ++i)
        Logic.edgeQueue.push({ setTo: setTo, edge: edges[i] });

    while (Logic.edgeQueue.length > 0) {
      var toSet = Logic.edgeQueue.shift();
      toSet.edge.selected = toSet.setTo;
    }
  }

  public _changed(edge: Edge) {
    throw "Logic._changed() is abstract and shouldn't be called";
  }
  public _reset() {
    // virtual nothing to do
  }

  public static vertices: Vertex[] = [];
  public static edges: Edge[] = [];
  public static hints: Hint[] = [];

  private static logics: Logic[] = [];
}

class VictoryLogic extends Logic {
  private unknown:number;

  public static onVictory: () => void;

  constructor() {
    super();
    this._reset();
  }

  public _reset() {
    this.unknown = Logic.edges.length
  }

  public _changed(edge: Edge) {
    if (edge.valid() === null)
      ++this.unknown;
    else {
      --this.unknown;
      this.tryVictory();
    }
  }

  tryVictory() {
    var loopId = null;
    
    if (this.unknown === 0) {
      var done = true;
      for (var i = 0; i < VictoryLogic.vertices.length && done; ++i)
        if (VictoryLogic.vertices[i].valid() !== true)
          done = false;

      for (var i = 0; i < VictoryLogic.edges.length; ++i) {
        var edge = VictoryLogic.edges[i]
        if (edge.valid() !== true)
          done = false; //TODO#13 harden so we feel comfortable this won't happen
        if (edge.selected)
          if (edge.id !== loopId)
            if (loopId === null)
              loopId = edge.id;
            else
              done = false;
      }

      for (var i = 0; i < VictoryLogic.hints.length && done; ++i)
        if (VictoryLogic.hints[i].valid() !== true)
          done = false;

      if (done)
        VictoryLogic.onVictory();
    }
  }
}

class VertexLogic extends Logic {
  public _changed(edge: Edge) {
    this.vertexLogic(edge.v1);
    this.vertexLogic(edge.v2);
  }

  private vertexLogic(vertex: Vertex) {
    var yesEdges: Edge[] = [];
    var noEdges: Edge[] = [];
    var nullEdges: Edge[] = [];

    for (var i = 0; i < vertex.surroundings.length; ++i) {
      var e = vertex.surroundings[i];
      switch (e.selected) {
        case true: yesEdges.push(e); break;
        case false: noEdges.push(e); break;
        case null: nullEdges.push(e); break;
      }
    }

    var setTo: boolean = null;
    if (yesEdges.length === 2 || yesEdges.length === 0 && nullEdges.length === 1)
      setTo = false;

    if (yesEdges.length === 1 && nullEdges.length === 1)
      setTo = true;

    Logic.setEdge(setTo, nullEdges);
  }
}

class HintLogic extends Logic {
  public _changed(edge: Edge) {
    for (var i = 0; i < edge.hints.length; ++i)
      this.hintLogic(edge.hints[i]);
  }

  private hintLogic(hint: Hint) {
    var yesEdges: Edge[] = [];
    var noEdges: Edge[] = [];
    var nullEdges: Edge[] = [];

    for (var i = 0; i < hint.surroundings.length; ++i) {
      var e = hint.surroundings[i];
      switch (e.selected) {
        case true: yesEdges.push(e); break;
        case false: noEdges.push(e); break;
        case null: nullEdges.push(e); break;
      }
    }

    var setTo: boolean = null;
    if (yesEdges.length + nullEdges.length === hint.num)
      setTo = true;

    if (yesEdges.length === hint.num)
      setTo = false;

    Logic.setEdge(setTo, nullEdges);
  }
}
