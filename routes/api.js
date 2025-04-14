'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  const solver = new SudokuSolver();

  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const validation = solver.validate(puzzle);
      if (validation !== true) {
        return res.json({ error: validation });
      }

      const result = solver.solve(puzzle);
      return res.json(result);
    });

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const validation = solver.validate(puzzle);
      if (validation !== true) {
        return res.json({ error: validation });
      }

      const match = coordinate.match(/^([A-I])([1-9])$/i);
      if (!match) {
        return res.json({ error: 'Invalid coordinate' });
      }

      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      }

      const row = match[1].toUpperCase().charCodeAt(0) - 65;
      const col = parseInt(match[2]) - 1;

   
      const solved = solver.solve(puzzle);
      if (solved.error) {
        return res.json({ error: solved.error });
      }

      
      const solutionBoard = solved.solution;
      let adjusted = solutionBoard.split('');
      adjusted[row * 9 + col] = '.';
      const newBoard = adjusted.join('');

      const conflicts = [];
      if (!solver.checkRowPlacement(newBoard, row, col, value)) conflicts.push('row');
      if (!solver.checkColPlacement(newBoard, row, col, value)) conflicts.push('column');
      if (!solver.checkRegionPlacement(newBoard, row, col, value)) conflicts.push('region');

      if (conflicts.length > 0) {
        return res.json({ valid: false, conflict: conflicts });
      }

      return res.json({ valid: true });
    });
};
