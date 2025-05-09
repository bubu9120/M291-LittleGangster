$(function () {
  // Bestehendes Canvas holen
  var canvas = document.getElementById("game-canvas");
  var ctx = canvas.getContext("2d");

  function rand(min, max, interval) {
    if (interval === undefined) interval = 1;
    return (
      Math.round(
        (Math.floor(Math.random() * (max - min + 1)) + min) / interval
      ) * interval
    );
  }

  function randIndex(thearray) {
    return thearray[rand(1, thearray.length) - 1];
  }

  var player = (function () {
    var x = 100,
      y = canvas.height / 2,
      w = 10,
      h = 10,
      speed = 10,
      dead = false,
      death = 0;

    return {
      getX: () => x,
      getY: () => y,
      getW: () => w,
      getH: () => h,
      die: () => {
        dead = true;
        ++death;
      },
      getDeath: () => death,
      resurrect: function () {
        this.moveTo(100, canvas.height / 2);
        dead = false;
        this.draw();
      },
      respawn: function () {
        this.moveTo(100, canvas.height / 2);
        this.draw();
        blocks.nextLevel();
      },
      isDead: () => dead,
      draw: function () {
        ctx.fillStyle = "#50BEFA";
        ctx.fillRect(x, y, w, h);
      },
      moveTo: function (a, b) {
        if (dead) return;
        x = a;
        y = b;
        if (y + h > canvas.height) {
          y = canvas.height - h;
        }
      },
    };
  })();

  var blocks = (function () {
    var blocks = [],
      level = 0,
      level_factor = 1.2,
      start = {
        n: 10,
        x1: 210,
        x2: 700,
        h_min: 15,
        h_max: 100,
        speed_min: 0.5,
        speed_max: 5,
        direction: ["up", "down"],
      };

    function Block(direction) {
      this.w = 10;
      this.h = rand(start.h_min, start.h_max);
      this.x = rand(start.x1, start.x2, 10);
      this.y = 0;
      this.speed = rand(start.speed_min, start.speed_max);
      this.direction = direction;
      if (direction === "up") {
        this.y = canvas.height + rand(5, 350);
      } else {
        this.y -= rand(5, 350);
      }
    }

    return {
      curLevel: () => level,
      nextLevel: function () {
        ++level;
        blocks = [];
        var n = Math.ceil(start.n + level * level_factor);
        this.createXBlocks(n);
      },
      draw: function (b) {
        ctx.fillStyle = player.isDead() ? "#800000" : "#D98D00";
        ctx.fillRect(b.x, b.y, b.w, b.h);
      },
      drawZone: function () {
        ctx.fillStyle = "#111111";
        ctx.fillRect(start.x1, 0, start.x2 - start.x1 + 10, canvas.height);
      },
      createXBlocks: function (n) {
        for (var i = 0; i < n; ++i) {
          blocks.push(new Block(randIndex(start.direction)));
        }
      },
      moveAll: function () {
        if (player.isDead()) return;

        var px = player.getX(),
          py = player.getY(),
          pw = player.getW(),
          ph = player.getH();

        if (px > start.x2) {
          ctrl.x = 0;
          ctrl.y = canvas.height / 2;
          ctrl.velX = 0;
          ctrl.velY = 0;
          player.respawn();
          return;
        }

        for (var i = 0; i < blocks.length; ++i) {
          var b = blocks[i];
          if (b.direction === "up") {
            b.y -= b.speed;
            if (b.y + b.h < 0) b.y = canvas.height + rand(10, 350);
          } else {
            b.y += b.speed;
            if (b.y > canvas.height) b.y = 0 - rand(10, 350);
          }

          // Collision
          if (
            (px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h) ||
            (px + pw < b.x + b.w &&
              px + pw > b.x &&
              py + ph < b.y + b.h &&
              py + ph > b.y)
          ) {
            player.die();
          }
        }
      },
      drawAll: function () {
        for (var i in blocks) {
          this.draw(blocks[i]);
        }
      },
    };
  })();

  var ctrl = {
    x: 100,
    y: canvas.height / 2,
    velY: 0,
    velX: 0,
    speed: 1400,
    friction: 0.68,
    keys: [],
  };

  function updateCtrl() {
    if (ctrl.keys[32]) {
      if (player.isDead()) {
        ctrl.x = 0;
        ctrl.y = canvas.height / 2;
        ctrl.velX = 0;
        ctrl.velY = 0;
        player.resurrect();
      }
    }

    if (ctrl.keys[38] || ctrl.keys[87]) ctrl.velY--;
    if (ctrl.keys[40] || ctrl.keys[83]) ctrl.velY++;
    if (ctrl.keys[39] || ctrl.keys[68]) ctrl.velX++;
    if (ctrl.keys[37] || ctrl.keys[65]) ctrl.velX--;

    ctrl.velY *= ctrl.friction;
    ctrl.y += ctrl.velY;

    ctrl.velX *= ctrl.friction;
    ctrl.x += ctrl.velX;

    if (ctrl.x >= canvas.width) ctrl.x = canvas.width;
    else if (ctrl.x <= 5) ctrl.x = 5;

    if (ctrl.y > canvas.height) ctrl.y = canvas.height;
    else if (ctrl.y <= 5) ctrl.y = 5;

    player.moveTo(ctrl.x, ctrl.y);

    setTimeout(updateCtrl, 10);
  }

  updateCtrl();

  document.body.addEventListener("keydown", function (e) {
    ctrl.keys[e.keyCode] = true;
  });
  document.body.addEventListener("keyup", function (e) {
    ctrl.keys[e.keyCode] = false;
  });

  blocks.nextLevel();

  function update() {
    blocks.moveAll();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blocks.drawZone();
    blocks.drawAll();
    player.draw();

    ctx.font = "14px Verdana";

    if (player.isDead()) {
      ctx.fillStyle = "#9F000C";
      ctx.fillText("Game over!", 10, 50);
      ctx.fillText("Press [SPACE]", 10, 70);
    } else {
      ctx.fillStyle = "#D98D00";
      ctx.fillText("Cross to the other side", 10, 20);
      ctx.fillText("---------------------->", 10, 40);
      ctx.fillText("Use keyboard arrows", 10, 60);
      ctx.fillText("or [A] [W] [S] [D]", 10, 80);
      ctx.fillText("Level : " + blocks.curLevel(), 10, 150);
      ctx.fillText("Death : " + player.getDeath(), 10, 170);
    }
  }

  var fps = 0,
    now,
    lastUpdate = new Date() * 1;
  var fpsFilter = 50;

  function drawFrame() {
    var thisFrameFPS = 1000 / ((now = new Date()) - lastUpdate);
    if (now != lastUpdate) {
      fps += (thisFrameFPS - fps) / fpsFilter;
      lastUpdate = now;
      if (isNaN(fps)) fps = 1;

      ctx.fillStyle = "#888";
      ctx.font = "10px Verdana";
      ctx.fillText(fps.toFixed(0) + " fps", 5, canvas.height - 5);
    }
  }

  var animation_fps = 60;

  setInterval(function () {
    update();
    draw();
    drawFrame();
  }, 1000 / animation_fps);
});
