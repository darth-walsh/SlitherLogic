/// <reference path="lib\jquery.d.ts" />
/// <reference path="lib\kinetic.d.ts" />

declare var requestAnimFrame: (f: () => any) => any; //TODO#12 delete?

class Point {
  constructor(public x: number = 0, public y: number = 0) { }
  static from(o) {
    if (o.hasOwnProperty('x') && o.hasOwnProperty('y'))
      return new Point(o.x, o.y);
    throw "Can't make Point from: " + JSON.stringify(o);
  }
  scaled(s: number): Point {
    return new Point(this.x * s, this.y * s);
  }
  add(p: Point): Point{
    return new Point(this.x + p.x, this.y + p.y);
  }
}

//TODO#2 put into UI.ts
class UIVertex {
  static radius = 7;
  static yesColor = 'white';
  static noColor = 'red';

  vertex: Vertex;
  p: Point;
  shape: Kinetic.Circle;

  constructor(o) {
    this.shape = new Kinetic.Circle({
      radius: UIVertex.radius,
    });
    Game.layer.add(this.shape);
    this.shape.setZIndex(1);

    this.p = Point.from(o);
    this.vertex = new Vertex(() => {
      this.shape.setFill(this.vertex.valid() ? UIVertex.yesColor : UIVertex.noColor);
    });

    this.vertex.updateUI();
  }

  reposition() {
    var draw = Game.getVirtualPoint(this.p);
    this.shape.setPosition(draw.x, draw.y);
  }
}

class UIEdge {
  static yesWidth = 5;
  static noWidth = 2;
  static unWidth = 3;

  yesColor: string;
  static noColor = '#222';
  static unColor = 'white';

  shape: Kinetic.Line;
  edge: Edge;

  constructor(private v1: UIVertex, private v2: UIVertex) {
    this.shape = new Kinetic.Line({
      points: [0, 0],
      lineCap: 'round',
      dashArray: [1, UIEdge.unWidth * 2]
    });
    //TODO#3 hit region

    this.shape.on('click', (...evts: MouseEvent[]) => {
      var evt = evts[0];
      if (evt.which == 2) // middle
        return;

      if (this.edge.selected !== null)
        this.edge.selected = null;
      else
        this.edge.selected = evt.which == 1; // left
      
      return {};
    });
    Game.layer.add(this.shape);
    this.shape.setZIndex(0);

    this.yesColor = UIEdge.getRandomColor();
    this.edge = new Edge(v1.vertex, v2.vertex, () => {
      switch (this.edge.selected) {
        case true:
          this.shape.setDashArrayEnabled(false);
          this.shape.setStroke(this.yesColor);
          this.shape.setStrokeWidth(UIEdge.yesWidth);
          break;
        case false:
          this.shape.setDashArrayEnabled(false);
          this.shape.setStroke(UIEdge.noColor);
          this.shape.setStrokeWidth(UIEdge.noWidth);
          break;
        case null:
          this.shape.setDashArrayEnabled(true);
          this.shape.setStroke(UIEdge.unColor);
          this.shape.setStrokeWidth(UIEdge.unWidth);
          break;
      }
      Game.layer.draw(); //TODO#4 figure out better draw?
    });
    this.edge.updateUI();
  }

  reposition() {
    var draw1 = Game.getVirtualPoint(this.v1.p);
    var draw2 = Game.getVirtualPoint(this.v2.p);
    this.shape.setPoints([draw1.x, draw1.y, draw2.x, draw2.y]);
  }

