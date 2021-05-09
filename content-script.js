/*
If click, send a message to the background page.
*/
function notifyExtension(e) {
  let message = ''
  try {
      if (e.target.id === 'xingoneAlertBox') { document.querySelector('div#xingoneAlertBox').style.display = 'none'; message = 'reset'}
      let dataqa = e.target.attributes.getNamedItem('data-qa').value
      console.log(dataqa)
      if (message === '' && dataqa !== undefined) { message = dataqa }
  } catch (ee) {
  }
  console.log(message)
  browser.runtime.sendMessage({message});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("click", notifyExtension);
