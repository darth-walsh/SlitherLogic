interface LogicElement {
  // False if not possible to be logically correct
  // Null if remaining unknowns and posibly logically correct depending on how unknowns chosen
  // True if logically correct and all inputs known
  valid(): boolean;
}

class Vertex implements LogicElement {
  public surroundings: Edge[] = [];
  constructor(public updateUI: () => void) {
    Logic.vertices.push(this);
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
  private _selected: boolean = null;
  public hints: Hint[] = [];

  constructor(public v1: Vertex, public v2: Vertex, public updateUI: () => void) {
    v1.surroundings.push(this);
    v2.surroundings.push(this);

    Logic.edges.push(this);
    Logic.Unknown();
  }

  get selected(): boolean {
    return this._selected;
  }
  set selected(newSelected: boolean) {
    var oldSelected = this._selected;
    
    this._selected = newSelected;
    this.v1.updateUI();
    this.v2.updateUI();
    for (var i = 0; i < this.hints.length; ++i)
      this.hints[i].updateUI();
    this.updateUI(); //causes draw, so put last

    if (oldSelected === null && newSelected !== null)
      Logic.Known();
    else if (oldSelected !== null && newSelected === null)
      Logic.Unknown();
  }

  valid(): boolean {
    return this.selected === null ? null : true;
  }
}

class Hint implements LogicElement {
  public num: number;
  constructor(public surroundings: Edge[], public updateUI: () => void) {
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
