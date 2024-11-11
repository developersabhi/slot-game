const express = require('express');
const app = express();
const port = 3000;

// Available keys for the slot game (including 'W' for wild)
const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'W'];  // 'W' is for wild key

// Hidden indices in the matrix
const hiddenIndices1 = [0, 1, 2, 3, 4];  // Hidden indices in the first row (row 1)
const hiddenIndices2 = [20, 21, 22, 23, 24];

// Winning combinations with all patterns (horizontal, vertical, and diagonal)
const winningCombinations = [
  // Horizontal lines
  [5, 6, 7, 8, 9],
  [5, 6, 7, 8], [6, 7, 8, 9],
  [5, 6, 7], [7, 8, 9],

  [10, 11, 12, 13, 14],
  [10, 11, 12, 13], [11, 12, 13, 14],
  [10, 11, 12], [12, 13, 14],

  [15, 16, 17, 18, 19],
  [15, 16, 17, 18], [16, 17, 18, 19],
  [15, 16, 17], [17, 18, 19],

  // Diagonal lines
  [5, 11, 17, 13, 9],
  [10, 16, 22, 18, 14],
  [15, 11, 7, 13, 19],
  [0, 6, 12, 18, 24],
  [20, 16, 12, 8, 4],
];

// Bet amount (for simplicity, assume a fixed bet)
const betAmount = 10;  


function generateMatrix() {
  let matrix = Array(5).fill(null).map(() => Array(5).fill(null));

  // Fill matrix with random keys, skipping hidden indices
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      if (hiddenIndices1.includes(index) || hiddenIndices2.includes(index)) {
        matrix[row][col] = null;
      } else {
        matrix[row][col] = keys[Math.floor(Math.random() * keys.length)];
      }
    }
  }


  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      if (!hiddenIndices1.includes(index) && !hiddenIndices2.includes(index) && matrix[row][col] === null) {
        matrix[row][col] = keys[Math.floor(Math.random() * keys.length)];
      }
    }
  }
  
  return matrix;
}


function handleWilds(matrix) {
  let respins = 0;
  let wildsExist;

  do {
    wildsExist = false;

    // r Wild keys and expand on reels 2, 3, and 4
    for (let col = 1; col <= 3; col++) {  // Columns 1, 2, and 3 (reels 2, 3, 4)
      for (let row = 0; row < 5; row++) {
        if (matrix[row][col] === 'W') {  // 'W' is the wild key
          wildsExist = true;
          // Expand wild key to fill the entire reel (column)
          for (let r = 0; r < 5; r++) matrix[r][col] = 'W';
        }
      }
    }

    respins += 1;
  } while (wildsExist && respins < 3);  // 3 re-spins

  return { matrix, respins };
}


function checkWinner(matrix) {
  const payouts = {
    'A': [25, 20, 5],   // 5, 4, 3 times for 'A'
    'B': [12, 6, 2.5],   // 5, 4, 3 times for 'B'
    'C': [6, 2.5, 1],    // 5, 4, 3 times for 'C'
    'D': [2.5, 1, 0.5],  // 5, 4, 3 times for 'D'
    'E': [2.5, 1, 0.5],  // 5, 4, 3 times for 'E'
    'F': [1.5, 0.8, 0.3], // 5, 4, 3 times for 'F'
    'G': [1.5, 0.8, 0.3]  // 5, 4, 3 times for 'G'
  };

  for (const combination of winningCombinations) {
    const values = combination.map(index => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      return matrix[row][col];
    });

    
    const firstKey = values[0];
    const count = values.filter(value => value === firstKey || value === 'W').length;

    if (values.every(value => value === firstKey || value === 'W') && firstKey !== null && firstKey !== 'W') {
      let payoutMultiplier = 0;

      // Set the multiplier based on the count of symbols
      if (count >= 5) {
        payoutMultiplier = payouts[firstKey][0];  
      } else if (count === 4) {
        payoutMultiplier = payouts[firstKey][1];  
      } else if (count === 3) {
        payoutMultiplier = payouts[firstKey][2];  
      }

      const payout = betAmount * payoutMultiplier;  // Calculate payout

      return { winner: true, keys: firstKey, combination, payout };
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
      keys: result.keys,
      combination: result.combination,
      payout: result.payout,  
      respins: wildResult.respins,
      matrix: updatedMatrix
    });
  } else {
    res.json({
      winner: false,
      message: 'No winner this time!',
      matrix: updatedMatrix
    });
  }
});

app.listen(port, () => {
  console.log(`Slot game API running at http://localhost:${port}`);
});
