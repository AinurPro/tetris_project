//get access to canvas
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32; // measures of the grid
// array with sequence of shapes, at the start - empty
var tetrominoSequence = [];

// using two-dimensional array, we see what is happening in each grid of the field
// field measures 10 to 20, a few more rows will be seen as well

var playfield = [];

// let's get filled the array with empty cells
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }

}

// giving the shapes 
const tetrominos = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ]
};
// give colors to shapes
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'J': 'blue',
    'L': 'orange'
};

//counter
let count = 0;
// current shape in the game
let tetromino = getNextTetromino();
console.log(tetromino)
    // observe the animations, we can stop the game in case it is needed
let rAF = null;
// game over is not active yet at the beginning of the game
let gameOver = false;
// generate the shapes that are falling
// get a random integer betweeb the range of [min, max]
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//generate a new tetromino sequence

function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }
    // get the first shape from the array
    const name = tetrominoSequence.pop();
    // create a matrix that we draw the shape with
    const matrix = tetrominos[name];

    // I and O start from the middle, the others - close to the left side

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);


    // I starts from 21st row (offset -1), the others from the 22nd row (offset -2)
    const row = name === 'I' ? -1 : -2;

    // function returns the following
    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col

    };
}

function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
    return result;
}

// checking whether the shape can rotate and whether it doesn't have any distractions
function isValidMove(matrix, cellRow, cellCol) {
    //check all columns and rows
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                    cellCol + col < 0 ||
                    cellCol + col >= playfield[0].length ||
                    cellRow + row >= playfield.length ||
                    playfield[cellRow + row][cellCol + col])) {
                return false;
            }
        }
    }
    return true;
}
// each shape is placed on its place
function placeTetramino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix.length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }



                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }
    for (let row = playfield.length - 1; row >= 0;) {
        // if the row is full
        if (playfield[row].every(cell => !!cell)) {
            // in case the row is filled with shapes, it will clear from the bottom to top
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }

        } else {
            row--;
        }
    }
    // we get the next shape
    tetromino = getNextTetromino();
}

function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    // we draw a black triangle in the middle of the game field
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.clientWidth, 60);
    // we put the note in white in the middle
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);

}
document.addEventListener('keydown', function(e) {
    if (gameOver) return;

    // right and left arrows
    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37
            // if to the left, we reduce the index in columns, if to the right, we increase the index in columns
            ?
            tetromino.col - 1 :
            tetromino.col + 1;
        // if we can move, then remember the current position
        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }
    // arrow up - rotate
    if (e.which === 38) {
        // we rotate the shape to 90 degrees
        const matrix = rotate(tetromino.matrix);
        // if we can move, then remember the current position
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }
    //arrow down will increase the speed to fall
    if (e.which === 40) {
        // we move the shape one arrow below
        const row = tetromino.row + 1;
        // if no space to move down, we rememebr the new position
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row = row - 1;
            // put in a place and see the filled rows
            placeTetramino();
            return;
        }
        // we rememebr the place where the shape is put
        tetromino.row = row;

    }
})

function loop() {
    // start animation
    rAF = requestAnimationFrame(loop);
    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // we draw a playfield based on the filled shapes

    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];

                // we draw one pixel smaller so we can see the effect in the "grids"
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }
    // we draw a current shape
    if (tetromino) {
        // shape is moving down every 235
        if (++count > 35) {
            tetromino.row++;
            count = 0;
            // if the movement is completed, we draw a shape in the filed and check whether we can clear the row
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetramino();
            }
        }
        // we remember the color of the shape
        context.fillStyle = colors[tetromino.name];

        // we draw the shape
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    // we draw again one pixel smaller 
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}
rAF = requestAnimationFrame(loop);