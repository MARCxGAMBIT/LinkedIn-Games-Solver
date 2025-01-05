export async function click(cell) {
    return new Promise((resolve) => {
        cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        setTimeout(resolve, 0);
    });
}

export async function doubleclick(cell) {
    await click(cell);
    await click(cell);
}