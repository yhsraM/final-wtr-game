// Remove import './sound.js'; and use only one waterHitSound instance
const waterHitSound = new Audio('click.mp3/392116__freezegelman__water-hit-3.wav');
waterHitSound.preload = 'auto';

// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Track clean drops collected
let highScore = 0;

// For the game timer
let timerInterval; // For the game timer
let timeLeft = 45; // Default game time changed to 45 seconds
let dropInterval = 1000; // Initial drop interval (ms)
let dropSpeed = 4; // Initial drop speed (seconds)

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  updateScore();
  timeLeft = 45;
  dropInterval = 1000;
  dropSpeed = 4;
  updateTimer();

  // Start the timer
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft % 15 === 0 && timeLeft !== 45 && timeLeft > 0) {
      // Increase difficulty every 20 seconds (except at start)
      increaseDifficulty();
    }
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, dropInterval);

  // Gradually increase speed and drop frequency every second
  if (typeof speedInterval !== 'undefined') clearInterval(speedInterval);
  let secondsElapsed = 0;
  speedInterval = setInterval(() => {
    if (!gameRunning) return;
    secondsElapsed++;
    // Every 10 seconds, increase speed and drop frequency
    if (secondsElapsed % 10 === 0) {
      if (dropSpeed > 1) {
        dropSpeed -= 0.3; // Increase fall speed more noticeably
      }
      if (dropInterval > 400) {
        dropInterval -= 60; // Increase drop frequency more noticeably
        clearInterval(dropMaker);
        dropMaker = setInterval(createDrop, dropInterval);
      }
    }
  }, 1000);
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function updateTimer() {
  document.getElementById("time").textContent = timeLeft;
}

function increaseDifficulty() {
  // Increase drop speed and frequency
  if (dropInterval > 400) dropInterval -= 200; // Faster drop creation
  if (dropSpeed > 1.5) dropSpeed -= 0.7; // Faster fall

  clearInterval(dropMaker);
  dropMaker = setInterval(createDrop, dropInterval);
}

function showConfetti() {
  const confettiColors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F5402C", "#159A48", "#F16061"];
  const confettiCount = 80;
  const overlay = document.getElementById('game-over-overlay');
  for (let i = 0; i < confettiCount; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    conf.style.left = Math.random() * 100 + '%';
    conf.style.animationDelay = (Math.random() * 0.5) + 's';
    conf.style.width = (Math.random() * 6 + 6) + 'px';
    conf.style.height = (Math.random() * 12 + 8) + 'px';
    overlay.appendChild(conf);
  }
  setTimeout(() => {
    document.querySelectorAll('.confetti').forEach(c => c.remove());
  }, 2200);
}

function showGameOver() {
  // Remove all drops
  document.querySelectorAll('.water-drop, .bad-emoji, .special-can').forEach(el => el.remove());
  // Check if new high score
  const isNewHigh = score > highScore;
  if (isNewHigh) highScore = score;
  // Create overlay
  let overlay = document.createElement('div');
  overlay.id = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-box">
      <h2>Game Over!</h2>
      <div class="score-summary">
        <div class="high-score">Highest Score: <span>${highScore}</span></div>
        <div class="current-score">Your Score: <span>${score}</span></div>
      </div>
      <button id="try-again-btn">Try Again</button>
    </div>
  `;
  document.body.appendChild(overlay);
  if (isNewHigh) showConfetti();
  document.getElementById('try-again-btn').onclick = () => {
    overlay.remove();
    // Reset dropInterval and dropSpeed to initial values before starting a new game
    dropInterval = 1000;
    dropSpeed = 4;
    startGame();
  };
}

function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);
  clearInterval(dropMaker);
  if (typeof speedInterval !== 'undefined') clearInterval(speedInterval);
  showGameOver();
}

function createDrop() {
  // Create a new div element that will be our water drop, bad emoji, or special object
  const drop = document.createElement("div");
  const badEmojis = ["🌿", "🪱", "🪵", "🦠"];
  const isSpecial = Math.random() < 0.06; // ~6% chance for water can
  const isBad = !isSpecial && Math.random() < 0.25; // 25% chance for a bad emoji (if not special)

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  drop.style.position = "absolute";
  drop.style.top = "0px";
  drop.style.animation = `dropFall ${dropSpeed}s linear forwards`;

  if (isSpecial) {
    drop.className = "special-can";
    const img = document.createElement("img");
    img.src = "img/water-can-transparent.png";
    img.alt = "Water Can";
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.pointerEvents = "none";
    drop.appendChild(img);
    // Use both click and pointerdown for best compatibility
    drop.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (gameRunning) {
        timeLeft += 10;
        updateTimer();
        drop.remove();
      }
    }, { once: true });
  } else if (isBad) {
    drop.className = "bad-emoji";
    drop.textContent = badEmojis[Math.floor(Math.random() * badEmojis.length)];
    drop.style.fontSize = `${Math.floor(Math.random() * 20 + 40)}px`;
    drop.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (gameRunning) {
        drop.remove();
        endGame();
      }
    }, { once: true });
  } else {
    drop.className = "water-drop";
    // Use water droplet emoji instead of blue circle
    drop.textContent = "💧";
    drop.style.backgroundColor = "transparent";
    drop.style.display = "flex";
    drop.style.alignItems = "center";
    drop.style.justifyContent = "center";
    drop.style.fontSize = `${Math.floor(Math.random() * 20 + 40)}px`;
    // Make drops different sizes for visual variety
    const initialSize = 60;
    const sizeMultiplier = Math.random() * 0.8 + 0.5;
    const size = initialSize * sizeMultiplier;
    drop.style.width = drop.style.height = `${size}px`;
    drop.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!drop.classList.contains("bad-emoji")) {
        score++;
        updateScore();
        drop.remove();
        // Play water hit sound
        waterHitSound.currentTime = 0;
        waterHitSound.play();
      }
    }, { once: true });
  }

  document.getElementById("game-container").appendChild(drop);
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}
