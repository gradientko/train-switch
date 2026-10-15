<?php
session_start();

if (!isset($_SESSION['train_switch'])) {
    $_SESSION['train_switch'] = [
        'high_score' => 0,
        'best_delivered' => 0,
        'best_time' => 0,
        'games_played' => 0,
    ];
}

$stats = $_SESSION['train_switch'];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Train Switch — PHP + JavaScript</title>
  <meta name="description" content="Route trains to the correct platforms by switching railway junctions.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="shell">
  <header class="hero">
    <div>
      <span class="eyebrow">TRAIN SWITCH</span>
      <h1>Route the rails.</h1>
      <p>Flip the junctions, send each train to its matching platform and avoid collisions.</p>
    </div>
    <button id="restart" class="link-button" type="button">Restart</button>
  </header>

  <section class="stats">
    <div><span>Score</span><strong id="score">0</strong></div>
    <div><span>Best</span><strong id="best"><?= (int)$stats['high_score'] ?></strong></div>
    <div><span>Delivered</span><strong id="delivered">0</strong></div>
    <div><span>Time</span><strong id="time">0s</strong></div>
  </section>

  <section class="layout">
    <div class="game-wrap">
      <canvas id="game" width="900" height="700" aria-label="Train Switch game canvas"></canvas>

      <div class="overlay" id="overlay">
        <span class="eyebrow" id="overlay-kicker">READY</span>
        <h2 id="overlay-title">Control the junctions.</h2>
        <p id="overlay-copy">Blue trains need the blue platform. Orange trains need orange. Wrong routes cost a life.</p>
        <button id="start" type="button">Start game</button>
      </div>
    </div>

    <aside class="side">
      <section class="panel">
        <span class="eyebrow">JUNCTION A</span>
        <strong id="switch-a-label" class="status-title">UPPER</strong>
        <button id="switch-a" class="primary" type="button">SWITCH A</button>
      </section>

      <section class="panel">
        <span class="eyebrow">JUNCTION B</span>
        <strong id="switch-b-label" class="status-title">LOWER</strong>
        <button id="switch-b" class="primary" type="button">SWITCH B</button>
      </section>

      <section class="panel">
        <span class="eyebrow">STATUS</span>
        <strong id="status-title" class="status-title">Ready</strong>
        <p id="status-copy">Route trains to matching platforms before traffic gets too dense.</p>
      </section>

      <section class="legend">
        <div><i class="train-mark blue"></i><span>Blue platform</span></div>
        <div><i class="train-mark orange"></i><span>Orange platform</span></div>
        <div><i class="train-mark mint"></i><span>Mint platform</span></div>
      </section>

      <button id="pause" class="secondary" type="button">Pause</button>
    </aside>
  </section>

  <footer>
    <span>Canvas simulation · junction routing · PHP sessions</span>
    <span>train-switch</span>
  </footer>
</main>

<script>
window.TRAIN_STATS = <?= json_encode([
  'highScore' => (int)$stats['high_score'],
  'bestDelivered' => (int)$stats['best_delivered'],
  'bestTime' => (int)$stats['best_time'],
  'gamesPlayed' => (int)$stats['games_played']
]) ?>;
</script>
<script src="assets/app.js"></script>
</body>
</html>
