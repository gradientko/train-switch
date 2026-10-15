<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    respond(['error' => 'Invalid JSON'], 400);
}

$score = $input['score'] ?? null;
$delivered = $input['delivered'] ?? null;
$time = $input['time'] ?? null;

if (!is_int($score) || !is_int($delivered) || !is_int($time)) {
    respond(['error' => 'Invalid result'], 422);
}

if (
    $score < 0 || $score > 100000000 ||
    $delivered < 0 || $delivered > 1000000 ||
    $time < 0 || $time > 86400
) {
    respond(['error' => 'Result out of range'], 422);
}

if (!isset($_SESSION['train_switch'])) {
    $_SESSION['train_switch'] = [
        'high_score' => 0,
        'best_delivered' => 0,
        'best_time' => 0,
        'games_played' => 0,
    ];
}

$_SESSION['train_switch']['high_score'] = max(
    $_SESSION['train_switch']['high_score'],
    $score
);

$_SESSION['train_switch']['best_delivered'] = max(
    $_SESSION['train_switch']['best_delivered'],
    $delivered
);

$_SESSION['train_switch']['best_time'] = max(
    $_SESSION['train_switch']['best_time'],
    $time
);

$_SESSION['train_switch']['games_played']++;

respond([
    'ok' => true,
    'highScore' => $_SESSION['train_switch']['high_score'],
    'bestDelivered' => $_SESSION['train_switch']['best_delivered'],
    'bestTime' => $_SESSION['train_switch']['best_time'],
    'gamesPlayed' => $_SESSION['train_switch']['games_played'],
]);
