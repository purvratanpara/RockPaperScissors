// ===================================
// RPS ARENA - Rock Paper Scissors
// C++ (WebAssembly) + HTML + CSS + JS
// ===================================

// ---------- HTML Elements ----------
const $ = (id) => document.getElementById(id);

const startScreen = $("startScreen");
const gameScreen = $("gameScreen");
const intro = $("intro");

const choiceButtons = document.querySelectorAll(".choice-btn");
const computerModeButton = $("computerMode");
const twoPlayerModeButton = $("twoPlayerMode");

const playerScoreText = $("playerScore");
const computerScoreText = $("computerScore");
const streakCountText = $("streakCount");
const bestStreakText = $("bestStreak");
const streakBox = document.querySelector(".streak-box");

const playerOneLabel = $("playerOneLabel");
const playerTwoLabel = $("playerTwoLabel");
const nameOne = $("nameOne");
const nameTwo = $("nameTwo");

const resultText = $("resultText");
const playerChoiceText = $("playerChoiceText");
const computerChoiceText = $("computerChoiceText");
const chooseTitle = $("chooseTitle");
const loadingText = $("loadingText");

const card1 = $("card1");
const card2 = $("card2");
const face1 = $("face1");
const face2 = $("face2");
const countdownEl = $("countdown");

const confettiCanvas = $("confetti");
const ctx = confettiCanvas.getContext("2d");

// ---------- Game Variables ----------
let playerScore = 0;
let computerScore = 0;
let streak = 0;
let bestStreak = 0;
let gameMode = "computer";
let playerOneChoice = "";
let soundOn = true;
let busy = false;
let gameModule = null;

const choices = ["Rock", "Paper", "Scissors"];
const icons = { Rock: "✊", Paper: "✋", Scissors: "✌️" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ===================================
// START SCREEN -> GAME
// ===================================
$("startButton").addEventListener("click", async function () {
    clickSound();
    startScreen.classList.add("leave");
    intro.classList.add("show");
    winSound();

    await sleep(1300);

    intro.classList.remove("show");
    startScreen.classList.add("hidden");
    startScreen.classList.remove("leave");
    gameScreen.classList.remove("hidden");
});

$("homeButton").addEventListener("click", function () {
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetGame();
});

// ===================================
// LOAD C++ WEBASSEMBLY GAME
// ===================================
choiceButtons.forEach((b) => (b.disabled = true));

if (typeof createGameModule === "function") {
    createGameModule()
        .then(function (Module) {
            gameModule = Module;
            resultText.innerText = "C++ Game Connected!";
            loadingText.innerText = "Ready to Play!";
            choiceButtons.forEach((b) => (b.disabled = false));
            console.log("C++ Game Connected Successfully!");
        })
        .catch(function (error) {
            resultText.innerText = "C++ Game Loading Failed!";
            loadingText.innerText = "Check game.js and game.wasm files.";
            console.error(error);
        });
} else {
    resultText.innerText = "C++ Game Not Found!";
    loadingText.innerText = "Please compile game.cpp using Emscripten.";
}

// ===================================
// CHOICE BUTTON EVENTS
// ===================================
choiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        playGame(button.dataset.choice);
    });
});

// ===================================
// PLAY GAME
// ===================================
function playGame(playerChoice) {
    if (!gameModule) {
        resultText.innerText = "Please wait! C++ Game is Loading...";
        return;
    }
    if (busy) return;

    clickSound();
    removeAnimation();

    if (gameMode === "computer") {
        playerChoiceText.innerText = "Your Choice: " + playerChoice;
        computerChoiceText.innerText = "Computer Choice: ?";
        runRound(playerChoice, "");
    } else if (playerOneChoice === "") {
        // Player 1 picks first (hidden)
        playerOneChoice = playerChoice;
        chooseTitle.innerText = "Player 2: Choose Your Move";
        playerChoiceText.innerText = "Player 1: Choice Locked!";
        computerChoiceText.innerText = "Player 2: Waiting...";
        resultText.innerText = "Player 2, Select Your Move!";
    } else {
        // Player 2 picks second
        const p1 = playerOneChoice;
        playerOneChoice = "";
        playerChoiceText.innerText = "Player 1 Choice: ?";
        computerChoiceText.innerText = "Player 2 Choice: ?";
        runRound(p1, playerChoice);
    }
}

