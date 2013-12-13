interface LogicElement {
  // False if not possible to be logically correct
  // Null if remaining unknowns and posibly logically correct depending on how unknowns chosen
  // True if logically correct and all inputs known
  valid(): boolean;
}

class Vertex implements LogicElement {
  public surroundings: Edge[] = [];
  constructor(public name: string, public updateUI: () => void) {
    Logic.vertices.push(this);
  }

  connectedSelected(from: Edge): Edge[] {
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

    var found: Edge[] = [];
    for (var i = 0; i < this.surroundings.length; ++i) {
      var to = this.surroundings[i];
      if (to.selected === true && to !== from)
        found.push(to);
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
  
  static uniqueId = 1; //don't start at 0 because falsy
  public id: number;

  constructor(public name: string, public v1: Vertex, public v2: Vertex, public updateUI: () => void) {
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

    var v1Edges: { [name: string]: Edge } = {};
    this.allConnectedSearch(this.v2, v1Edges);
    var v1Count = 0;
    var v1Id: number = null;
    for (var key in v1Edges) {
      ++v1Count;
      if (!v1Id) 
        v1Id = v1Edges[key].id;
    }

    var v2Edges: { [name: string]: Edge } = {};
    this.allConnectedSearch(this.v1, v2Edges);
    var v2Count = 0;
    var v2Id: number = null;
    for (var key in v2Edges) {
      ++v2Count;
      if (!v2Id)
        v2Id = v2Edges[key].id;
    }

    if (v1Count && v2Count) {
      var reassignV2 = v1Count > v2Count;
      var toAssignEdges = reassignV2 ? v2Edges : v1Edges;
      if (newSelected === true) {
        this.id = reassignV2 ? v1Id : v2Id;
        if (v1Id === v2Id) { //just created a loop
          //TODO did you win or not?
        } else {
          for (var key in toAssignEdges) {
            toAssignEdges[key].id = this.id;
            toAssignEdges[key].updateUI();
          }
        }
      } else {
        var toAssignId = Edge.uniqueId++;
        for (var key in toAssignEdges) { //TODO refactor into above code?
          toAssignEdges[key].id = toAssignId;
          toAssignEdges[key].updateUI();
        }
      }
    } else if (newSelected === true) {
      this.id = v1Id || v2Id;
      if(this.id === null)
        this.id = Edge.uniqueId++;
    }
    //TODO#5 if a fork has become valid, fix up IDs
    
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
  }

  valid(): boolean {
    return this.selected === null ? null : true;
  }

  allConnectedSearch(from: Vertex, edges: {[name: string]: Edge}) {
    var toV = from === this.v1 ? this.v2 : this.v1;

    var toEdges = toV.connectedSelected(this);
    for (var i = 0; i < toEdges.length; ++i) {
      var to = toEdges[i];
      if (!edges[to.name]) {
        edges[to.name] = to;
        to.allConnectedSearch(toV, edges);
      }
    }
  }
}

class Hint implements LogicElement {
  public num: number;
  constructor(public name: string, public surroundings: Edge[], public updateUI: () => void) {
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
