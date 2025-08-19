import { doubleclick } from "./click.js";
import { showSnackbar } from "./snackbar.js";



export async function run() {
    const domGrid = document.getElementById("queens-grid");
    const cells = domGrid.querySelectorAll(".queens-cell-with-border");
    if ([...domGrid.parentElement.classList].some(c => c.includes("disabled"))) {
        showSnackbar("Please start the game first!");
        return;
    }
    const queenCount = Math.sqrt(cells.length);
    const grid = Array.from({ length: queenCount }, () => new Array(queenCount).fill(null));

    [...cells].forEach((cell, index) => {
        const row = Math.floor(index / queenCount);
        const col = index % queenCount;
        const color = [...cell.classList].find(x => x.startsWith("cell-color")).match(/\d+/)[0];
        const queen = false;

        grid[row][col] = {
            cell,
            color,
            queen,
        };
    });

    solve(grid);
    await apply(grid);
}

function canQueenBePlaced(grid, row, col) {
    for (let i = 0; i < grid.length; i++) {
        if (grid[row][i].queen || grid[i][col]?.queen) {
            return false;
        }
    }

    for (let [r, c] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        if (grid[row + r]?.[col + c]?.queen) {
            return false;
        }
    }

    const color = grid[row][col].color;
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].color === color && grid[r][c].queen) {
                return false;
            }
        }
    }

    return true;
}

function solve(grid, row = 0) {
    if (row === grid.length) {
        return true;
    }

    for (let col = 0; col < grid[row].length; col++) {
        if (canQueenBePlaced(grid, row, col)) {
            grid[row][col].queen = true;

            if (solve(grid, row + 1)) {
                return true;
            }

            grid[row][col].queen = false;
        }
    }

    return false;
}

async function apply(grid) {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col].queen) {
                const { cell } = grid[row][col];
                await doubleclick(cell);
            }
        }
    }
}
