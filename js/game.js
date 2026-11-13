
$(function () {
  "use strict";

  // ---------- Settings ----------
  const START_SIZE = 20;      
  const MAX_SIZE = 90;        
  const GROWTH = 0.8;         
  const TICK_MS = 50;         
  const SPAWN_MS = 1100;      
  const MAX_BUBBLES = 10;     
  const MAX_LIVES = 3;

  // ---------- Game state ----------
  let bubbles = [];           
  let nextId = 1;             
  let score = 0, popped = 0, lives = MAX_LIVES;
  let running = false;
  let tickTimer = null, spawnTimer = null;

  const $area = $("#game-area");

  // ---------- Helpers ----------
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // SEARCH: linear search by id. Returns the bubble object or null.
  function findBubbleById(id) {
    for (let i = 0; i < bubbles.length; i++) {
      if (bubbles[i].id === id) return bubbles[i];
    }
    return null;
  }

  // ---------- Core operations ----------
  // ADD: create a bubble at a random spot (x, y = centre) fully inside the play area.
  function spawnBubble() {
    if (!running || bubbles.length >= MAX_BUBBLES) return;   // guard
    const half = MAX_SIZE / 2;
    const w = $area.width(), h = $area.height();
    if (w < MAX_SIZE || h < MAX_SIZE) return;
    bubbles.push({
      id: nextId++,
      size: START_SIZE,
      x: randomInt(half, w - half),
      y: randomInt(half, h - half)
    });
    render();
  }

  // UPDATE + REMOVE: grow all bubbles, then filter out the ones that reached max size.
  function tick() {
    if (!running) return;

    bubbles.forEach(function (b) { b.size += GROWTH; });        // traversal

    const burst = bubbles.filter(function (b) { return b.size >= MAX_SIZE; });
    bubbles = bubbles.filter(function (b) { return b.size < MAX_SIZE; });   // removal

    if (burst.length > 0) {
      burst.forEach(function (b) { floatText(b.x, b.y, "Burst!", true); });
      lives = Math.max(0, lives - burst.length);
      $area.addClass("burst");
      setTimeout(function () { $area.removeClass("burst"); }, 300);
    }

    render();
    if (lives === 0) endGame();
  }

  // POP: find the clicked bubble by id, award points, remove it from the array.
  function popBubble(id) {
    if (!running) return;                
    const b = findBubbleById(id);        
    if (b === null) return;              

    const points = 10 + Math.round((MAX_SIZE - b.size) / 10);   // small bubbles = bonus
    score += points;
    popped++;
    floatText(b.x, b.y, "+" + points, false);

    bubbles = bubbles.filter(function (item) { return item.id !== id; });   // removal
    render();
  }

  // ---------- Game flow ----------
  function startGame() {
    if (running) return;
    clearArea();
    bubbles = []; nextId = 1; score = 0; popped = 0; lives = MAX_LIVES;
    running = true;
    $("#overlay").addClass("hidden");
    spawnBubble();
    tickTimer = setInterval(tick, TICK_MS);
    spawnTimer = setInterval(spawnBubble, SPAWN_MS);
    render();
  }

  function stopTimers() {
    clearInterval(tickTimer);
    clearInterval(spawnTimer);
  }

  function endGame() {
    running = false;
    stopTimers();
    $("#overlay-title").text("Game over");
    $("#overlay-text").text("You popped " + popped + " bubble" + (popped === 1 ? "" : "s") +
                            " and scored " + score + " points.");
    $("#btn-start").text("Play again");
    $("#overlay").removeClass("hidden");
  }

  function resetGame() {
    running = false;
    stopTimers();
    clearArea();
    bubbles = []; nextId = 1; score = 0; popped = 0; lives = MAX_LIVES;
    $("#overlay-title").text("Ready?");
    $("#overlay-text").text("Click or tap a bubble to pop it. Bubbles turn red as they near bursting.");
    $("#btn-start").text("Start game");
    $("#overlay").removeClass("hidden");
    render();
  }

  // ---------- Rendering (data -> screen) ----------
  function clearArea() {
    $area.children(".bubble, .float-score").remove();
  }

  function floatText(x, y, text, bad) {
    const $t = $("<span class='float-score'></span>").text(text).toggleClass("bad", bad)
      .css({ left: x - 16, top: y - 10 }).appendTo($area);
    setTimeout(function () { $t.remove(); }, 700);
  }

  function render() {
    // 1. Remove DOM bubbles that are no longer in the array.
    const liveIds = new Set(bubbles.map(function (b) { return b.id; }));
    $area.children(".bubble").each(function () {
      if (!liveIds.has($(this).data("id"))) $(this).remove();
    });

    // 2. Create or update a DOM element for every bubble in the array.
    bubbles.forEach(function (b) {
      let $el = $("#bubble-" + b.id);
      if ($el.length === 0) {
        $el = $("<div class='bubble'></div>").attr("id", "bubble-" + b.id)
          .data("id", b.id).appendTo($area);
      }
      const danger = (b.size - START_SIZE) / (MAX_SIZE - START_SIZE);   // 0 -> 1
      $el[0].style.setProperty("--hue", Math.round(190 - 190 * danger));  // teal -> red
      $el.css({ width: b.size, height: b.size, left: b.x - b.size / 2, top: b.y - b.size / 2 });
    });

    // 3. Scoreboard.
    $("#score").text(score);
    $("#popped").text(popped);
    $("#lives .life").each(function (i) { $(this).toggleClass("lost", i >= lives); });

    // 4. Optional live view of the array (for the demonstration).
    if ($("#data-panel").prop("open")) {
      const rows = bubbles.map(function (b) {
        return "{ id: " + String(b.id).padEnd(3) + " size: " + b.size.toFixed(1).padEnd(5) +
               " x: " + String(b.x).padEnd(4) + " y: " + b.y + " }";
      });
      $("#data-view").text("bubbles.length = " + bubbles.length + "\n" + (rows.join("\n") || "[ ]"));
    }
  }

  // ---------- Events (jQuery) ----------
  // pointerdown on the bubble (instead of click) so a pop still registers while the bubble is resizing.
  $area.on("pointerdown", ".bubble", function (e) {
    e.preventDefault();
    popBubble($(this).data("id"));
  });
  $("#btn-start").on("click", startGame);
  $("#btn-reset").on("click", resetGame);

  resetGame();
});