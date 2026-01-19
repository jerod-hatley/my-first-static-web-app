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
    level: 1,
    gradeLevel: '1',
    subject: 'math-mixed'
};

// Question System
let currentQuestion = null;
let questionTileAnswered = new Set(); // Track which question tiles have been answered
let currentDifficulty = 'medium'; // Track difficulty: easy, medium, hard
let wrongAnswerCount = 0;

function generateQuestion(difficulty = 'medium') {
    const gradeLevel = gameState.gradeLevel;
    const subject = gameState.subject;
    
    // Handle non-math subjects
    if (subject === 'reading') {
        return generateReadingQuestion(gradeLevel, difficulty);
    } else if (subject === 'science') {
        return generateScienceQuestion(gradeLevel, difficulty);
    } else if (subject === 'vocabulary') {
        return generateVocabularyQuestion(gradeLevel, difficulty);
    } else if (subject === 'music') {
        return generateMusicQuestion(gradeLevel, difficulty);
    }
    
    // Math questions
    let availableOperations = [];
    
    if (subject === 'addition' || subject === 'math-mixed') {
        availableOperations.push({ type: 'add', op: '+' });
    }
    if (subject === 'subtraction' || subject === 'math-mixed') {
        availableOperations.push({ type: 'subtract', op: '-' });
    }
    if (subject === 'multiplication' || subject === 'math-mixed') {
        if (gradeLevel !== 'K' && gradeLevel !== '1') {
            availableOperations.push({ type: 'multiply', op: '×' });
        }
    }
    if (subject === 'division' || subject === 'math-mixed') {
        if (parseInt(gradeLevel) >= 3) {
            availableOperations.push({ type: 'divide', op: '÷' });
        }
    }
    
    if (availableOperations.length === 0) {
        availableOperations.push({ type: 'add', op: '+' });
    }
    
    const operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];
    let num1, num2, answer;
    
    const ranges = {
        'K': { min: 1, max: 5, multMax: 2 },
        '1': { min: 1, max: 10, multMax: 5 },
        '2': { min: 1, max: 20, multMax: 10 },
        '3': { min: 1, max: 50, multMax: 12 },
        '4': { min: 1, max: 100, multMax: 12 },
        '5': { min: 1, max: 200, multMax: 15 }
    };
    
    const range = ranges[gradeLevel] || ranges['1'];
    let min = range.min;
    let max = range.max;
    let multMax = range.multMax;
    
    if (difficulty === 'easy') {
        max = Math.ceil(max * 0.5);
        multMax = Math.ceil(multMax * 0.6);
    } else if (difficulty === 'hard') {
        max = Math.ceil(max * 1.3);
        multMax = Math.ceil(multMax * 1.2);
    }
    
    if (operation.type === 'add') {
        num1 = Math.floor(Math.random() * max) + min;
        num2 = Math.floor(Math.random() * max) + min;
        answer = num1 + num2;
    } else if (operation.type === 'subtract') {
        num1 = Math.floor(Math.random() * max) + min;
        num2 = Math.floor(Math.random() * Math.min(num1, max)) + min;
        if (num2 > num1) {
            [num1, num2] = [num2, num1];
        }
        answer = num1 - num2;
    } else if (operation.type === 'multiply') {
        num1 = Math.floor(Math.random() * multMax) + 1;
        num2 = Math.floor(Math.random() * multMax) + 1;
        answer = num1 * num2;
    } else if (operation.type === 'divide') {
        num2 = Math.floor(Math.random() * multMax) + 1;
        const quotient = Math.floor(Math.random() * multMax) + 1;
        num1 = num2 * quotient;
        answer = quotient;
    }
    
    return {
        text: `${num1} ${operation.op} ${num2} = ?`,
        answer: answer,
        difficulty: difficulty,
        type: 'number'
    };
}

function generateSpellingQuestion(gradeLevel, difficulty) {
    const wordLists = {
        'K': ['cat', 'dog', 'hat', 'sun', 'run', 'big', 'red', 'can', 'see', 'the'],
        '1': ['play', 'jump', 'read', 'help', 'girl', 'blue', 'look', 'went', 'make', 'come'],
        '2': ['friend', 'school', 'happy', 'pretty', 'could', 'people', 'water', 'called', 'write', 'mother'],
        '3': ['beautiful', 'decided', 'middle', 'problem', 'answered', 'different', 'science', 'important', 'favorite', 'beginning'],
        '4': ['appreciate', 'necessary', 'chocolate', 'community', 'particular', 'restaurant', 'similar', 'vacation', 'usually', 'calendar'],
        '5': ['accommodate', 'embarrass', 'government', 'environment', 'kindergarten', 'necessary', 'privilege', 'recommended', 'separate', 'successful']
    };
    
    const words = wordLists[gradeLevel] || wordLists['1'];
    const word = words[Math.floor(Math.random() * words.length)];
    
    return {
        text: `Spell: "${word}"`,
        answer: word.toLowerCase(),
        difficulty: difficulty,
        type: 'text'
    };
}

