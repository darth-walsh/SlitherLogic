class Logic {
  private static unknown = 0;

  public static onVictory: () => void;

  static Unknown() {
    ++Logic.unknown;
  }
  static Known() {
    --Logic.unknown;

    var loopId = null;
    
    if (Logic.unknown === 0) {
      var done = true;
      for (var i = 0; i < Logic.vertices.length && done; ++i)
        if (Logic.vertices[i].valid() !== true)
          done = false;

      for (var i = 0; i < Logic.edges.length; ++i) {
        var edge = Logic.edges[i]
        if (edge.valid() !== true)
          done = false; //TODO#13 harden so we feel comfortable this won't happen
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
        Logic.onVictory();
      }
    }
  }

  public static vertices: Vertex[] = [];
  public static edges: Edge[] = [];
  public static hints: Hint[] = [];
}
