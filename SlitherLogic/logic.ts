class Vertex {
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
    return yesCount <= 2 && !(yesCount === 1 && unCount === 0);
  }
}

class Edge {
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
}

class Hint {
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
    return yesCount <= this.num && this.num <= yesCount + unCount ;
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
        if (!Logic.vertices[i].valid())
          done = false;
      for (var i = 0; i < Logic.edges.length; ++i)
        if (Logic.edges[i].selected === null)
          done = false; //TODO#13 harden so we feel comfortable this won't happen
      for (var i = 0; i < Logic.hints.length; ++i)
        if (!Logic.hints[i].valid())
          done = false;

      if (done)
        alert('You win!');
    }
  }

  public static vertices: Vertex[] = [];
  public static edges: Edge[] = [];
  public static hints: Hint[] = [];
}
