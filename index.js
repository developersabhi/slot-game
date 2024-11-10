const express = require('express');
const app = express();
const port = 3000;

// Available symbols for the slot game
const symbols = ['🍒', '🍉', '🍋', '🍊', '🍇', '⭐'];  // Including the wild symbol ('⭐')

// Hidden indices in the matrix
const hiddenIndices1 = [0, 1, 2, 3, 4];  // Hidden indices in the first row (row 1)
const hiddenIndices2 = [20, 21, 22, 23, 24];

// Winning combinations with all patterns (horizontal, vertical, and diagonal)
const winningCombinations = [
  // Horizontal lines
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [5, 6, 7, 8], [6, 7, 8, 9],
  [10, 11, 12, 13], [11, 12, 13, 14],
  [15, 16, 17, 18], [16, 17, 18, 19],
  // Vertical lines
  [5, 10, 15], [6, 11, 16], [7, 12, 17], [8, 13, 18], [9, 14, 19],
  [5, 10, 15, 20], [6, 11, 16, 21], [7, 12, 17, 22], [8, 13, 18, 23], [9, 14, 19, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  // Diagonal lines
  [5, 11, 17, 13, 9], [10, 16, 22, 18, 14], [15, 11, 7, 13, 19],
  [0, 6, 12, 18, 24], [20, 16, 12, 8, 4]
];

// Function to generate a 5x5 matrix with random symbols
function generateMatrix() {
  let matrix = Array(5).fill(null).map(() => Array(5).fill(null));

  // Fill matrix with random symbols, skipping hidden indices
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      if (hiddenIndices1.includes(index) || hiddenIndices2.includes(index)) {
        matrix[row][col] = null;
      } else {
        matrix[row][col] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
  }

  // Verify all visible indices are assigned a symbol
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      if (!hiddenIndices1.includes(index) && !hiddenIndices2.includes(index) && matrix[row][col] === null) {
        matrix[row][col] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
  }
  
  return matrix;
}

// Function to handle Wild expansion and respins
function handleWilds(matrix) {
  let respins = 0;
  let wildsExist;

  do {
    wildsExist = false;

    // Look for Wild symbols and expand them on reels 2, 3, and 4
    for (let col = 1; col <= 3; col++) {  // Columns 1, 2, and 3 (reels 2, 3, 4)
      for (let row = 0; row < 5; row++) {
        if (matrix[row][col] === '⭐') {
          wildsExist = true;
          // Expand wild symbol to fill the entire reel (column)
          for (let r = 0; r < 5; r++) matrix[r][col] = '⭐';
        }
      }
    }

    respins += 1;
  } while (wildsExist && respins < 3);  // Allow up to 3 respins

  return { matrix, respins };
}

// Function to check winning combinations
function checkWinner(matrix) {
  for (const combination of winningCombinations) {
    const values = combination.map(index => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      return matrix[row][col];
    });

    // Check for matching symbols (with wild symbol handling)
    if (values.every(value => value === values[0] && value !== null)) {
      return { winner: true, symbols: values[0], combination };
    }
  }
  return { winner: false };
}

// Slot game API route
app.get('/play', (req, res) => {
  const matrix = generateMatrix();
  console.log('Generated Matrix:');
  matrix.forEach(row => console.log(row));

  // Handle wilds expansion and respins
  const wildResult = handleWilds(matrix);
  const updatedMatrix = wildResult.matrix;

  const result = checkWinner(updatedMatrix);

  // Send response back
  if (result.winner) {
    res.json({
      winner: true,
      symbols: result.symbols,
      combination: result.combination,
      respins: wildResult.respins,
      matrix: updatedMatrix
    });
  } else {
    res.json({
      winner: false,
      message: 'No winner this time.',
      respins: wildResult.respins,
      matrix: updatedMatrix
    });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Slot game server is running at http://localhost:${port}`);
});