// ===================================
// ROUND: COUNTDOWN -> 3D REVEAL -> RESULT
// ===================================
async function runRound(choice1, choice2) {
    busy = true;
    choiceButtons.forEach((b) => (b.disabled = true));

    // Computer choice comes from C++
    if (gameMode === "computer") {
        choice2 = choices[gameModule._getComputerChoiceCpp() - 1];
    }

    // Reset cards to face-down and shake them
    card1.classList.remove("flipped", "win", "lose");
    card2.classList.remove("flipped", "win", "lose");
    await sleep(60);
    card1.classList.add("shake");
    card2.classList.add("shake");
    resultText.innerText = "Get ready...";

    // Countdown 3 - 2 - 1 - GO
    for (const n of ["3", "2", "1", "GO!"]) {
        countdownEl.innerText = n;
        countdownEl.classList.remove("tick");
        void countdownEl.offsetWidth; // restart animation
        countdownEl.classList.add("tick");
        playSound(n === "GO!" ? 900 : 440, 0.15);
        await sleep(n === "GO!" ? 600 : 850);
    }
    countdownEl.innerText = "";

    // 3D reveal
    card1.classList.remove("shake");
    card2.classList.remove("shake");
    face1.innerText = icons[choice1];
    face2.innerText = icons[choice2];
    card1.classList.add("flipped");
    card2.classList.add("flipped");
    await sleep(900);

    if (gameMode === "computer") {
        playerChoiceText.innerText = "Your Choice: " + choice1;
        computerChoiceText.innerText = "Computer Choice: " + choice2;
    } else {
        playerChoiceText.innerText = "Player 1 Choice: " + choice1;
        computerChoiceText.innerText = "Player 2 Choice: " + choice2;
    }

    checkWinner(choice1, choice2);

    chooseTitle.innerText =
        gameMode === "computer" ? "Choose Your Move" : "Player 1: Choose Your Move";
    busy = false;
    choiceButtons.forEach((b) => (b.disabled = false));
}

// ===================================
// WINNER CHECKING USING C++
// ===================================
function toNumber(choice) {
    return choices.indexOf(choice) + 1; // Rock=1, Paper=2, Scissors=3
}

function checkWinner(choice1, choice2) {
    removeAnimation();

    // Call the C++ winner checking function
    const result = gameModule._checkWinnerCpp(toNumber(choice1), toNumber(choice2));
    recordRound(result);

    if (result === 0) {
        resultText.innerText = "🤝 Match Draw!";
        resultText.classList.add("draw");
        drawSound();
    } else if (result === 1) {
        resultText.innerText = gameMode === "computer" ? "🎉 You Win!" : "🏆 Player 1 Wins!";
        resultText.classList.add("winner");
        card1.classList.add("win");
        card2.classList.add("lose");
        playerScore++;
        streak++;
        if (streak > bestStreak) bestStreak = streak;
        if (streak >= 2) {
            resultText.innerText += " 🔥 x" + streak;
        }
        streakBox.classList.remove("fire");
        void streakBox.offsetWidth;
        streakBox.classList.add("fire");
        winSound();
        startConfetti();
    } else if (result === 2) {
        if (gameMode === "computer") {
            resultText.innerText = "😢 Computer Wins!";
            resultText.classList.add("loser");
        } else {
            resultText.innerText = "🏆 Player 2 Wins!";
            resultText.classList.add("winner");
            startConfetti();
        }
        card2.classList.add("win");
        card1.classList.add("lose");
        computerScore++;
        streak = 0; // streak breaks when player 1 loses
        loseSound();
    } else {
        resultText.innerText = "Invalid Choice!";
    }

    updateScore();
}

// ===================================
// UPDATE SCORE + STREAK
// ===================================
function updateScore() {
    playerScoreText.innerText = playerScore;
    computerScoreText.innerText = computerScore;
    streakCountText.innerText = streak;
    bestStreakText.innerText = bestStreak;
}

// ===================================
// MODES
// ===================================
function setMode(mode) {
    gameMode = mode;
    const comp = mode === "computer";

    computerModeButton.classList.toggle("active", comp);
    twoPlayerModeButton.classList.toggle("active", !comp);

    playerOneLabel.innerText = comp ? "You" : "Player 1";
    playerTwoLabel.innerText = comp ? "Computer" : "Player 2";
    nameOne.innerText = playerOneLabel.innerText;
    nameTwo.innerText = playerTwoLabel.innerText;

    resetGame();
    resultText.innerText = comp ? "Computer Mode Selected!" : "Two Player Mode Selected!";
}

computerModeButton.addEventListener("click", () => setMode("computer"));
twoPlayerModeButton.addEventListener("click", () => setMode("twoPlayer"));

