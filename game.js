// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size based on screen width
function setCanvasSize() {
    const maxWidth = Math.min(400, window.innerWidth);
    canvas.width = maxWidth;
    canvas.height = 700;
}

setCanvasSize();
window.addEventListener('resize', () => {
    setCanvasSize();
    calculateHexSize();
    drawInitialScreen();
});

// Load Images
const mathewImage = new Image();
mathewImage.src = 'images/Mathew.png';

const princessImage = new Image();
princessImage.src = 'images/Princess.png';

let imageLoaded = false;
let princessImageLoaded = false;

mathewImage.onload = () => {
    console.log('Mathew image loaded successfully');
    imageLoaded = true;
    drawInitialScreen();
};

princessImage.onload = () => {
    console.log('Princess image loaded successfully');
    princessImageLoaded = true;
    drawInitialScreen();
};

mathewImage.onerror = (e) => {
    console.error('Failed to load Mathew image:', e);
    imageLoaded = true;
    drawInitialScreen();
};

// Game State
let gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1
};

// Question System
let currentQuestion = null;
let questionTileAnswered = new Set(); // Track which question tiles have been answered
let currentDifficulty = 'medium'; // Track difficulty: easy, medium, hard
let wrongAnswerCount = 0;

function generateQuestion(difficulty = 'medium') {
    const operations = [
        { type: 'add', op: '+' },
        { type: 'subtract', op: '-' },
        { type: 'multiply', op: '×' }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    if (difficulty === 'easy') {
        // Easy: small numbers, addition/subtraction only
        if (operation.type === 'add') {
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            answer = num1 + num2;
        } else {
            num1 = Math.floor(Math.random() * 5) + 3;
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
            answer = num1 - num2;
        }
    } else if (difficulty === 'medium') {
        // Medium: normal range
        if (operation.type === 'add') {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 + num2;
        } else if (operation.type === 'subtract') {
            num1 = Math.floor(Math.random() * 10) + 5;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
        } else {
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            answer = num1 * num2;
        }
    } else { // hard
        // Hard: larger numbers
        if (operation.type === 'add') {
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * 15) + 5;
            answer = num1 + num2;
        } else if (operation.type === 'subtract') {
            num1 = Math.floor(Math.random() * 15) + 10;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
        } else {
            num1 = Math.floor(Math.random() * 8) + 2;
            num2 = Math.floor(Math.random() * 8) + 2;
            answer = num1 * num2;
        }
    }
    
    return {
        text: `${num1} ${operation.op} ${num2} = ?`,
        answer: answer,
        difficulty: difficulty
    };
}

