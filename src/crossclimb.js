import { showSnackbar } from "./snackbar.js";

export async function run() {
    const initialHints = await extractInitialHints();
    const wordLength = extractWordLength();

    // generate prompt for AI to solve this
    showSnackbar(`Solve these ${wordLength}-letter words, which should form a neat word ladder: ${initialHints.join(";")}. There has to be a solution, no traps or red herrings. All hints (separated by semicolons) have to be used`);
}



async function extractInitialHints() {
    const container = document.querySelector(".crossclimb__guess__container");
    const guesses = container.querySelectorAll(".crossclimb__guess");

    const btn = document.querySelector(".crossclimb__crab-btn:not(:disabled)");
    const hints = [];

    for (let i = 1; i <= guesses.length; i++) {
        hints.push(document.querySelector("#crossclimb-clue-section-" + i).innerText);
        btn.click();
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    return hints;
}

function extractWordLength() {
    const container = document.querySelector(".crossclimb__guess__container");
    const inner = container.querySelector(".crossclimb__guess__inner");
    const width = inner.querySelectorAll(".crossclimb__guess_box").length;
    return width;
}