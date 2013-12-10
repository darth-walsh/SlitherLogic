interface LogicElement {
  // False if not possible to be logically correct
  // Null if remaining unknowns and posibly logically correct depending on how unknowns chosen
  // True if logically correct and all inputs known
  valid(): boolean;
}

class Vertex implements LogicElement {
  public surroundings: Edge[] = [];
  constructor(public name: String, public updateUI: () => void) {
    Logic.vertices.push(this);
  }

  connectedSelected(from: Edge): Edge {
    var fromV: Vertex;
    if (this === from.v1)
      if (this === from.v2)
        throw "Edges can't be a loop";
      else
        fromV = from.v2;
    else
      if (this === from.v2)
        fromV = from.v1;
      else
        throw "Edge didn't connect to this Vertex";

    var found: Edge = null;
    for (var i = 0; i < this.surroundings.length; ++i) {
      var to = this.surroundings[i];
      if (to.selected === true && to.v1 !== fromV && to.v2 !== fromV)
        if (found === null)
          found = to;
        else
          return null; // error state: we found multiple edges to go to!
    }

    return found;
  }

  valid(): boolean {
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
    if (unCount === 0 && possible)
      return null;
    return possible;
  }
}

class Edge implements LogicElement {
  public hints: Hint[] = [];
  private _selected: boolean = null;
  
  static uniqueId = 0;
  public id: number;

  constructor(public name: String, public v1: Vertex, public v2: Vertex, public updateUI: () => void) {
    v1.surroundings.push(this);
    v2.surroundings.push(this);

    Logic.edges.push(this);
    Logic.Unknown();
  }

  get selected(): boolean {
    return this._selected;
  }
  set selected(newSelected: boolean) {
    if (this._selected === newSelected)
      return;

    var oldSelected = this._selected;
    this._selected = newSelected;

    var v1Edge = this.v1.connectedSelected(this);
    var v2Edge = this.v2.connectedSelected(this);
    if (v1Edge && v2Edge) {
      var assignId = newSelected === true ? v1Edge.id : Edge.uniqueId++; //TODO pick winner based on longest
      this.id = assignId;
      v2Edge.setLoopId(this, assignId);
    } else if (newSelected === true) {
      if (v1Edge || v2Edge)
        this.id = (v1Edge || v2Edge).id;
      else
        this.id = Edge.uniqueId++;
    }
    
    this.v1.updateUI();
    this.v2.updateUI();
    for (var i = 0; i < this.hints.length; ++i)
      this.hints[i].updateUI();
    this.updateUI();

    if (oldSelected === null && newSelected !== null)
      Logic.Known();
    else if (oldSelected !== null && newSelected === null)
      Logic.Unknown();
  }

  valid(): boolean {
    return this.selected === null ? null : true;
  }

  setLoopId(from: Edge, newId: number) {
    this.id = newId;
    this.updateUI();

    var v1Edge = this.v1.connectedSelected(this);
    var v2Edge = this.v2.connectedSelected(this);
    var nextEdge: Edge;
    if (from === v1Edge && from === v2Edge)
      throw 'Error state';
    else if (from === v1Edge)
      nextEdge = v2Edge;
    else if (from === v2Edge)
      nextEdge = v1Edge;
    else
      nextEdge = v1Edge || v2Edge;

    if (nextEdge)
      nextEdge.setLoopId(this, newId);
  }
}

class Hint implements LogicElement {
  public num: number;
  constructor(public name: String, public surroundings: Edge[], public updateUI: () => void) {
    for (var i = 0; i < surroundings.length; ++i)
      surroundings[i].hints.push(this);
  }

  valid(): boolean {
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
    if (unCount === 0 && possible)
      return null;
    return possible;
  }
}

class Logic {
  private static unknown = 0;

  static Unknown() {
    ++Logic.unknown;
  }
  static Known() {
    --Logic.unknown;

    if (Logic.unknown === 0) {
      var done = true;
      for (var i = 0; i < Logic.vertices.length; ++i)
        if (Logic.vertices[i].valid() !== true)
          done = false;
      for (var i = 0; i < Logic.edges.length; ++i)
        if (Logic.edges[i].valid() !== true)
          done = false; //TODO#13 harden so we feel comfortable this won't happen
      for (var i = 0; i < Logic.hints.length; ++i)
        if (Logic.hints[i].valid() !== true)
          done = false;

      if (done)
        alert('You win!');
    }
  }

  public static vertices: Vertex[] = [];
  public static edges: Edge[] = [];
  public static hints: Hint[] = [];
}
