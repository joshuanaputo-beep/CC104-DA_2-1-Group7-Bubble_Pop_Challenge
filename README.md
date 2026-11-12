# CC104-DA_2-1-Group7-Bubble_Pop_Challenge

## Project Overview

The **Bubble Pop Challenge** is an interactive, browser-based game developed as a course term project for **CC104 - Data Structures and Algorithms**. The application demonstrates the practical use of dynamic data structures, array traversal, searching algorithms, and real-time state management using vanilla JavaScript, HTML5, and CSS3.

---

## Creators / Group Members

* Mark Joshua N. Solano
* Jake B. Rivas
* Rommel F. Iran
* Johnlery R. De Vera

---

## Gameplay Instructions

* **Launch the Game:** Open `index.html` in any modern web browser. No backend server, internet access, or game engine installation is required.
* **Objective:** Pop growing bubbles before they exceed their maximum size limit and burst automatically.
* **Player Controls:**
  * Click or tap on active bubbles on the screen to pop them, score points, and build combos.
  * Watch out for special bubbles and rare effects that alter gameplay.
* **Game Over Condition:** The game ends after **three bubbles** burst automatically without being popped by the player.
* **Restart:** Click the **Reset** or **Restart Game** button at any time to clear the board and start a new session.

---

## Data Structures and Algorithms (DSA) Implementation

In accordance with project specifications for **Project 5 (Bubble Pop Challenge)**, the application implements the following core data structures and algorithmic operations:

### 1. Array of Objects (Data Structure)
Active bubbles are stored dynamically inside a JavaScript array where each element is an object representing an individual bubble's attributes:

```javascript
let bubbles = [
  { id: 1, size: 25, x: 100, y: 150, color: "#4ade80", speed: 0.5 }
];
