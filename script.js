// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const canvasSize = 800;
canvas.width = canvasSize;
canvas.height = canvasSize;

let snake = [{ x: gridSize * 5, y: gridSize * 5 }];
let direction = { x: gridSize, y: 0 };
let food = getRandomFoodPosition();
let gameOver = false;
let speed = 100; // milliseconds per move
let lastMoveTime = 0;

// Variables to track average time to get food
let foodAppearTime = Date.now();
let foodEatenCount = 0;
let foodTimes = []; // Array to store each eating food time

function gameLoop(currentTime) {
    if (gameOver) {
        handleGameOver();
        return;
    }

    requestAnimationFrame(gameLoop);

    if (currentTime - lastMoveTime >= speed) {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        checkCollision();
        lastMoveTime = currentTime;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.lineJoin = 'round'; // Smooth the joints between snake segments
    ctx.lineCap = 'round';  // Smooth the ends of the segments

    // Create a gradient for the snake body
    snake.forEach((part, index) => {
        const gradient = ctx.createLinearGradient(part.x, part.y, part.x + gridSize, part.y + gridSize);
        gradient.addColorStop(0, "lime");
        gradient.addColorStop(1, "green");

        ctx.fillStyle = gradient;
        ctx.fillRect(part.x, part.y, gridSize, gridSize);

        // Add eyes and mouth to the head of the snake
        if (index === 0) {
            drawSnakeFeatures(part.x, part.y);
        }
    });
}

function drawSnakeFeatures(x, y) {
    // Draw eyes
    drawSnakeEyes(x, y);

    // Draw mouth
    ctx.fillStyle = "black";
    ctx.beginPath();
    const mouthWidth = gridSize / 4;
    const mouthHeight = gridSize / 4;
    ctx.moveTo(x + gridSize / 2, y + gridSize / 2); // Mouth base center
    ctx.lineTo(x + gridSize / 2 - mouthWidth / 2, y + gridSize / 2 + mouthHeight); // Left point
    ctx.lineTo(x + gridSize / 2 + mouthWidth / 2, y + gridSize / 2 + mouthHeight); // Right point
    ctx.closePath();
    ctx.fill();
}

function drawSnakeEyes(x, y) {
    // Eyes positioned near the top-left and top-right of the snake's head
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x + gridSize / 4, y + gridSize / 4, gridSize / 8, 0, Math.PI * 2); // Left eye
    ctx.arc(x + (3 * gridSize) / 4, y + gridSize / 4, gridSize / 8, 0, Math.PI * 2); // Right eye
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x + gridSize / 4, y + gridSize / 4, gridSize / 16, 0, Math.PI * 2); // Left pupil
    ctx.arc(x + (3 * gridSize) / 4, y + gridSize / 4, gridSize / 16, 0, Math.PI * 2); // Right pupil
    ctx.fill();
}

function moveSnake() {
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wrap-around behavior
    if (head.x >= canvasSize) head.x = 0;
    if (head.x < 0) head.x = canvasSize - gridSize;
    if (head.y >= canvasSize) head.y = 0;
    if (head.y < 0) head.y = canvasSize - gridSize;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        foodEaten();
    } else {
        snake.pop();
    }
}

function foodEaten() {
    // Calculate time to get food
    const currentTime = Date.now();
    const timeToGetFood = (currentTime - foodAppearTime) / 1000; // Convert to seconds
    foodTimes.push(timeToGetFood); // Store the time in seconds
    foodEatenCount++;

    // Place new food and reset the appearance time
    food = getRandomFoodPosition();
    foodAppearTime = currentTime;
}

function drawFood() {
    const opacity = 0.5 + 0.5 * Math.sin(Date.now() / 250); // Faster fade effect
    ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;

    // Draw a circle for the food
    ctx.beginPath();
    ctx.arc(
        food.x + gridSize / 2, // Center x-position of the circle
        food.y + gridSize / 2, // Center y-position of the circle
        gridSize / 2,          // Radius of the circle
        0,                     // Start angle in radians
        Math.PI * 2            // End angle in radians
    );
    ctx.fill();
    ctx.closePath();
}

function getRandomFoodPosition() {
    let x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
    let y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
    return { x, y };
}

function checkCollision() {
    const head = snake[0];

    // Check self-collision
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver = true;
        }
    }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;

    if (keyPressed === 37 && direction.x === 0) { // Left arrow
        direction = { x: -gridSize, y: 0 };
    } else if (keyPressed === 38 && direction.y === 0) { // Up arrow
        direction = { x: 0, y: -gridSize };
    } else if (keyPressed === 39 && direction.x === 0) { // Right arrow
        direction = { x: gridSize, y: 0 };
    } else if (keyPressed === 40 && direction.y === 0) { // Down arrow
        direction = { x: 0, y: gridSize };
    }
}

function resetGame() {
    snake = [{ x: gridSize * 5, y: gridSize * 5 }];
    direction = { x: gridSize, y: 0 };
    food = getRandomFoodPosition();
    gameOver = false;
    lastMoveTime = 0;

    // Reset tracking variables
    foodTimes = [];
    foodEatenCount = 0;
    foodAppearTime = Date.now();

    gameLoop(0);
}

function handleGameOver() {
    // Save the food times to localStorage
    localStorage.setItem("foodTimes", JSON.stringify(foodTimes));

    // Redirect to the chart page
    window.location.href = "chart.html";
}

document.addEventListener("keydown", changeDirection);
requestAnimationFrame(gameLoop);
