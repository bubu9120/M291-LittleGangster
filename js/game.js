const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameUI = document.getElementById("gameUI");
const endScreen = document.getElementById("endScreen");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");

const groundY = 230;
const baseObjectWidth = 40;
const baseObjectHeight = 60;
const gravity = 1.1;

let score = 0;
let isRunning = false;
let gameInterval, spawnInterval;
let shieldsLeft = 3;

const bgImage = new Image();
bgImage.src = "./assets/images/background_ghetto.avif";

const characterImg = new Image();
characterImg.src = "./assets/images/character.png";

const obstacleImg = new Image();
obstacleImg.src = "./assets/images/police.png";

const shieldImg = new Image();
shieldImg.src = "./assets/images/Shield.png";

const character = {
  x: 50,
  y: groundY,
  width: baseObjectWidth,
  height: baseObjectHeight,
  vy: 0,
  jumping: false,
  jumpsDone: 0,
  sliding: false,
  hasShield: false,
};

let obstacles = [];

let obstacleSpeed = 5;
let spawnDelay = 1500;

function drawBackground() {
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
}

function drawCharacter() {
  ctx.drawImage(
    characterImg,
    character.x,
    character.y,
    character.width,
    character.height
  );

  if (character.hasShield) {
    ctx.drawImage(
      shieldImg,
      character.x + character.width - 15,
      character.y - 15,
      20,
      20
    );
  }
}

function spawnObstacle() {
  const sizeFactor = 0.7 + Math.random() * 0.6;
  obstacles.push({
    x: canvas.width,
    y: groundY + baseObjectHeight * (1 - sizeFactor),
    width: baseObjectWidth * sizeFactor,
    height: baseObjectHeight * sizeFactor,
    speed: obstacleSpeed + Math.random() * 1.5,
  });
}

function drawObstacles() {
  obstacles.forEach((ob) => {
    ctx.drawImage(obstacleImg, ob.x, ob.y, ob.width, ob.height);
  });
}

function updateObstacles() {
  obstacles.forEach((ob) => {
    ob.x -= ob.speed;
  });
  obstacles = obstacles.filter((ob) => ob.x + ob.width > 0);
}

function checkCollision() {
  const buffer = 10;

  for (let i = 0; i < obstacles.length; i++) {
    const ob = obstacles[i];
    const characterBox = {
      x: character.x + buffer,
      y: character.y + buffer,
      width: character.width - buffer * 2,
      height: character.height - buffer * 2,
    };

    const obstacleBox = {
      x: ob.x + buffer,
      y: ob.y + buffer,
      width: ob.width - buffer * 2,
      height: ob.height - buffer * 2,
    };

    if (
      characterBox.x < obstacleBox.x + obstacleBox.width &&
      characterBox.x + characterBox.width > obstacleBox.x &&
      characterBox.y < obstacleBox.y + obstacleBox.height &&
      characterBox.y + characterBox.height > obstacleBox.y
    ) {
      if (character.hasShield) {
        character.hasShield = false;
        obstacles.splice(i, 1);
        break;
      } else {
        endGame();
        break;
      }
    }
  }
}

function updateCharacter() {
  if (character.jumping) {
    character.vy += gravity;
    character.y += character.vy;

    if (character.y >= groundY) {
      character.y = groundY;
      character.vy = 0;
      character.jumping = false;
      character.jumpsDone = 0;
    }
  }

  if (character.sliding && !character.jumping) {
    character.height = baseObjectHeight / 2;
    character.y = groundY + baseObjectHeight / 2;
  } else if (!character.jumping) {
    character.height = baseObjectHeight;
    character.y = groundY;
  }
}

function increaseDifficulty() {
  if (score % 100 === 0) {
    obstacleSpeed = Math.min(15, obstacleSpeed + 0.3);
    spawnDelay = Math.max(600, spawnDelay - 50);
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnObstacle, spawnDelay);
  }
}

function update() {
  drawBackground();
  updateCharacter();
  drawCharacter();
  updateObstacles();
  drawObstacles();
  checkCollision();

  score++;
  scoreDisplay.textContent = score;

  increaseDifficulty();
}

function startGame() {
  document.body.classList.add("no-scroll");
  document.body.classList.add("game-active");
  character.y = groundY;
  character.vy = 0;
  character.jumping = false;
  character.jumpsDone = 0;
  character.sliding = false;
  character.height = baseObjectHeight;
  character.hasShield = false;
  shieldsLeft = 3;
  document.getElementById("shieldCount").textContent = shieldsLeft;

  obstacles = [];
  score = 0;
  obstacleSpeed = 5;
  spawnDelay = 1500;

  startScreen.style.display = "none";
  endScreen.style.display = "none";
  gameUI.style.display = "block";

  isRunning = true;
  gameInterval = setInterval(update, 30);
  spawnInterval = setInterval(spawnObstacle, spawnDelay);
}

function endGame() {
  isRunning = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  gameUI.style.display = "none";
  endScreen.style.display = "block";
  finalScoreDisplay.textContent = score;

  if (finalScoreDisplay.textContent > 4000) {
    const code = "GANSTER1000";
    const codeElement = document.getElementById("rewardCode");
    codeElement.textContent = `Dein Rabattcode: ${code}`;
    codeElement.style.display = "block";
  }

  document.body.classList.remove("no-scroll");
  document.body.classList.remove("game-active");
}

function restartGame() {
  startGame();
}

document.addEventListener("keydown", (e) => {
  if (!isRunning) return;

  if (e.key === "ArrowUp") {
    if (character.jumpsDone < 2) {
      character.jumping = true;
      character.vy = -18;
      character.sliding = false;
      character.jumpsDone++;
    }
  }

  if (e.key === "ArrowDown" && !character.jumping && !character.sliding) {
    character.sliding = true;
    setTimeout(() => {
      character.sliding = false;
    }, 700);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "s") {
    if (shieldsLeft > 0 && !character.hasShield) {
      character.hasShield = true;
      shieldsLeft--;
      document.getElementById("shieldCount").textContent = shieldsLeft;
    }
  }
});
