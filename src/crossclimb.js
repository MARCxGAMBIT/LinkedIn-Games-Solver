export async function run() {
    const initialHints = await extractInitialHints();
    const wordLength = extractWordLength();
}

async function extractInitialHints() {
    btn = document.querySelector(".crossclimb__crab-btn:not(:disabled)");
    const hints = [];
    for (let i = 1; i < 6; ++i) {
        hints.push(document.querySelector("#crossclimb-clue-section-" + i).innerText);
        btn.click();
        await new Promise(resolve => setTimeout(resolve, 0))
    }
    return hints;
}

function extractWordLength() {
    const container = document.querySelector(".crossclimb__guess__container");
    const inner = container.querySelector(".crossclimb__guess__inner");
    const width = inner.querySelectorAll(".crossclimb__guess_box").length;
    return width;
}