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
  add(p: Point): Point {
    return new Point(this.x + p.x, this.y + p.y);
  }
  sub(p: Point): Point {
    return this.add(p.scaled(-1));
  }
}

class Game {
  static puzzleTL: Point;
  static puzzleBR: Point;
  static vertices: { [name: string]: UIVertex; };
  static edges: { [name: string]: UIEdge; };
  static hints: { [name: string]: UIHint; };

  static level = 'hex';

  static get levelFolder(): string {
    return 'data/' + Game.level + '/';
  }

  static _currentPuzzle = 0;
  static get currentPuzzle(): number {
    return localStorage && localStorage[Game.level] || Game._currentPuzzle;
  }
  static set currentPuzzle(n: number) {
    Game._currentPuzzle = n;
    if (localStorage)
      localStorage[Game.level] = n;
  }

  static android: boolean;
  static ios: boolean;

  static stage: Kinetic.Stage;
  static layer: Kinetic.Layer;
  static edgeSibs: Kinetic.Group;

  static menuLayer: Kinetic.Layer;
  static newButton: Kinetic.Rect;
  static newText: Kinetic.Text;

  static init() {
    var ua = navigator.userAgent.toLowerCase();
    Game.android = ua.indexOf('android') > -1;
    Game.ios = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);

    window.addEventListener('click', function (e) {
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

    Game.menuLayer = new Kinetic.Layer();
    Game.newButton = new Kinetic.Rect({
      x: -50,
      width: 100,
      y: -25,
      height: 50,
      fill: 'black',
      stroke: 'green',
      strokeWidth: 5
    });
    Game.newButton.on('click', () => {
      ++Game.currentPuzzle;
      Game.loadPuzzle(Game.levelFolder);
      for (var e in Game.edges)
        Game.edges[e].reset();
      Game.menuLayer.hide();
      Game.layer.draw();
    });
    Game.newText = new Kinetic.Text({
      text: 'New',
      fontSize: 30,
      fontFamily: 'Calibri',
      fill: 'aqua'
    });
    Game.newText.on('click', () => Game.newButton.fire('click'));
    Game.newText.setX(-Game.newText.getTextWidth() / 2);
    Game.newText.setY(-Game.newText.getTextHeight() / 2);

    Game.menuLayer.add(Game.newButton);
    Game.menuLayer.add(Game.newText);
    Game.stage.add(Game.menuLayer);
    Game.menuLayer.moveToTop();
    Game.menuLayer.hide();

    Logic.onVictory = () => {
      Game.layer.draw();
      Game.menuLayer.show();
      Game.menuLayer.draw();
    };

    Game.loadLevel(Game.levelFolder + 'level.json');
  }

  static loadLevel(url: string) {
    Game.layer = new Kinetic.Layer();
    Game.stage.add(Game.layer);
    Game.layer.moveToBottom();

    Game.edgeSibs = new Kinetic.Group({});
    Game.layer.add(Game.edgeSibs);
    
    //TODO#7 clean out circular references?
    Game.vertices = {};
    Game.edges = {};
    Game.hints = {};

    Game.puzzleTL = new Point( 1e4,  1e4);
    Game.puzzleBR = new Point(-1e4, -1e4);

    $.getJSON(url, level => {
      for (var v in level.vertices) {
        Game.vertices[v] = new UIVertex(v, level.vertices[v]);
        Game.puzzleTL.x = Math.min(Game.puzzleTL.x, Game.vertices[v].p.x);
        Game.puzzleTL.y = Math.min(Game.puzzleTL.y, Game.vertices[v].p.y);
        Game.puzzleBR.x = Math.max(Game.puzzleBR.x, Game.vertices[v].p.x);
        Game.puzzleBR.y = Math.max(Game.puzzleBR.y, Game.vertices[v].p.y);
      }

      for (var e in level.edges) {
        var edge = level.edges[e];
        Game.edges[e] = new UIEdge(e, Game.vertices[edge[0]], Game.vertices[edge[1]]);
      }

      for (var h in level.hints) {
        var hint = level.hints[h];
        Game.hints[h] = new UIHint(h, hint.position, hint.edges.map(e => Game.edges[e]));
      }

      for (var e in Game.edges) {
        Game.edges[e].setHints();
      }

      //TODO#8 persist which puzzles the user has finished
      Game.loadPuzzle(Game.levelFolder);

      //Game.loop(); //TODO#12 delete?
      Game.resize();
    }).fail(() =>
        alert("Can't load " + url + ", sorry."));
  }

  static loadPuzzle(folder: string) {
    var url = folder + Game.currentPuzzle + '.txt';
    $.get(url, hints => {
      hints = hints.replace(/[\r\n]/g, "");
      for (var i = 0; i < hints.length; ++i)
        Game.hints['h' + i].setNum(hints.charAt(i));
      Game.layer.draw();
    }).fail(() => {
        if (confirm("Can't load the puzzle, sorry.\nDo you want to reset your progress (just for the " + Game.level + "level)?")) {
          Game.currentPuzzle = 0;
          Game.loadPuzzle(folder);
        }
      });
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

    Game.menuLayer.setOffset(-Game.stage.getWidth() / 2, -Game.stage.getHeight() / 2);
    Game.layer.setOffset(-Game.stage.getWidth() / 2, -Game.stage.getHeight() / 2);

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

  static margin = 20;
  static getVirtualPoint(p: Point): Point {
    var xRatio = (Game.stage.getWidth() - 2 * Game.margin) / (Game.puzzleBR.x - Game.puzzleTL.x);
    var yRatio = (Game.stage.getHeight() - 2 * Game.margin) / (Game.puzzleBR.y - Game.puzzleTL.y);

    var ratio = Math.min(xRatio, yRatio);
    
    return new Point(Math.floor((p.x - (Game.puzzleBR.x + Game.puzzleTL.x) / 2) * ratio),
                     Math.floor((p.y - (Game.puzzleBR.y + Game.puzzleTL.y) / 2) * ratio));
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