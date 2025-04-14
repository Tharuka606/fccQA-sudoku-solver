class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) return 'Required field missing';
    if (/[^1-9.]/g.test(puzzleString)) return 'Invalid characters in puzzle';
    if (puzzleString.length !== 81) return 'Expected puzzle to be 81 characters long';
    return true;
  }

  stringToGrid(puzzleString) {
    let grid = [];
    for (let i = 0; i < 81; i += 9) {
      grid.push(puzzleString.slice(i, i + 9).split(''));
    }
    return grid;
  }

  gridToString(grid) {
    return grid.flat().join('');
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    for (let j = 0; j < 9; j++) {
      if (j !== column && grid[row][j] === value) return false;
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][column] === value) return false;
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const grid = this.stringToGrid(puzzleString);
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(column / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if ((i !== row || j !== column) && grid[i][j] === value) return false;
      }
    }
    return true;
  }

  solveGrid(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === '.') {
          for (let num = 1; num <= 9; num++) {
            const val = num.toString();
            const str = this.gridToString(grid);
            if (
              this.checkRowPlacement(str, row, col, val) &&
              this.checkColPlacement(str, row, col, val) &&
              this.checkRegionPlacement(str, row, col, val)
            ) {
              grid[row][col] = val;
              if (this.solveGrid(grid)) return true;
              grid[row][col] = '.';
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve(puzzleString) {
    const validation = this.validate(puzzleString);
    if (validation !== true) return { error: validation };

    const grid = this.stringToGrid(puzzleString);

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const val = grid[row][col];
        if (val !== '.') {
          grid[row][col] = '.';
          const str = this.gridToString(grid);
          const validPlacement =
            this.checkRowPlacement(str, row, col, val) &&
            this.checkColPlacement(str, row, col, val) &&
            this.checkRegionPlacement(str, row, col, val);
          grid[row][col] = val;
          if (!validPlacement) {
            return { error: 'Puzzle cannot be solved' };
          }
        }
      }
    }

    const solved = this.solveGrid(grid);
    if (!solved) return { error: 'Puzzle cannot be solved' };

    return { solution: this.gridToString(grid) };
  }
}

module.exports = SudokuSolver;
