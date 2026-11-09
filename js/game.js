let bubbles = [];
let score = 0;
let lives = 3;
let nextBubbleId = 1;

function createBubble() {
    const bubble = {
        id: nextBubbleId,
        size: 30,
        x: 100,
        y: 100 
    };
    bubbles.push(bubble);
    nextBubbleId++;
}

function displayBubble(bubble) {
    const gameArea = document.getElementById("game-area");

    const bubbleElement = document.createElement("div");

    bubbleElement.classList.add("bubble");

    bubbleElement.style.width = bubble.size + "px";
    bubbleElement.style.height = bubble.size + "px";
    bubbleElement.style.left = bubble.x + "px";
    bubbleElement.style.top = bubble.y + "px";

    gameArea.appendChild(bubbleElement);
}

createBubble()
displayBubble(bubbles[0])