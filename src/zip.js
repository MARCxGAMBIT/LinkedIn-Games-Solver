import { click } from "./click.js";
import { showSnackbar } from "./snackbar.js";

export async function run() {
    const board = document.querySelector(".trail-board");
    if (!board || board.classList.contains("trail-board--disabled")) {
        showSnackbar("Please start the game first!");
        return;
    }
    
    const { grid, numbers, walls } = parseBoard();
    if (!grid) {
        showSnackbar("Could not parse the ZIP board!");
        return;
    }
    
    const path = solve(grid, numbers, walls);
    if (!path) {
        showSnackbar("No solution found!");
        return;
    }
    
    await apply(grid, path);
}

function parseBoard() {
    const cells = [...document.querySelectorAll(".trail-cell")];
    const gridSize = Math.sqrt(cells.length);
    
    if (gridSize !== Math.floor(gridSize)) {
        return { grid: null, numbers: null, walls: null };
    }
    
    const grid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(null));
    const numbers = {};
    const walls = new Set();
    
    cells.forEach((cell, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const content = cell.querySelector(".trail-cell-content")?.textContent?.trim();
        
        grid[row][col] = {
            cell,
            row,
            col,
            index,
            number: content ? parseInt(content) : null,
            visited: false
        };
        
        // Store numbered cells
        if (content && !isNaN(parseInt(content))) {
            numbers[parseInt(content)] = { row, col };
        }
        
        // Check for walls (cells with wall elements)
        const hasWallDown = cell.querySelector(".trail-cell-wall--down");
        if (hasWallDown) {
            walls.add(`${row},${col},${row + 1},${col}`);
        }
        
        // Add more wall directions if needed
        const hasWallRight = cell.querySelector(".trail-cell-wall--right");
        if (hasWallRight) {
            walls.add(`${row},${col},${row},${col + 1}`);
        }
    });
    
    return { grid, numbers, walls };
}

function solve(grid, numbers, walls) {
    const gridSize = grid.length;
    const numberKeys = Object.keys(numbers).map(n => parseInt(n)).sort((a, b) => a - b);
    
    if (numberKeys.length === 0) {
        return null;
    }
    
    // Start from the first number
    const startNum = numberKeys[0];
    const startPos = numbers[startNum];
    
    const path = [];
    const visited = Array.from({ length: gridSize }, () => new Array(gridSize).fill(false));
    
    if (findPath(grid, numbers, walls, numberKeys, 0, startPos.row, startPos.col, path, visited)) {
        return path;
    }
    
    return null;
}

function findPath(grid, numbers, walls, numberKeys, currentNumberIndex, row, col, path, visited) {
    const gridSize = grid.length;
    
    // Check bounds
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize || visited[row][col]) {
        return false;
    }
    
    // Mark as visited and add to path
    visited[row][col] = true;
    path.push({ row, col });
    
    // Check if we're on a required number
    const currentNumber = grid[row][col].number;
    if (currentNumber !== null) {
        const expectedNumber = numberKeys[currentNumberIndex];
        if (currentNumber !== expectedNumber) {
            // Wrong number, backtrack
            visited[row][col] = false;
            path.pop();
            return false;
        }
        currentNumberIndex++;
    }
    
    // Check if we've completed the path
    if (currentNumberIndex === numberKeys.length && path.length === gridSize * gridSize) {
        return true; // Success!
    }
    
    // If we've hit all numbers but haven't visited all cells, continue exploring
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Check if there's a wall blocking this move
        if (hasWall(walls, row, col, newRow, newCol)) {
            continue;
        }
        
        if (findPath(grid, numbers, walls, numberKeys, currentNumberIndex, newRow, newCol, path, visited)) {
            return true;
        }
    }
    
    // Backtrack
    visited[row][col] = false;
    path.pop();
    return false;
}

function hasWall(walls, fromRow, fromCol, toRow, toCol) {
    const wall1 = `${fromRow},${fromCol},${toRow},${toCol}`;
    const wall2 = `${toRow},${toCol},${fromRow},${fromCol}`;
    return walls.has(wall1) || walls.has(wall2);
}

async function apply(grid, path) {
    // Clear any existing path first
    for (const current of path) {
        const currentCell = grid[current.row][current.col].cell;
        await click(currentCell);
    }
}