function showQuestion(difficulty = 'medium') {
    currentDifficulty = difficulty;
    wrongAnswerCount = 0;
    currentQuestion = generateQuestion(currentDifficulty);
    document.getElementById('questionText').textContent = currentQuestion.text;
    document.getElementById('answerInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('questionModal').style.display = 'flex';
    document.getElementById('answerInput').focus();
}
function showMessage(title, message, autoReload = false, delay = 2000) {
    const modal = document.getElementById('questionModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Hide question elements and show message
    modalContent.innerHTML = `
        <h2>${title}</h2>
        <p style="font-size: 1.4em; margin: 20px 0; color: #333;">${message}</p>
    `;
    
    modal.style.display = 'flex';
    
    if (autoReload) {
        setTimeout(() => {
            location.reload();
        }, delay);
    }
}
function showMessage(title, message, autoReload = false, delay = 2000) {
    const modal = document.getElementById('questionModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Hide question elements and show message
    modalContent.innerHTML = `
        <h2>${title}</h2>
        <p style="font-size: 1.4em; margin: 20px 0; color: #333;">${message}</p>
    `;
    
    modal.style.display = 'flex';
    
    if (autoReload) {
        setTimeout(() => {
            location.reload();
        }, delay);
    }
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    const feedback = document.getElementById('feedback');
    
    if (userAnswer === currentQuestion.answer) {
        feedback.textContent = '✅ Correct! Great job!';
        feedback.style.color = '#4CAF50';
        gameState.score += 10;
        updateUI();
        
        // Mark this tile as answered
        questionTileAnswered.add(`${player.gridX},${player.gridY}`);
        
        setTimeout(() => {
            document.getElementById('questionModal').style.display = 'none';
            currentQuestion = null;
        }, 1000);
    } else {
        wrongAnswerCount++;
        
        // Make question easier after wrong answer
        if (wrongAnswerCount >= 1) {
            if (currentDifficulty === 'hard') {
                currentDifficulty = 'medium';
                feedback.textContent = `❌ Let's try an easier one!`;
            } else if (currentDifficulty === 'medium') {
                currentDifficulty = 'easy';
                feedback.textContent = `❌ Here's an easier question!`;
            } else {
                feedback.textContent = `❌ Try again!`;
            }
            
            feedback.style.color = '#f44336';
            
            setTimeout(() => {
                currentQuestion = generateQuestion(currentDifficulty);
                document.getElementById('questionText').textContent = currentQuestion.text;
                document.getElementById('answerInput').value = '';
                document.getElementById('feedback').textContent = '';
                document.getElementById('answerInput').focus();
            }, 1500);
        } else {
            feedback.textContent = `❌ Not quite. Try again!`;
            feedback.style.color = '#f44336';
            document.getElementById('answerInput').value = '';
            document.getElementById('answerInput').focus();
        }
    }
}

// Hexagon Settings (flat-top) - will be calculated based on canvas size
let hexRadius = 30;
let hexWidth = Math.sqrt(3) * hexRadius;
let hexHeight = 2 * hexRadius;
let horizontalSpacing = .90;
let verticalSpacing = 1.18;
let offsetMultiplier = 0.5;
const gridCols = 12;
const gridRows = 20;
let gridOffsetX = 150;
let gridOffsetY = 50;

// Calculate hex size based on canvas dimensions
function calculateHexSize() {
    const controlsHeight = 60; // Reduced space for controls
    const padding = 10;
    const availableWidth = canvas.width - (padding * 2);
    const availableHeight = canvas.height - controlsHeight - (padding * 2);
    
    // Calculate hex radius that fits the grid
    const radiusForWidth = availableWidth / (gridCols * Math.sqrt(3) * horizontalSpacing);
    const radiusForHeight = availableHeight / ((gridRows - 1) * 1.5 * verticalSpacing + 2);
    
    hexRadius = Math.min(radiusForWidth, radiusForHeight);
    hexWidth = Math.sqrt(3) * hexRadius;
    hexHeight = 2 * hexRadius;
    
    // Calculate exact grid dimensions
    const gridWidth = (gridCols - 1) * hexWidth * horizontalSpacing + hexWidth;
    const gridHeight = (gridRows - 1) * hexHeight * 0.75 * verticalSpacing + hexHeight;
    
    // Center the grid perfectly then shift down and right
    gridOffsetX = (canvas.width - gridWidth) / 2 + 20;
    gridOffsetY = ((canvas.height - controlsHeight) - gridHeight) / 2 + 40;
}

// Random starting position - limit to southern 1/4 of grid
const startCol = Math.floor(Math.random() * gridCols);
const startRow = Math.floor(gridRows * 0.75 + Math.random() * (gridRows * 0.25));

// Player Object (Mathew)
const player = {
    gridX: startCol,
    gridY: startRow,
    pixelX: 0,
    pixelY: 0,
    size: 40,
    color: '#FF6B6B',
    isFacingRight: true,
    moveSpeed: 0.15,
    targetGridX: startCol,
    targetGridY: startRow,
    isMoving: false
};

// Princess Object - in northern 1/4 of grid
const princess = {
    gridX: Math.floor(Math.random() * gridCols),
    gridY: Math.floor(Math.random() * (gridRows * 0.25)),
    pixelX: 0,
    pixelY: 0,
    size: 30
};

// Hexagonal Grid
let hexGrid = [];

// Create hex grid
function createHexGrid() {
    hexGrid = [];
    
    // Initialize all tiles as normal
    for (let row = 0; row < gridRows; row++) {
        hexGrid[row] = [];
        for (let col = 0; col < gridCols; col++) {
            hexGrid[row][col] = {
                row: row,
                col: col,
                type: 'normal',
                hasCoin: false
            };
        }
    }
    
    // Create strategic barriers at specific rows
    const barrierRows = [5, 10, 15]; // 3 barrier lines
    
    for (const barrierRow of barrierRows) {
        for (let col = 0; col < gridCols; col++) {
            // Row 10 is completely blocked - must go through question tiles
            // Other rows have gaps with lava/questions
            if (barrierRow === 10) {
                // No gaps - all question tiles to force answering
                hexGrid[barrierRow][col].type = 'question';
            } else {
                // Create gaps in other barriers
                const isGap = (col === 2 || col === 6 || col === 9);
                
                if (isGap) {
                    // Gaps filled with question tiles instead of empty
                    hexGrid[barrierRow][col].type = 'question';
                } else {
                    // Mix of lava and questions in barriers
                    const isLava = Math.random() < 0.3;
                    hexGrid[barrierRow][col].type = isLava ? 'lava' : 'question';
                }
            }
        }
    }
    
    // Add some random obstacles between barriers
    for (let row = 0; row < gridRows; row++) {
        if (!barrierRows.includes(row)) {
            for (let col = 0; col < gridCols; col++) {
                const isNorthernHalf = row < gridRows * 0.5;
                const lavaProbability = 0.08;
                const questionProbability = isNorthernHalf ? 0.15 : 0.08;
                
                if (Math.random() < lavaProbability) {
                    hexGrid[row][col].type = 'lava';
                } else if (Math.random() < questionProbability) {
                    hexGrid[row][col].type = 'question';
                }
            }
        }
    }
    
    // Ensure player doesn't start on lava
    if (hexGrid[player.gridY][player.gridX].type === 'lava' || hexGrid[player.gridY][player.gridX].type === 'question') {
        let newCol, newRow;
        do {
            newCol = Math.floor(Math.random() * gridCols);
            newRow = Math.floor(Math.random() * gridRows);
        } while (hexGrid[newRow][newCol].type === 'lava' || hexGrid[newRow][newCol].type === 'question');
        
        player.gridX = newCol;
        player.gridY = newRow;
        player.targetGridX = newCol;
        player.targetGridY = newRow;
    }
}

// Convert grid coordinates to pixel coordinates (flat-top, columns offset vertically)
function hexToPixel(col, row) {
    const x = col * hexWidth * horizontalSpacing + gridOffsetX;
    const y = row * hexHeight * 0.75 * verticalSpacing + (col % 2) * (hexHeight * 0.75 * verticalSpacing * offsetMultiplier) + gridOffsetY;
    return { x, y };
}

// Input Handling
const keys = {};
let lastMoveTime = 0;
const moveDelay = 200;

// Convert pixel coordinates to hex grid coordinates (flat-top, columns offset)
function pixelToHex(x, y) {
    x -= gridOffsetX;
    y -= gridOffsetY;
    
    const col = Math.round(x / (hexWidth * horizontalSpacing));
    const rowOffset = (col % 2) * (hexHeight * 0.75 * verticalSpacing * offsetMultiplier);
    const row = Math.round((y - rowOffset) / (hexHeight * 0.75 * verticalSpacing));
    
    const clampedCol = Math.max(0, Math.min(gridCols - 1, col));
    const clampedRow = Math.max(0, Math.min(gridRows - 1, row));
    
    return { col: clampedCol, row: clampedRow };
}

// Check if two hexagons are adjacent (neighbors)
function areHexagonsAdjacent(col1, row1, col2, row2) {
    const colDiff = col2 - col1;
    const rowDiff = row2 - row1;
    
    // In flat-top hex grid with column offset, neighbors depend on column parity
    // Even columns are offset down, odd columns are at base position
    const isEvenCol = col1 % 2 === 0;
    
    let neighbors;
    if (isEvenCol) {
        // Even column neighbors (offset down)
        neighbors = [
            { dc: 1, dr: 0 },   // down-right
            { dc: -1, dr: 0 },  // down-left
            { dc: 0, dr: 1 },   // down
            { dc: 0, dr: -1 },  // up
            { dc: 1, dr: -1 },  // up-right
            { dc: -1, dr: -1 }  // up-left
        ];
    } else {
        // Odd column neighbors (base position)
        neighbors = [
            { dc: 1, dr: 0 },   // down-right
            { dc: -1, dr: 0 },  // down-left
            { dc: 0, dr: 1 },   // down
            { dc: 0, dr: -1 },  // up
            { dc: 1, dr: 1 },   // up-right
            { dc: -1, dr: 1 }   // up-left
        ];
    }
    
    return neighbors.some(n => n.dc === colDiff && n.dr === rowDiff);
}

// Mouse/Touch click handler
function handleClick(x, y) {
    if (player.isMoving) return;
    
    const now = Date.now();
    if (now - lastMoveTime < moveDelay) return;
    
    const hexCoords = pixelToHex(x, y);
    
    if (hexCoords.col >= 0 && hexCoords.col < gridCols && 
        hexCoords.row >= 0 && hexCoords.row < gridRows) {
        
        // Check if target hex is adjacent to current position
        if (!areHexagonsAdjacent(player.gridX, player.gridY, hexCoords.col, hexCoords.row)) {
            return; // Can only move to adjacent hexagons
        }
        
        player.targetGridX = hexCoords.col;
        player.targetGridY = hexCoords.row;
        player.isMoving = true;
        lastMoveTime = now;
        
        // Update facing direction
        if (hexCoords.col > player.gridX) {
            player.isFacingRight = true;
        } else if (hexCoords.col < player.gridX) {
            player.isFacingRight = false;
        }
        
        // Don't auto-start game anymore, let renderLoop handle movement
        
        if (hexGrid[hexCoords.row][hexCoords.col].hasCoin) {
            hexGrid[hexCoords.row][hexCoords.col].hasCoin = false;
            gameState.score += 10;
            updateUI();
        }
    }
}

// Mouse click event
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleClick(x, y);
});

// Touch event
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleClick(x, y);
}, { passive: false });