function generateVocabularyQuestion(gradeLevel, difficulty) {
    const vocab = {
        'K': [
            { word: 'big', definition: 'large in size', answer: 'big' },
            { word: 'happy', definition: 'feeling good and joyful', answer: 'happy' },
            { word: 'fast', definition: 'moving quickly', answer: 'fast' }
        ],
        '1': [
            { word: 'brave', definition: 'showing courage', answer: 'brave' },
            { word: 'tiny', definition: 'very small', answer: 'tiny' },
            { word: 'shout', definition: 'to speak very loudly', answer: 'shout' }
        ],
        '2': [
            { word: 'curious', definition: 'wanting to learn or know', answer: 'curious' },
            { word: 'enormous', definition: 'very very big', answer: 'enormous' },
            { word: 'discover', definition: 'to find something new', answer: 'discover' }
        ],
        '3': [
            { word: 'ancient', definition: 'very old', answer: 'ancient' },
            { word: 'journey', definition: 'a long trip', answer: 'journey' },
            { word: 'brilliant', definition: 'very smart or bright', answer: 'brilliant' }
        ],
        '4': [
            { word: 'magnificent', definition: 'extremely beautiful or impressive', answer: 'magnificent' },
            { word: 'peculiar', definition: 'strange or unusual', answer: 'peculiar' },
            { word: 'analyze', definition: 'to examine carefully', answer: 'analyze' }
        ],
        '5': [
            { word: 'perseverance', definition: 'continuing despite difficulty', answer: 'perseverance' },
            { word: 'compassion', definition: 'caring about others suffering', answer: 'compassion' },
            { word: 'meticulous', definition: 'very careful and precise', answer: 'meticulous' }
        ]
    };
    
    const list = vocab[gradeLevel] || vocab['1'];
    const item = list[Math.floor(Math.random() * list.length)];
    
    return {
        text: `What word means: "${item.definition}"?`,
        answer: item.answer.toLowerCase(),
        difficulty: difficulty,
        type: 'text'
    };
}

function generateMusicQuestion(gradeLevel, difficulty) {
    const questions = {
        'K': [
            { text: 'What sound does a drum make?', answer: 'boom' },
            { text: 'How many beats does a whole note get?', answer: 4 },
            { text: 'What is the opposite of loud? (soft or quiet)', answer: 'soft' }
        ],
        '1': [
            { text: 'What are the first three notes in the musical alphabet?', answer: 'abc' },
            { text: 'How many lines are in a music staff?', answer: 5 },
            { text: 'What symbol tells you to play loud?', answer: 'f' }
        ],
        '2': [
            { text: 'What note gets 2 beats?', answer: 'half note' },
            { text: 'What are the notes in a C major chord? (c, e, g)', answer: 'c e g' },
            { text: 'What is tempo?', answer: 'speed' }
        ],
        '3': [
            { text: 'What does treble clef also called?', answer: 'g clef' },
            { text: 'How many beats in 4/4 time signature?', answer: 4 },
            { text: 'What is a group of singers called?', answer: 'choir' }
        ],
        '4': [
            { text: 'What interval is from C to G?', answer: 'fifth' },
            { text: 'What are the sharps in G major? (just the note)', answer: 'f' },
            { text: 'What does allegro mean?', answer: 'fast' }
        ],
        '5': [
            { text: 'How many semitones in an octave?', answer: 12 },
            { text: 'What key signature has 3 flats?', answer: 'e flat major' },
            { text: 'What does legato mean?', answer: 'smooth' }
        ]
    };
    
    const list = questions[gradeLevel] || questions['1'];
    const q = list[Math.floor(Math.random() * list.length)];
    
    return {
        text: q.text,
        answer: typeof q.answer === 'string' ? q.answer.toLowerCase() : q.answer,
        difficulty: difficulty,
        type: typeof q.answer === 'number' ? 'number' : 'text'
    };
}

