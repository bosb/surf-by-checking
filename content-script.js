/*
If click, send a message to the background page.
*/
function notifyExtension(e) {
  let message = ''
  try {
      // hide xingone box and send reset to background.js to reset counters
      if (e.target.id === 'xingoneAlertBox') { document.querySelector('div#xingoneAlertBox').style.display = 'none'; message = 'reset'}
      // if clicked on a data-qa item for object- id
      let dataqa = e.target.attributes.getNamedItem('data-qa').value
      // if message is not already 'reset' and data-qa is available
      if (message === '' && dataqa !== undefined) { message = dataqa }
  } catch (ee) {
  }
  browser.runtime.sendMessage({message});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("click", notifyExtension);
