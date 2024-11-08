const express = require('express');
const app = express();
const port = 3000;

// Available symbols for the slot game
const symbols = ['🍒', '🍉', '🍋', '🍊', '🍇'];

// Hidden indices in the matrix (these will be set to null)
const hiddenIndices1 = [0, 1, 2, 3, 4];  // Hidden indices in the first row (row 1)
const hiddenIndices2 = [19, 20, 21, 22, 23, 24];  // Hidden indices in the last row (row 5)

// Winning Combinations (each array represents a set of 5 indices that need to match)
const winningCombinations = [
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [5, 11, 17, 13, 9],
  [15, 11, 7, 13, 19],
  [5, 6, 12, 8, 9],
  [15, 16, 12, 18, 19],
  [10, 16, 17, 18, 14],
  [10, 6, 7, 8, 14],
  [10, 6, 12, 8, 14]
];

// Function to generate a 5x5 matrix with random symbols
function generateMatrix() {
  let matrix = Array(5).fill(null).map(() => Array(5).fill(null));  // Create an empty 5x5 matrix

  // Fill matrix with random symbols except for the hidden indices
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;  // Calculate the index of the current element in the 1D array

      // If index is hidden, set it to null
      if (hiddenIndices1.includes(index) || hiddenIndices2.includes(index)) {
        matrix[row][col] = null;
      } else {
        // Assign a random symbol from the symbols array
        matrix[row][col] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
  }

  return matrix;
}

// Function to check if any of the winning combinations is a winner
function checkWinner(matrix) {
  for (const combination of winningCombinations) {
    // Map each index in the combination to its corresponding value in the matrix
    const values = combination.map(index => {
      const row = Math.floor(index / 5);  // Calculate row from index
      const col = index % 5;  // Calculate column from index
      return matrix[row][col];
    });

    // Check if all values are the same and not null
    if (values.every(value => value === values[0] && value !== null)) {
      return { winner: true, symbols: values[0], combination };  // Winner found
    }
  }
  return { winner: false };  // No winner found
}

// Slot game API route
app.get('/play', (req, res) => {
  const matrix = generateMatrix();  // Generate a new 5x5 matrix
  console.log('Matrix:');
  matrix.forEach(row => console.log(row));  // Display the matrix in the server console

  const result = checkWinner(matrix);  // Check if there's a winner

  if (result.winner) {
    res.json({
      winner: true,
      symbols: result.symbols,
      combination: result.combination,
      matrix: matrix
    });
  } else {
    res.json({
      winner: false,
      message: 'No winner this time.',
      matrix: matrix
    });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Slot game server is running at http://localhost:${port}`);
});
