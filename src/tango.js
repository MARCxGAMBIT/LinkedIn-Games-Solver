import { showSnackbar } from "./snackbar.js";
import { click } from "./click.js";

export async function run() {
    const board = document.querySelector(".lotka-board");
    if (board.classList.contains("lotka-board--disabled")) {
        showSnackbar("Please start the game first!");
        return;
    }
    const { grid, constraints } = await convertDOMInfo();
    solve(grid, constraints);
    await apply(grid);
}

async function convertDOMInfo() {
    const cells = [...document.querySelectorAll(".lotka-cell")];
    const size = Math.sqrt(cells.length);
    const grid = Array.from({ length: size }, () => new Array(size).fill(null));
    const constraints = {};

    let testCell = cells.find(cell => !cell.classList.contains("lotka-cell--locked"));
    const cellTypes = await determineCellTypes(testCell);

    cells.forEach((cell, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const locked = cell.classList.contains("lotka-cell--locked");
        grid[row][col] = {
            cell,
            locked,
            type: !locked ? undefined : cell.children[0].children[0].children[0].isEqualNode(cellTypes.a) ? "a" : "b",
        };

        for (let i = 1; i < cell.children.length; i++) {
            const constraintCell = cell.children[i];
            const condition = constraintCell.children[0].getAttribute("aria-label");
            const toCoords = constraintCell.className.includes("down") ? [row + 1, col] : [row, col + 1];
            (constraints[toCoords] ??= []).push({ condition, row, col });
        }
    });

    return { grid, constraints };
}

async function determineCellTypes(cell) {
    await click(cell);
    const a = cell.children[0].children[0].children[0].cloneNode(true);
    await click(cell);
    const b = cell.children[0].children[0].children[0].cloneNode(true);
    click(cell);

    return { a, b }
}

async function apply(grid) {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const type = grid[row][col].type;
            if (type === "a") {
                await click(grid[row][col].cell);
            } else {
                await click(grid[row][col].cell);
                await click(grid[row][col].cell);
            }
        }
    }
}

function solve(grid, constraints, cell = 0) {
    if (cell === grid.length ** 2) {
        return true;
    }

    const row = Math.floor(cell / grid.length);
    const col = cell % grid.length;
    if (grid[row][col].locked) {
        return solve(grid, constraints, cell + 1);
    }

    for (let type of ["a", "b"]) {
        grid[row][col].type = type;
        if (canCellBePlaced(grid, row, col, constraints)) {
            if (solve(grid, constraints, cell + 1)) {
                return true;
            }
        }
    }

    grid[row][col].type = undefined;
    return false;
}

function canCellBePlaced(grid, row, col, constraints) {
    const rowCells = grid[row].map(cell => cell.type ?? "x");
    const colCells = grid.map(row => row[col].type ?? "x");
    const type = grid[row][col].type;

    if (rowCells.join("").includes(type.repeat(3))) {
        return false;
    }

    if (colCells.join("").includes(type.repeat(3))) {
        return false;
    }

    if (rowCells.filter(cell => cell === type).length > 3) {
        return false;
    }

    if (colCells.filter(cell => cell === type).length > 3) {
        return false;
    }

    for (let constraint of constraints[[row, col]] ?? []) {
        const { condition, row: r, col: c } = constraint;
        if (condition === "Cross") {
            if (grid[r][c].type === type) {
                return false;
            }
        } else if (condition === "Equal") {
            if (grid[r][c].type !== type) {
                return false;
            }
        }
    }

    return true;
}
