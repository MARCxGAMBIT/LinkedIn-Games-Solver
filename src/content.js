(() => {
    let supportedGames = ["queens", "tango", "mini-sudoku", "zip"];
    let currentGame = null;

    init();
    
    // Listen for URL changes from background script
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message === 'urlChanged') {
                // Small delay to ensure DOM is updated after navigation
                setTimeout(() => {
                    init();
                }, 500);
            }
        }
    );

    function init() {
        const game = detectGame();
        if (game && game !== currentGame) {
            currentGame = game;
            initButton(game);
            initSnackbar();
        } else if (!game && currentGame) {
            // Navigated away from a supported game
            currentGame = null;
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
        
        // Remove existing solve button if present
        const existingButton = controls.querySelector(".linkedin-solver-btn");
        if (existingButton) {
            existingButton.remove();
        }
        
        const button = document.createElement("button");
        button.innerHTML = "Solve";
        button.className = "artdeco-button artdeco-button--premium artdeco-button--2 ember-view aux-controls-btn linkedin-solver-btn";
        button.onclick = async () => {
            const src = chrome.runtime.getURL(`src/${game}.js`);
            const contentScript = await import(src);
            contentScript.run();
        };
        controls.prepend(button);
    }

    function initSnackbar() {
        // Only create snackbar if it doesn't exist
        if (!document.getElementById("linkedin-solver-snackbar")) {
            const snackbar = document.createElement("div");
            snackbar.id = "linkedin-solver-snackbar";
            document.body.appendChild(snackbar);
        }
    }
})()