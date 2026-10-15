# train-switch

A railway routing arcade game built with vanilla JavaScript and PHP sessions.

Trains enter from the left and move through two junction stages. The player flips railway switches to route every train to the correct colored platform.

## Features

- top-down railway map
- two interactive junction systems
- three destination platforms
- blue, orange and mint trains
- wrong-platform penalties
- three mistakes allowed
- train collision detection
- increasing traffic frequency
- increasing train speed
- score
- delivered counter
- survived time
- pause / restart
- keyboard controls
- mouse / touch controls
- PHP session high score
- best delivered count
- best survived time
- no framework
- no database

## Requirements

PHP 8.1+

## Run

```bash
php -S localhost:8000
```

Open:

```text
http://localhost:8000
```

## Controls

```text
1              switch Junction A
2              switch Junction B
P              pause
Space          start
Click junction switch it
```

## Routing

The first junction chooses the upper or lower route.

The second switch decides how those routes branch toward the platforms.

The target is determined by train color:

```text
Blue    -> blue platform
Orange  -> orange platform
Mint    -> mint platform
```

Orange is reachable from both upper and lower branches, so timing and current switch state matter.

## Difficulty

As time passes:

- trains spawn more often
- trains move faster
- multiple trains occupy the network at once
- collision risk increases

## PHP

PHP sessions store:

- high score
- best delivered count
- best survived time
- games played

The real-time railway simulation runs in JavaScript.

## Project structure

```text
train-switch/
├── index.php
├── score.php
├── assets/
│   ├── app.js
│   └── style.css
└── README.md
```

## Hosting

GitHub Pages cannot execute PHP.

Use PHP-capable hosting, a VPS, or PHP's built-in development server.

## License

MIT