// Update Player Position
function updatePlayer() {
    if (player.isMoving) {
        const targetPos = hexToPixel(player.targetGridX, player.targetGridY);
        const currentX = player.pixelX;
        const currentY = player.pixelY;
        
        const dx = targetPos.x - currentX;
        const dy = targetPos.y - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const moveSpeed = 5;
        
        if (distance <= moveSpeed) {
            // Snap exactly to hex center when close enough
            player.gridX = player.targetGridX;
            player.gridY = player.targetGridY;
            player.pixelX = targetPos.x;
            player.pixelY = targetPos.y;
            player.isMoving = false;
                        // Check if player reached the princess
            if (player.gridX === princess.gridX && player.gridY === princess.gridY) {
                showMessage('🎉 Victory!', 'Mathew saved the princess!', true, 3000);
                return;
            }
            
            // Check if player landed on lava
            if (hexGrid[player.gridY][player.gridX].type === 'lava') {
                gameState.lives--;
                updateUI();
                
                if (gameState.lives <= 0) {
                    showMessage('💀 Game Over!', 'Mathew fell into lava!', true, 2000);
                } else {
                    showMessage('🔥 Ouch!', `Mathew fell into lava!<br>Lives remaining: ${gameState.lives}`, true, 1500);
                    // Respawn at random position
                    let newCol, newRow;
                    do {
                        newCol = Math.floor(Math.random() * gridCols);
                        newRow = Math.floor(Math.random() * gridRows);
                    } while (hexGrid[newRow][newCol].type === 'lava');
                    
                    player.gridX = newCol;
                    player.gridY = newRow;
                    player.targetGridX = newCol;
                    player.targetGridY = newRow;
                }
            }
            
            // Check if player landed on a question tile
            const tileKey = `${player.gridX},${player.gridY}`;
            if (hexGrid[player.gridY][player.gridX].type === 'question' && !questionTileAnswered.has(tileKey)) {
                // Determine difficulty based on position
                const rowPosition = player.gridY / gridRows;
                let difficulty = 'easy';
                if (rowPosition < 0.33) {
                    difficulty = 'hard'; // Northern third (near princess)
                } else if (rowPosition < 0.66) {
                    difficulty = 'medium'; // Middle third
                }
                showQuestion(difficulty);
            }
        } else {
            // Move towards target
            player.pixelX += (dx / distance) * moveSpeed;
            player.pixelY += (dy / distance) * moveSpeed;
        }
    } else {
        // Initialize or maintain pixel position when not moving
        const pos = hexToPixel(player.gridX, player.gridY);
        player.pixelX = pos.x;
        player.pixelY = pos.y;
    }
}

