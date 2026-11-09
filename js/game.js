// GAME VARIABLES
let bubbles = [];
let score = 0;
let lives = 3;
let nextBubbleId = 1;
let gameRunning = true;

// GET HTML ELEMENTS
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const restartButton = document.getElementById("restart-btn");
const message = document.getElementById("message");

// CREATE & DISPLAY BUBBLE COMBINED
function spawnBubble() {
    if (!gameRunning) return;

    const size = 30; // Fixed starting size
    const bubble = {
        id: nextBubbleId++,
        size: size,
        x: Math.random() * (600 - size),
        y: Math.random() * (400 - size)
    };

    bubbles.push(bubble);

    const bubbleElement = document.createElement("div");
    bubbleElement.classList.add("bubble");
    bubbleElement.id = "bubble-" + bubble.id;
    bubbleElement.style.width = bubble.size + "px";
    bubbleElement.style.height = bubble.size + "px";
    bubbleElement.style.left = bubble.x + "px";
    bubbleElement.style.top = bubble.y + "px";

    bubbleElement.onclick = function () {
        popBubble(bubble.id);
    };

    gameArea.appendChild(bubbleElement);
}

// POP BUBBLE
function popBubble(id) {
    if (!gameRunning) return;

    const index = bubbles.findIndex(b => b.id === id);
    if (index !== -1) {
        bubbles.splice(index, 1);
        const el = document.getElementById("bubble-" + id);
        if (el) el.remove();
        
        score++;
        updateDisplay();
    }
}

// GROW & BURST CHECK COMBINED
function growBubbles() {
    if (!gameRunning) return;

    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.size += 2;

        const el = document.getElementById("bubble-" + bubble.id);
        if (el) {
            el.style.width = bubble.size + "px";
            el.style.height = bubble.size + "px";
        }

        // Burst if too big
        if (bubble.size >= 100) {
            if (el) el.remove();
            bubbles.splice(i, 1);
            lives--;
            updateDisplay();

            if (lives <= 0) {
                gameRunning = false;
                message.textContent = "Game Over!";
            }
        }
    }
}

// UPDATE DISPLAY
function updateDisplay() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}

// RESTART GAME
function restartGame() {
    bubbles = [];
    score = 0;
    lives = 3;
    nextBubbleId = 1;
    gameRunning = true;
    gameArea.innerHTML = "";
    message.textContent = "";
    updateDisplay();
}

// TIMERS & EVENT LISTENERS
setInterval(spawnBubble, 1500);
setInterval(growBubbles, 500);
restartButton.addEventListener("click", restartGame);
updateDisplay();