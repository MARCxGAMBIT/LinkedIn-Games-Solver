export function showSnackbar(message) {
    var snackbar = document.getElementById("linkedin-solver-snackbar");
    snackbar.className = "show";
    snackbar.innerText = message;
    setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, 2950);
}