// Draw hexagon (flat-top orientation)
function drawHexagon(x, y, radius, fillColor, strokeColor = '#333') {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + radius * Math.cos(angle);
        const hy = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(hx, hy);
        } else {
            ctx.lineTo(hx, hy);
        }
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw hex grid
function drawHexGrid() {
    if (!hexGrid || hexGrid.length === 0) return;
    
    // Reduce hex size slightly to create visible gaps based on spacing
    const drawRadius = hexRadius * 0.95;
    
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const pos = hexToPixel(col, row);
            const hex = hexGrid[row][col];
            
            let fillColor, strokeColor;
            if (hex.type === 'lava') {
                fillColor = '#FF5722';
                strokeColor = '#D84315';
            } else if (hex.type === 'question') {
                fillColor = '#FFD700';
                strokeColor = '#FFA500';
            } else {
                fillColor = '#7CB342';
                strokeColor = '#558B2F';
                if ((row + col) % 2 === 0) {
                    fillColor = '#8BC34A';
                }
            }
            
            drawHexagon(pos.x, pos.y, drawRadius, fillColor, strokeColor);
        }
    }
}

// Draw Player
function drawPlayer() {
    ctx.save();
    
    if (mathewImage.complete && mathewImage.naturalWidth > 0) {
        if (!player.isFacingRight) {
            ctx.translate(player.pixelX, player.pixelY);
            ctx.scale(-1, 1);
            ctx.drawImage(mathewImage, -player.size / 2, -player.size / 2, player.size, player.size);
        } else {
            ctx.drawImage(mathewImage, player.pixelX - player.size / 2, player.pixelY - player.size / 2, player.size, player.size);
        }
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.pixelX - player.size / 2, player.pixelY - player.size / 2, player.size, player.size);
    }
    
    ctx.restore();
}