// ===================================
// RESET GAME
// ===================================
function resetGame() {
    if (busy) return;

    playerScore = 0;
    computerScore = 0;
    streak = 0;
    bestStreak = 0;
    playerOneChoice = "";
    updateScore();

    resultText.innerText = "Game Reset!";
    resetHistory();
    playerChoiceText.innerText = gameMode === "computer" ? "Your Choice: -" : "Player 1 Choice: -";
    computerChoiceText.innerText = gameMode === "computer" ? "Computer Choice: -" : "Player 2 Choice: -";
    chooseTitle.innerText = gameMode === "computer" ? "Choose Your Move" : "Player 1: Choose Your Move";

    card1.classList.remove("flipped", "win", "lose", "shake");
    card2.classList.remove("flipped", "win", "lose", "shake");
    countdownEl.innerText = "";

    removeAnimation();
    stopConfetti();
}

$("resetButton").addEventListener("click", resetGame);

// ===================================
// SOUND ON / OFF
// ===================================
$("soundButton").addEventListener("click", function () {
    soundOn = !soundOn;
    this.innerText = soundOn ? "🔊 ON" : "🔇 OFF";
});

// ===================================
// SOUND EFFECTS (Web Audio)
// ===================================
let audioContext = null;

function playSound(frequency, duration) {
    if (!soundOn) return;

    try {
        if (!audioContext) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            audioContext = new AC();
        }
        if (audioContext.state === "suspended") audioContext.resume();

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log("Sound Error:", error);
    }
}

function clickSound() { playSound(400, 0.1); }
function winSound() {
    playSound(700, 0.2);
    setTimeout(() => playSound(900, 0.3), 150);
}
function loseSound() { playSound(250, 0.4); }
function drawSound() { playSound(500, 0.2); }

// ===================================
// REMOVE RESULT ANIMATIONS
// ===================================
function removeAnimation() {
    resultText.classList.remove("winner", "loser", "draw");
}

// ===================================
// CONFETTI
// ===================================
let particles = [];
let confettiAnimation = null;

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function startConfetti() {
    stopConfetti();
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: -Math.random() * confettiCanvas.height,
            size: Math.random() * 8 + 3,
            speed: Math.random() * 4 + 2,
            rotation: Math.random() * 360,
            color: "hsl(" + Math.random() * 360 + ", 100%, 60%)"
        });
    }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    particles.forEach(function (p) {
        p.y += p.speed;
        p.rotation += 5;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
    });

    particles = particles.filter((p) => p.y < confettiCanvas.height + 20);

    if (particles.length > 0) {
        confettiAnimation = requestAnimationFrame(animateConfetti);
    } else {
        stopConfetti();
    }
}

function stopConfetti() {
    if (confettiAnimation !== null) {
        cancelAnimationFrame(confettiAnimation);
        confettiAnimation = null;
    }
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles = [];
}


// ===================================
// XP, LEVELS, ROUND HISTORY
// ===================================
let xp = 0, rounds = 0, hist = [];

function recordRound(result) {
    if (result < 0 || result > 2) return;
    rounds++;
    const tag = result === 0 ? "D" : result === 1 ? "W" : "L";
    hist.push(tag);
    if (hist.length > 8) hist.shift();

    const oldLevel = Math.floor(xp / 100) + 1;
    xp += tag === "W" ? 30 : tag === "D" ? 10 : 5;
    const newLevel = Math.floor(xp / 100) + 1;
    if (newLevel > oldLevel) showToast("⬆️ LEVEL UP! You reached LV " + newLevel);
    if (tag === "W" && streak + 1 === 3) showToast("🔥 3 Win Streak - On Fire!");

    flashScreen(tag);
    renderProgress();
}

function renderProgress() {
    $("levelBadge").innerText = "LV " + (Math.floor(xp / 100) + 1);
    $("xpFill").style.width = (xp % 100) + "%";
    $("roundCount").innerText = rounds;
    $("histChips").innerHTML = hist.map((t) => '<i class="chip ' + t + '">' + t + "</i>").join("");
}

function resetHistory() {
    rounds = 0;
    hist = [];
    renderProgress();
}

function flashScreen(tag) {
    const f = $("flash");
    f.className = "flash " + tag;
    void f.offsetWidth;
    f.classList.add("go");
}

function showToast(msg) {
    const t = $("toast");
    t.innerText = msg;
    t.classList.remove("show");
    void t.offsetWidth;
    t.classList.add("show");
}

$("howButton").addEventListener("click", () => $("modal").classList.remove("hidden"));
$("closeModal").addEventListener("click", () => $("modal").classList.add("hidden"));
renderProgress();