function generateReadingQuestion(gradeLevel, difficulty) {
    const questions = {
        'K': [
            { text: 'The cat sat on the mat. Where is the cat?', answer: 'mat' },
            { text: 'The sun is hot. What is hot?', answer: 'sun' }
        ],
        '1': [
            { text: 'Tim has a red ball. He likes to play. What color is the ball?', answer: 'red' },
            { text: 'The dog ran fast to catch the ball. What did the dog do?', answer: 'ran' }
        ],
        '2': [
            { text: 'Sarah went to the park with her friend. They played on the swings. Who went to the park?', answer: 'sarah' },
            { text: 'The little bird built a nest in the tree. It was cozy. What did the bird build?', answer: 'nest' }
        ],
        '3': [
            { text: 'The brave knight rescued the princess from the tall tower. Who rescued the princess?', answer: 'knight' },
            { text: 'After school, Tom completed his homework before dinner. When did Tom do homework?', answer: 'after school' }
        ],
        '4': [
            { text: 'The ancient ruins were discovered by archaeologists in Egypt. Where were the ruins found?', answer: 'egypt' },
            { text: 'Photosynthesis is the process plants use to make food. What do plants make?', answer: 'food' }
        ],
        '5': [
            { text: 'The expedition to the Amazon rainforest revealed many undiscovered species. Where was the expedition?', answer: 'amazon' },
            { text: 'Despite numerous obstacles, she persevered and achieved her goal. What did she do?', answer: 'persevered' }
        ]
    };
    
    const list = questions[gradeLevel] || questions['1'];
    const q = list[Math.floor(Math.random() * list.length)];
    
    return {
        text: q.text,
        answer: q.answer.toLowerCase(),
        difficulty: difficulty,
        type: 'text'
    };
}

function generateScienceQuestion(gradeLevel, difficulty) {
    const questions = {
        'K': [
            { text: 'What do plants need to grow? (sun, water, or soil)', answer: 'sun' },
            { text: 'What season comes after winter?', answer: 'spring' }
        ],
        '1': [
            { text: 'What do bees make?', answer: 'honey' },
            { text: 'What is the center of our solar system?', answer: 'sun' }
        ],
        '2': [
            { text: 'What do caterpillars turn into?', answer: 'butterfly' },
            { text: 'What planet do we live on?', answer: 'earth' }
        ],
        '3': [
            { text: 'What is H2O commonly called?', answer: 'water' },
            { text: 'What force pulls objects to the ground?', answer: 'gravity' }
        ],
        '4': [
            { text: 'What gas do plants produce during photosynthesis?', answer: 'oxygen' },
            { text: 'What is the largest organ in the human body?', answer: 'skin' }
        ],
        '5': [
            { text: 'What is the process of water turning into vapor called?', answer: 'evaporation' },
            { text: 'What part of the cell contains genetic information?', answer: 'nucleus' }
        ]
    };
    
    const list = questions[gradeLevel] || questions['1'];
    const q = list[Math.floor(Math.random() * list.length)];
    
    return {
        text: q.text,
        answer: q.answer.toLowerCase(),
        difficulty: difficulty,
        type: 'text'
    };
}

function showQuestion(difficulty = 'medium') {
    currentDifficulty = difficulty;
    wrongAnswerCount = 0;
    currentQuestion = generateQuestion(currentDifficulty);
    document.getElementById('questionText').textContent = currentQuestion.text;
    document.getElementById('answerInput').value = '';
    
    // Update input type based on question type
    const inputField = document.getElementById('answerInput');
    if (currentQuestion.type === 'text') {
        inputField.type = 'text';
        inputField.placeholder = 'Type your answer';
    } else {
        inputField.type = 'number';
        inputField.placeholder = 'Your answer';
    }
    
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

function checkAnswer() {
    const inputField = document.getElementById('answerInput');
    let userAnswer;
    
    if (currentQuestion.type === 'text') {
        userAnswer = inputField.value.toLowerCase().trim();
    } else {
        userAnswer = parseInt(inputField.value);
    }
    
    const feedback = document.getElementById('feedback');
    const isCorrect = userAnswer === currentQuestion.answer || 
                      (typeof currentQuestion.answer === 'string' && userAnswer === currentQuestion.answer.toLowerCase());
    
    if (isCorrect) {
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
    // Capture selected settings
    gameState.gradeLevel = document.getElementById('gradeLevel').value;
    gameState.subject = document.getElementById('subject').value;
    
    // Hide title screen and start game
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
