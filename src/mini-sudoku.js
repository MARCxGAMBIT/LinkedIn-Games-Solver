import { doubleclick } from "./click.js";
import { showSnackbar } from "./snackbar.js";

export async function run() {
    const board = document.querySelector(".sudoku-board");
    if ([...board.classList].some(c => c.includes("disabled"))) {
        showSnackbar("Please start the game first!");
        return;
    }
    
    const grid = parseBoard();
    if (!grid) {
        showSnackbar("Could not parse the sudoku board!");
        return;
    }
    
    solve(grid);
    await apply(grid);
}

function parseBoard() {
    const cells = [...document.querySelectorAll(".sudoku-cell")];
    if (cells.length !== 36) {
        return null;
    }
    
    const grid = Array.from({ length: 6 }, () => new Array(6).fill(null));
    
    // Parse grid and identify prefilled cells
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        const content = cell.querySelector(".sudoku-cell-content")?.textContent?.trim();
        const isPrefilled = cell.classList.contains("sudoku-cell-prefilled");
        
        grid[row][col] = {
            cell,
            value: isPrefilled && content ? parseInt(content) : 0,
            isPrefilled,
            row,
            col,
            index
        };
    });
    
    return grid;
}

function solve(grid) {
    return backtrack(grid, 0, 0);
}

function backtrack(grid, row, col) {
    if (row === 6) {
        return true; // Successfully filled the entire grid
    }
    
    const nextRow = col === 5 ? row + 1 : row;
    const nextCol = col === 5 ? 0 : col + 1;
    
    if (grid[row][col].isPrefilled) {
        return backtrack(grid, nextRow, nextCol);
    }
    
    for (let num = 1; num <= 6; num++) {
        if (isValidPlacement(grid, row, col, num)) {
            grid[row][col].value = num;
            
            if (backtrack(grid, nextRow, nextCol)) {
                return true;
            }
            
            grid[row][col].value = 0;
        }
    }
    
    return false;
}

function isValidPlacement(grid, row, col, num) {
    // Check row constraint
    for (let c = 0; c < 6; c++) {
        if (c !== col && grid[row][c].value === num) {
            return false;
        }
    }
    
    // Check column constraint
    for (let r = 0; r < 6; r++) {
        if (r !== row && grid[r][col].value === num) {
            return false;
        }
    }
    
    // Check 2x3 box constraint
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 2; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if ((r !== row || c !== col) && grid[r][c].value === num) {
                return false;
            }
        }
    }
    
    return true;
}

async function apply(grid) {
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = grid[row][col];
            if (!cell.isPrefilled && cell.value > 0) {
                // Click on the cell to select it
                await doubleclick(cell.cell);
                
                // Click on the number button
                const numberButton = document.querySelector(`[data-number="${cell.value}"]`);
                numberButton?.click();

                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    }
}