// Draw Princess
function drawPrincess() {
    const pos = hexToPixel(princess.gridX, princess.gridY);
    princess.pixelX = pos.x;
    princess.pixelY = pos.y;
    
    ctx.save();
    
    if (princessImage.complete && princessImage.naturalWidth > 0) {
        ctx.drawImage(princessImage, princess.pixelX - princess.size / 2, princess.pixelY - princess.size / 2, princess.size, princess.size);
    } else {
        // Fallback: Draw princess as a pink circle with crown
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(princess.pixelX, princess.pixelY, princess.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw Background
function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Game Loop
function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    drawBackground();
    updatePlayer();
    drawHexGrid();
    drawPrincess();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// Continuous render loop for responsive controls
function renderLoop() {
    drawBackground();
    updatePlayer();
    drawHexGrid();
    drawPrincess();
    drawPlayer();
    
    requestAnimationFrame(renderLoop);
}

// UI Updates
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// Reset Player Position
function resetPlayer() {
    player.gridX = 5;
    player.gridY = 5;
    player.targetGridX = 5;
    player.targetGridY = 5;
    player.isMoving = false;
    updatePlayer();
}

// Start Game
function startGame() {
    gameState.isRunning = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = 3;
    
    createHexGrid();
    resetPlayer();
    updateUI();
    gameLoop();
}

// Pause Game
function togglePause() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    document.getElementById('pauseBtn').textContent = gameState.isPaused ? 'Resume' : 'Pause';
    
    if (!gameState.isPaused) {
        gameLoop();
    }
}

// Button Event Listeners removed - game auto-starts

// Title Screen Event Listener
document.getElementById('startGameBtn').addEventListener('click', () => {
    document.getElementById('titleScreen').style.display = 'none';
    gameState.isRunning = true;
    gameState.isPaused = false;
});

// Question Modal Event Listeners
document.getElementById('submitAnswer').addEventListener('click', checkAnswer);
document.getElementById('answerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Initial Draw
function drawInitialScreen() {
    calculateHexSize();
    drawBackground();
    createHexGrid();
    drawHexGrid();
    drawPrincess();
    updatePlayer();
    drawPlayer();
}

// Game starts paused until title screen is dismissed
gameState.isRunning = false;
gameState.isPaused = true;
createHexGrid();
updatePlayer();
renderLoop();
