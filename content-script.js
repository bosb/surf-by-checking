/*
If click, send a message to the background page.
*/
function notifyExtension(e) {
  browser.runtime.sendMessage({});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("click", notifyExtension);
