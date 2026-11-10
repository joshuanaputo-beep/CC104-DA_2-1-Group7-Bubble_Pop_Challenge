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


// CREATE A BUBBLE
function createBubble() {
    const size = Math.floor(Math.random() * 30) + 30;

    const bubble = {
        id: nextBubbleId,
        size: size,
        x: Math.random() * (600 - size),
        y: Math.random() * (400 - size)
    };

    bubbles.push(bubble);
    nextBubbleId++;
}


// DISPLAY A BUBBLE
function displayBubble(bubble) {
    const bubbleElement = document.createElement("div");

    bubbleElement.classList.add("bubble");
    bubbleElement.id = "bubble-" + bubble.id;

    bubbleElement.style.width = bubble.size + "px";
    bubbleElement.style.height = bubble.size + "px";
    bubbleElement.style.left = bubble.x + "px";
    bubbleElement.style.top = bubble.y + "px";

    bubbleElement.addEventListener("click", function () {
        popBubble(bubble.id);
    });

    gameArea.appendChild(bubbleElement);
}


// SPAWN A NEW BUBBLE
function spawnBubble() {
    if (!gameRunning) {
        return;
    }

    createBubble();

    const newBubble = bubbles[bubbles.length - 1];
    displayBubble(newBubble);
}

// POP A BUBBLE
function popBubble(id) {
    if (!gameRunning) {
        return;
    }

    const bubbleIndex = bubbles.findIndex(function (bubble) {
        return bubble.id === id;
    });

    if (bubbleIndex !== -1) {
        bubbles.splice(bubbleIndex, 1);

        const bubbleElement = document.getElementById("bubble-" + id);

        if (bubbleElement) {
            bubbleElement.remove();
        }

        score++;
        updateDisplay();
    }
}


// GROW THE BUBBLES
function growBubbles() {
    if (!gameRunning) {
        return;
    }

    bubbles.forEach(function (bubble) {
        bubble.size += 2;

        const bubbleElement = document.getElementById(
            "bubble-" + bubble.id
        );

        if (bubbleElement) {
            bubbleElement.style.width = bubble.size + "px";
            bubbleElement.style.height = bubble.size + "px";
        }
    });

    checkBurstBubbles();
}


// CHECK FOR BURST BUBBLES
function checkBurstBubbles() {
    const maxSize = 100;

    const burstBubbles = bubbles.filter(function (bubble) {
        return bubble.size >= maxSize;
    });

    burstBubbles.forEach(function (bubble) {
        const bubbleElement = document.getElementById(
            "bubble-" + bubble.id
        );

        if (bubbleElement) {
            bubbleElement.remove();
        }

        lives--;
    });

    bubbles = bubbles.filter(function (bubble) {
        return bubble.size < maxSize;
    });

    updateDisplay();

    if (lives <= 0) {
        gameOver();
    }
}



// UPDATE SCORE AND LIVES
function updateDisplay() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}



// GAME OVER
function gameOver() {
    gameRunning = false;
    message.textContent = "Game Over!";
}



// RESTART THE GAME
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



// GAME TIMERS
setInterval(spawnBubble, 1500);
setInterval(growBubbles, 500);


// RESTART BUTTON
restartButton.addEventListener("click", restartGame);


// Start with the correct display
updateDisplay();