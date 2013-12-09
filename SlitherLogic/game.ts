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

class Game {
  static puzzleTL: Point;
  static puzzleBR: Point;
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

    Game.loadLevel('data/square_7_7/level.json');
  }

  static loadLevel(url: string) {
    Game.layer = new Kinetic.Layer();
    Game.stage.add(Game.layer);

    //TODO#7 clean out circular references?
    Game.vertices = {};
    Game.edges = {};
    Game.hints = {};

    Game.puzzleTL = new Point();
    Game.puzzleBR = new Point(-1e4, -1e4);

    $.getJSON(url).then(function (level) {
      for (var v in level.vertices) {
        Game.vertices[v] = new UIVertex(level.vertices[v]);
        Game.puzzleTL.x = Math.min(Game.puzzleTL.x, Game.vertices[v].p.x);
        Game.puzzleTL.y = Math.min(Game.puzzleTL.y, Game.vertices[v].p.y);
        Game.puzzleBR.x = Math.max(Game.puzzleBR.x, Game.vertices[v].p.x);
        Game.puzzleBR.y = Math.max(Game.puzzleBR.y, Game.vertices[v].p.y);
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
      Game.loadPuzzle('data/square_7_7/1.txt');

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
    var container = $('#container');
    container.css('height', window.innerHeight - 20);

    Game.stage.setWidth(container.width());
    Game.stage.setHeight(container.height());

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

  static margin = 50;
  static getVirtualPoint(p: Point): Point {
    var xRatio = (Game.stage.getWidth() - 2 * Game.margin) / (Game.puzzleBR.x - Game.puzzleTL.x);
    var yRatio = (Game.stage.getHeight() - 2 * Game.margin) / (Game.puzzleBR.y - Game.puzzleTL.y);

    return new Point(Math.floor(p.x * xRatio) + Game.margin, Math.floor(p.y * yRatio) + Game.margin);
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