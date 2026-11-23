/* Bubble Pop Challenge - Enhanced Edition */

$(function () {

  "use strict";

  // ---------- Settings ----------

  const START_SIZE = 24;
  const MAX_SIZE = 90;
  const BASE_GROWTH = 0.8;
  const TICK_MS = 50;
  const BASE_SPAWN_MS = 1100;
  const MAX_BUBBLES = 10;
  const MAX_LIVES = 3;

  // ---------- Sounds (ADDED) ----------

const popSound = new Audio("assets/Bubble-Popping.mp3");
const wrongSound = new Audio("assets/WrongBubble-Sounds.mp3");

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(error => {
    console.log("Sound playback error:", error);
  });
}

  // Level milestones (Score thresholds)


const LEVELS = [
  { level: 1, minScore: 0, theme: "theme-lvl-1", growth: 0.8, spawnMs: 1100 },
  { level: 2, minScore: 150, theme: "theme-lvl-2", growth: 1.0, spawnMs: 950 },
  { level: 3, minScore: 400, theme: "theme-lvl-3", growth: 1.2, spawnMs: 800 },
  { level: 4, minScore: 800, theme: "theme-lvl-4", growth: 1.4, spawnMs: 650 },
  { level: 5, minScore: 1200, theme: "theme-lvl-5", growth: 1.6, spawnMs: 500 }
];

  // Special bubble types configuration

  const TYPES = {
    NORMAL: "normal",
    GOLDEN: "golden",
    BOMB: "bomb",
    FREEZE: "freeze",
    CHAIN: "chain"
  };

  // ---------- Game state ----------

  let bubbles = [];
  let nextId = 1;

  let score = 0, popped = 0, lives = MAX_LIVES, currentLevel = 1;

  let comboCount = 0, lastPopTime = 0;

  let bestScore = parseInt(localStorage.getItem("bubbleBestScore") || "0", 10);

  let running = false;

  let paused = false;

  let freezeTimerMs = 0;
  let feverTimerMs = 0;

  let tickTimer = null, spawnTimer = null;

  const $area = $("#game-area");
  const $body = $("body");

  // ---------- Helpers ----------

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function findBubbleById(id) {
    for (let i = 0; i < bubbles.length; i++) {
      if (bubbles[i].id === id) return bubbles[i];
    }
    return null;
  }

  function getDistance(b1, b2) {
    const dx = b1.x - b2.x;
    const dy = b1.y - b2.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  // Choose bubble type based on random probability

  function getRandomType() {
    const roll = Math.random();

    if (roll < 0.08) return TYPES.GOLDEN;
    if (roll < 0.17) return TYPES.BOMB;
    if (roll < 0.25) return TYPES.FREEZE;
    if (roll < 0.33) return TYPES.CHAIN;

    return TYPES.NORMAL;
  }

  // ---------- Core operations ----------

  function spawnBubble() {
    if (!running || bubbles.length >= MAX_BUBBLES) return;

    const half = MAX_SIZE / 2;

    const w = $area.width(), h = $area.height();

    if (w < MAX_SIZE || h < MAX_SIZE) return;

    bubbles.push({
      id: nextId++,
      type: getRandomType(),
      size: START_SIZE,

      x: randomInt(half, w - half),
      y: randomInt(half, h - half),

      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6
    });

    render();
  }

  function updateLevelAndTheme() {
    let targetLvl = LEVELS[0];

    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (score >= LEVELS[i].minScore) {
        targetLvl = LEVELS[i];
        break;
      }
    }

    if (targetLvl.level !== currentLevel) {
      currentLevel = targetLvl.level;

    $body.removeClass("theme-lvl-1 theme-lvl-2 theme-lvl-3 theme-lvl-4 theme-lvl-5")
        .addClass(targetLvl.theme);

      // Adjust spawn timer interval

      clearInterval(spawnTimer);
      spawnTimer = setInterval(spawnBubble, targetLvl.spawnMs);

      // Show level up banner overlay

      $("#level-banner-text").text(`LEVEL ${currentLevel} REACHED!`);

      $("#level-up-banner").removeClass("d-none");

      setTimeout(() => $("#level-up-banner").addClass("d-none"), 1800);
    }
  }

  function tick() {
    if (!running) return;

    // Handle slow-motion freeze effect duration

    let activeGrowth = LEVELS[currentLevel - 1].growth;

    if (freezeTimerMs > 0) {
      freezeTimerMs -= TICK_MS;
      activeGrowth *= 0.3;

      $area.addClass("freeze-active");
    } else {
      $area.removeClass("freeze-active");
    }
    // Fever Mode Timer
if (feverTimerMs > 0) {
  feverTimerMs -= TICK_MS;
  $area.addClass("fever-active");
} else {
  $area.removeClass("fever-active");
}

    // Traversal: Grow bubbles

    const w = $area.width(), h = $area.height();

    bubbles.forEach(function (b) {
      b.size += activeGrowth;

      b.x += b.vx;
      b.y += b.vy;

      const r = b.size / 2;

      if (b.x - r < 0 || b.x + r > w) b.vx *= -1;
      if (b.y - r < 0 || b.y + r > h) b.vy *= -1;
    });

    // Removal: burst overflowing bubbles

    const burst = bubbles.filter(function (b) {
      return b.size >= MAX_SIZE;
    });

    bubbles = bubbles.filter(function (b) {
      return b.size < MAX_SIZE;
    });

    if (burst.length > 0) {
      burst.forEach(function (b) {
        if (b.type !== TYPES.BOMB) {
          lives = Math.max(0, lives - 1);

          floatText(b.x, b.y, "Burst!", "bad");

          // SOUND ADDED: Wrong sound when bubble bursts
          playSound(wrongSound);
        }
      });

      comboCount = 0;

      $area.addClass("burst");

      setTimeout(function () {
        $area.removeClass("burst");
      }, 300);
    }

    updateLevelAndTheme();

    render();

    if (lives === 0) endGame();
  }

  function popBubble(id, isChainTrigger = false) {
    if (!running) return;

    const b = findBubbleById(id);

    if (b === null) return;

    bubbles = bubbles.filter(function (item) {
      return item.id !== id;
    });

    const now = Date.now();

    if (!isChainTrigger) {
      comboCount = (now - lastPopTime < 900) ? comboCount + 1 : 1;
      lastPopTime = now;
    }

  const multiplier = Math.min(comboCount, 5);

const basePoints = 10 + Math.round((MAX_SIZE - b.size) / 10);

let points = basePoints * multiplier;

// Activate Fever Mode at 10 Combo
if (comboCount === 10 && feverTimerMs <= 0 && !isChainTrigger) {
  feverTimerMs = 5000;
  floatText(b.x, b.y - 22, "FEVER MODE! 2X", "gold");
}

// Double points during Fever Mode
if (feverTimerMs > 0) {
  points *= 2;
}

    // Handle special bubble effects

    if (b.type === TYPES.BOMB) {
      lives = Math.max(0, lives - 1);

      floatText(b.x, b.y, "-1 Life!", "bad");
      spawnShockwave(b.x, b.y, "bad");
      comboCount = 0;

      // SOUND ADDED: Wrong sound when decoy/bomb is popped
      playSound(wrongSound);

    } else if (b.type === TYPES.GOLDEN) {
      lives = Math.min(MAX_LIVES, lives + 1);

      points += 20;

      floatText(b.x, b.y, `+${points} & Life!`, "gold");

    } else if (b.type === TYPES.FREEZE) {
      freezeTimerMs = 4000;

      floatText(b.x, b.y, "FREEZE!", "freeze");
      spawnShockwave(b.x, b.y, "freeze");
      
    } else if (b.type === TYPES.CHAIN) {
      floatText (b.x, b.y, "BOOM!", "gold")
      spawnShockwave(b.x, b.y, "");

      // Find nearby bubbles within 140px radius

      const nearby = bubbles.filter(other =>
        other.id !== b.id && getDistance(b, other) < 140
      );

      nearby.forEach(target => popBubble(target.id, true));
    }

    if (b.type !== TYPES.BOMB && b.type !== TYPES.CHAIN) {
      score += points;
      popped++;

      const text = multiplier > 1
        ? `+${points} (x${multiplier})`
        : `+${points}`;

      floatText(b.x, b.y, text, false);
    }

    // SOUND ADDED: Bubble pop sound for non-decoy bubbles
    if (b.type !== TYPES.BOMB) {
      playSound(popSound);
    }

    updateLevelAndTheme();

    render();

    if (lives === 0) endGame();
  }

  // ---------- Game flow ----------

  function startGame() {
    if (running) return;

    clearArea();

    bubbles = [];
    nextId = 1;

    score = 0;
    popped = 0;
    lives = MAX_LIVES;

    comboCount = 0;
    currentLevel = 1;
    freezeTimerMs = 0;
    feverTimerMs = 0;

    running = true;

    paused = false;
    $("#btn-pause").prop("disabled", false).text("Pause");
    $("#btn-start").removeClass("d-none");

    $body.removeClass("theme-lvl-2 theme-lvl-3 theme-lvl-4")
      .addClass("theme-lvl-1");

    $("#overlay").addClass("hidden");

    spawnBubble();

    tickTimer = setInterval(tick, TICK_MS);

    spawnTimer = setInterval(spawnBubble, LEVELS[0].spawnMs);

    render();
  }

  function stopTimers() {
    clearInterval(tickTimer);
    clearInterval(spawnTimer);
}

function togglePause() {
    if (!running) return;

    paused = !paused;

    if (paused) {
        stopTimers();
        $("#btn-pause").text("Resume");
        $("#overlay-title").text("Game Paused");
        $("#overlay-text").text("Press Resume or hit 'P' to continue.");
        $("#btn-start").addClass("d-none");
        $("#overlay").removeClass("hidden");
    } else {
        $("#btn-pause").text("Pause");
        $("#btn-start").removeClass("d-none");
        $("#overlay").addClass("hidden");
        tickTimer = setInterval(tick, TICK_MS);
        spawnTimer = setInterval(spawnBubble, LEVELS[currentLevel - 1].spawnMs);
    }
}

  function endGame() {
    running = false;

    stopTimers();

    $("#btn-pause").prop("disabled", true);

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bubbleBestScore", bestScore);
    }

    $("#overlay-title").text("Game Over");

    $("#overlay-text").text(
      `You reached Level ${currentLevel}, popped ${popped} bubbles, and scored ${score} points!`
    );

    $("#btn-start").text("Play Again");

    $("#overlay").removeClass("hidden");
  }

  function resetGame() {
    paused = false;
    $("#btn-pause").prop("disabled", true).text("Pause");
    $("#btn-start").removeClass("d-none");
    running = false;

    stopTimers();
    clearArea();
    $area.removeClass("fever-active");

    bubbles = [];
    nextId = 1;

    score = 0;
    popped = 0;
    lives = MAX_LIVES;

    comboCount = 0;
    currentLevel = 1;
    freezeTimerMs = 0;
    feverTimerMs = 0;

    $body.removeClass("theme-lvl-2 theme-lvl-3 theme-lvl-4")
      .addClass("theme-lvl-1");

    $("#overlay-title").text("Ready for the Challenge?");

    $("#overlay-text").text(
      "Pop bubbles before they burst! Watch for Golden (Extra Life), Freeze (Slow Motion), Bomb (Hazard), and Chain Reaction bubbles."
    );

    $("#btn-start").text("Start Game");

    $("#overlay").removeClass("hidden");

    render();
  }

  // ---------- Rendering (data -> screen) ----------

  function clearArea() {
    $area.children(".bubble, .float-score").remove();
  }

  function floatText(x, y, text, type) {
    const $t = $("<span class='float-score'></span>")
      .text(text)
      .css({ left: x - 25, top: y - 10 })
      .appendTo($area);

    if (type === "bad") $t.addClass("bad");
    if (type === "gold") $t.addClass("gold");
    if (type === "freeze") $t.addClass("freeze");

    setTimeout(function () {
      $t.remove();
    }, 700);
  }

  function spawnShockwave(x, y, type) {
  const $s = $("<span class='shockwave'></span>")
    .css({ left: x, top: y, width: 70, height: 70 })
    .appendTo($area);

  if (type) $s.addClass(type);

  setTimeout(function () {
    $s.remove();
  }, 550);
}

  function renderHearts() {
    const $container = $("#lives-container").empty();

    for (let i = 0; i < MAX_LIVES; i++) {
      const isLost = i >= lives;

      const heartSvg = `
        <svg class="heart-icon ${isLost ? 'lost' : ''}" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 22 12.28 18.6 15.36 13.45 20.03L12 21.35z"/>
        </svg>
      `;

      $container.append(heartSvg);
    }
  }

  function render() {
    // 1. Remove DOM bubbles no longer in the array

    const liveIds = new Set(bubbles.map(b => b.id));

    $area.children(".bubble").each(function () {
      if (!liveIds.has($(this).data("id"))) $(this).remove();
    });

    // 2. Sync DOM nodes with bubbles array

    bubbles.forEach(function (b) {
      let $el = $("#bubble-" + b.id);

      if ($el.length === 0) {
        $el = $("<div class='bubble'></div>")
          .attr("id", "bubble-" + b.id)
          .addClass(b.type)
          .data("id", b.id)
          .appendTo($area);
      }

      const danger = (b.size - START_SIZE) / (MAX_SIZE - START_SIZE);

      $el[0].style.setProperty("--hue", Math.round(190 - 190 * danger));

      $el.css({
        width: b.size,
        height: b.size,
        left: b.x - b.size / 2,
        top: b.y - b.size / 2
      });
    });

    // 3. UI Indicators

    $("#score").text(score);
    $("#best-score").text(bestScore);
    $("#popped").text(popped);

    $("#level-display").text("Lvl " + currentLevel);
    $("#combo-display").text("x" + Math.max(1, comboCount));

    renderHearts();

    // 4. Debug Data Panel

    if ($("#data-panel").prop("open")) {
      const rows = bubbles.map(function (b) {
        return `{ id: ${String(b.id).padEnd(3)} type: ${b.type.padEnd(6)} size: ${b.size.toFixed(1).padEnd(4)} x: ${String(b.x).padEnd(3)} y: ${b.y} }`;
      });

      $("#data-view").text(
        "bubbles.length = " + bubbles.length + "\n" + (rows.join("\n") || "[ ]")
      );
    }
  }

  // ---------- Events ----------

  $area.on("pointerdown", ".bubble", function (e) {
    e.preventDefault();

    popBubble($(this).data("id"));
  });

  $("#btn-start").on("click", startGame);
  $("#btn-reset").on("click", resetGame);
  $("#btn-pause").on("click", togglePause);

  $(document).on("keydown", function (e) {
    if (e.key === "p" || e.key === "P") togglePause();
  });

  resetGame();

});