// 🌙 Dark/Light Mode Toggle
const toggleBtn = document.getElementById("toggle-mode");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleBtn.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// 🎈 Balloon Popper Game Logic
let score = 0;
let hue = 0;
let gameRunning = true;
let gameInterval;
let lastRedBalloon = 0;
const gameDuration = 30000;
const redBalloonInterval = 5000;

function createBalloon() {
  if (!gameRunning) return;

  const balloonCount = Math.random() < 0.25 ? 5 : 1;

  for (let i = 0; i < balloonCount; i++) {
    const now = Date.now();
    const isRed = now - lastRedBalloon >= redBalloonInterval;

    const balloon = document.createElement("div");
    balloon.classList.add("balloon");

    if (isRed && i === 0) {
      balloon.classList.add("red-balloon");
      lastRedBalloon = now;
    }

    const size = Math.floor(Math.random() * 20) + 40; // 40px–60px
    balloon.style.width = `${size}px`;
    balloon.style.height = `${size * 1.4}px`;

    hue = (hue + 40) % 360;
    balloon.style.setProperty("--hue", hue);
    balloon.style.left = Math.random() * 90 + "%";

    balloon.addEventListener("click", () => {
      if (balloon.classList.contains("red-balloon")) {
        score = Math.max(0, score - 1);
      } else {
        score++;
      }

      document.getElementById("score").innerText = score;
      popSound();
      balloon.remove();
    });

    document.getElementById("balloon-container").appendChild(balloon);

    setTimeout(() => {
      if (balloon.parentElement) balloon.remove();
    }, 3000);
  }
}

function popSound() {
  const pop = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_4c99fa3d75.mp3?filename=pop-39222.mp3");
  pop.play();
}

function startGame() {
  score = 0;
  gameRunning = true;
  lastRedBalloon = Date.now();
  document.getElementById("score").innerText = score;
  document.getElementById("game-over").classList.add("hidden");
  document.getElementById("player-name").value = "";
  document.getElementById("balloon-container").innerHTML = "";

  gameInterval = setInterval(createBalloon, 280); // faster now

  setTimeout(() => {
    clearInterval(gameInterval);
    gameRunning = false;
    document.getElementById("final-score").innerText = score;
    document.getElementById("game-over").classList.remove("hidden");
  }, gameDuration);
}

function restartGame() {
  startGame();
}

// 🧠 Save score to Firebase
function saveScore() {
  const name = document.getElementById("player-name").value.trim() || "Anonymous";
  const db = window.firebaseDB;

  const scoreData = {
    name,
    score,
    timestamp: Date.now()
  };

  const { ref, push } = window.firebaseModules;
  const scoresRef = ref(db, "scores");
  push(scoresRef, scoreData);

  document.getElementById("player-name").value = "";
}

// 🏆 Load scores from Firebase
function loadScores() {
  const list = document.getElementById("score-list");
  const scoreboard = document.getElementById("scoreboard");
  list.innerHTML = "";

  const db = window.firebaseDB;
  const { ref, onValue } = window.firebaseModules;

  const scoresRef = ref(db, "scores");

  onValue(scoresRef, (snapshot) => {
    const allScores = snapshot.val();
    list.innerHTML = "";

    if (allScores) {
      const scoresArray = Object.values(allScores);
      scoresArray.sort((a, b) => b.score - a.score);
      const topScores = scoresArray.slice(0, 5);

      topScores.forEach(({ name, score }) => {
        const li = document.createElement("li");
        li.textContent = `${name}: ${score} points`;
        list.appendChild(li);
      });

      scoreboard.classList.remove("hidden");
    }
  });
}

// 🚀 Init on Load
window.addEventListener("load", () => {
  startGame();
  loadScores();
});
