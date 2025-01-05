(() => {
    let supportedGames = ["queens", "tango"];

    init();

    function init() {
        const game = detectGame();
        if (game) {
            initButton(game);
            initSnackbar();
        }
    };

    function detectGame() {
        const segments = location.pathname.split("/").filter(Boolean);
        if (segments[0] === "games") {
            game = segments[1];
        }

        if (game && supportedGames.includes(game)) {
            return game;
        }
        return undefined;
    }

    function initButton(game) {
        const controls = document.querySelector("div.aux-controls-wrapper.pr-game-web__aux-controls");
        if (!controls) {
            return;
        }
        const button = document.createElement("button");
        button.innerHTML = "Solve";
        button.className = "artdeco-button artdeco-button--premium artdeco-button--2 ember-view aux-controls-btn";
        button.onclick = async () => {
            const src = chrome.runtime.getURL(`src/${game}.js`);
            const contentScript = await import(src);
            contentScript.run();
        };
        controls.prepend(button);
    }

    function initSnackbar() {
        const snackbar = document.createElement("div");
        snackbar.id = "linkedin-solver-snackbar";
        document.body.appendChild(snackbar);
    }
})()