  static getRandomColor(): string {
    //return UIEdge.rainbow(36, Math.floor(Math.random() * 36));
    return 'blue'; //TODO#5 color stuff the color of adjacent lines
    //return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  // http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
  static rainbow(numOfSteps: number, step: number): string {
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch (i % 6) {
      case 0: r = 1, g = f, b = 0; break;
      case 1: r = q, g = 1, b = 0; break;
      case 2: r = 0, g = 1, b = f; break;
      case 3: r = 0, g = q, b = 1; break;
      case 4: r = f, g = 0, b = 1; break;
      case 5: r = 1, g = 0, b = q; break;
    }
    return "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  }
}

class UIHint {
  static fontSize = 20;
  static fontFamily = 'Calibri';
  static yesColor = 'white';
  static noColor = 'red';

  p: Point;
  drawSize: Point;
  num: number;

  text: Kinetic.Text = null;
  hint: Hint;

  constructor(p, es: Array<UIEdge>) {
    this.p = Point.from(p);
    this.drawSize = new Point();

    this.text = new Kinetic.Text({
      text: ' ',
      fontSize: UIHint.fontSize,
      fontFamily: UIHint.fontFamily,
      fill: UIHint.yesColor
    });

    Game.layer.add(this.text);

    this.hint = new Hint(es.map(e => e.edge), () => {
      this.text.setFill(this.hint.valid() ? UIHint.yesColor : UIHint.noColor);
    });
  }

  setNum(s: string) {
    if (s !== ' ') {
      this.num = parseInt(s, 36);
      this.hint.num = this.num;
      s = '' + this.num;
    }

    this.text.setText(s);
    this.drawSize.x = this.text.getTextWidth();
    this.drawSize.y = this.text.getTextHeight();

    this.reposition();
  }

  reposition() {
    var draw = Game.getVirtualPoint(this.p).add(this.drawSize.scaled(-0.5));
    this.text.setPosition(draw.x, draw.y);
  }
}

class Game {
  static puzzleUL: Point;
  static puzzleLR: Point;
  static vertices: { [name: string]: UIVertex; };
  static edges: { [name: string]: UIEdge; };
  static hints: { [name: string]: UIHint; };

  static android: boolean;
  static ios: boolean;

  static stage: Kinetic.Stage;
  static layer: Kinetic.Layer;

  static init() {
    var ua = navigator.userAgent.toLowerCase();
    Game.android = ua.indexOf('android') > -1;
    Game.ios = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);

    window.addEventListener('click', function (e) {
      Game.onResize();
      e.preventDefault();
    }, false);
    //listen for touches
    window.addEventListener('touchstart', function (e) {
      e.preventDefault();
      //TODO#6 add input GAME.Input.set(e.touches[0])? Figure out what happens on mobile
    }, false);
    window.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, false);
    window.addEventListener('touchend', function (e) {
      e.preventDefault();
    }, false);

    Game.stage = new Kinetic.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight
    });

    Game.loadLevel('data/test/level.json');
  }

  static loadLevel(url: string) {
    Game.layer = new Kinetic.Layer();
    Game.stage.add(Game.layer);

    //TODO#7 clean out circular references?
    Game.vertices = {};
    Game.edges = {};
    Game.hints = {};

    Game.puzzleUL = new Point();
    Game.puzzleLR = new Point();

    $.getJSON(url).then(function (level) {
      for (var v in level.vertices) {
        Game.vertices[v] = new UIVertex(level.vertices[v]);
      }//TODO#9 fail case

      for (var e in level.edges) {
        var edge = level.edges[e];
        Game.edges[e] = new UIEdge(Game.vertices[edge[0]], Game.vertices[edge[1]]);
      }

      for (var h in level.hints) {
        var hint = level.hints[h];
        Game.hints[h] = new UIHint(hint.position, hint.edges.map(e => Game.edges[e]));
      }

      //TODO#8 persist which puzzles the user has finished
      Game.loadPuzzle('data/test/1.txt');

      //Game.loop(); //TODO#12 delete?
      Game.resize();
    });
  }

  static loadPuzzle(url: string) {
    $.get(url, hints => { //TODO#1 strip hints of newlines
      hints = hints.replace(/[\r\n]/g, "");
      for (var i = 0; i < hints.length; ++i)
        Game.hints['h' + i].setNum(hints.charAt(i)); 
      Game.layer.draw();
    }); //TODO#9 fail case
  }

  static resizing: boolean = false;
  static lastResize: number;
  static onResize() {
    clearTimeout(Game.lastResize);
    Game.lastResize = setTimeout(Game.resize, 100);

    if (!Game.resizing) {
      Game.resize();
      Game.resizing = true;
      setTimeout(function () {
        Game.resizing = false;
      }, 100);
    }
  }

  static resize() {
    $('#container').css('height', window.innerHeight - 20);

    Game.stage.setWidth($('#container').width());
    Game.stage.setHeight($('#container').height());

    //TODO#10 use Game.ios||android

    for (var v in Game.vertices) {
      Game.vertices[v].reposition();
    }

    for (var e in Game.edges) {
      Game.edges[e].reposition();
    }

    for (var h in Game.hints) {
      Game.hints[h].reposition();
    }

    Game.layer.draw();
  }

  //static resize() {
  //  if (Game.android || Game.ios)
  //    document.body.style.height = (window.innerHeight + 50) + 'px';

  //  Game.canvas.style.width = Game.currentSize.width + 'px';
  //  Game.canvas.style.height = Game.currentSize.height + 'px';

  //  Game.scale = Game.currentSize.width / Game.size.width;
  //  Game.offset.x = Game.canvas.offsetTop;
  //  Game.offset.y = Game.canvas.offsetLeft;

  //  window.setTimeout(() => window.scrollTo(0, 1), 1);
  //}

  static getVirtualPoint(p: Point): Point {
    return new Point(p.x * 30 + 60, p.y * 30 + 60); //TODO#11 variable size logic
  }

  static loop() {
    requestAnimFrame(Game.loop);

    //TODO#12 delete?
  }
}

window.addEventListener('load', Game.init, false);
window.addEventListener('resize', Game.onResize, false);
window.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});