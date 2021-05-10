let xingoneapicall = { count: 0, // number of calls to xing-one
                        max: 0, // max request size in byte
                        gttwentyk: 0, // > 20kb
                        gttenk: 0, // > 10kb, < 20kb
                        lttenk: 0, // < 10k, > 4kb
                        ltonek:0  // < 4kb
                      }

let tracking_error_list = {}

function xingoneCountreset(requestDetails) {
  // reset on click on page
  if (requestDetails.message === 'reset' || requestDetails.method === 'GET') {
      xingoneapicall = { count: 0,
                            max: 0,
                            gttwentyk: 0,
                            gttenk: 0,
                            lttenk: 0,
                            ltonek:0
                          }
  }
  if (requestDetails.message.startsWith('object-') === true) {
      console.log(requestDetails.message);
      let object = requestDetails.message.split('.')[0].split('-')[1]
      let x = requestDetails.message.replace('.','\\\\.')
    // toggle message
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: `try { if (document.querySelector('div#${x}').innerHTML === ''){ document.querySelector('div#${x}').innerHTML="${tracking_error_list[object]}";} else {document.querySelector('div#${x}').innerHTML=''} } catch(e) {}`,
    });
  }
}

// A) xing-one requests
function xingoneSize(requestDetails) {
// check xing-one requests
//  console.log(requestDetails);
  let errors = 0

  xingoneapicall['count'] += 1
  if (requestDetails['requestSize'] > xingoneapicall['max']) { xingoneapicall['max'] = requestDetails['requestSize'] }
  if (requestDetails['requestSize'] > 20_000) { xingoneapicall['gttwentyk'] += 1 }
  if (requestDetails['requestSize'] > 10_000 && requestDetails['requestSize'] < 20_000) { xingoneapicall['gttenk'] += 1 }
  if (requestDetails['requestSize'] < 10_000 && requestDetails['requestSize'] > 4_000) { xingoneapicall['lttenk'] += 1 }
  if (requestDetails['requestSize'] < 4_000) { xingoneapicall['ltonek'] += 1 }
  let number_nice = new Intl.NumberFormat().format(xingoneapicall['max'])

  // checks ---------------------------------------------
  // a) request size > 20kb ?
  let xingone_size = ''
  if (xingoneapicall['gttwentyk'] > 0) {
    errors +=1
    let xingone_size = `<br><b><font color=red>20k: ${xingoneapicall['gttwentyk']}</font></b>`
  }
  // b) request count > 10 ?
  let xingone_count = `#: ${xingoneapicall['count']}`
  if (xingoneapicall['count'] > 10) {
    errors +=1
    xingone_count = `<b><font color=red>#: ${xingoneapicall['count']}</font></b>`
  }
  // \checks ---------------------------------------------

  // result string display as overlay
  let update_text = `xing-one: ${xingone_count} <br> max: ${number_nice} <br> 10k: ${xingoneapicall['gttenk']} &nbsp;&nbsp;  4k: ${xingoneapicall['ltonek']}<br> 4k-10k: ${xingoneapicall['lttenk']}` + xingone_size
  
  // create or update box
  if (xingoneapicall['count'] <= 1) {
    let putbox = ` try { document.querySelector('div#xingoneAlertBox').remove(); } catch(e) {}
        var box = document.createElement( 'div' );
        box.id = 'xingoneAlertBox';
        box.innerHTML = "${update_text}";
        box.style.cssText =
            ' background: white;     ' +
            ' border: 5px solid green; ' +
            ' padding: 2px;          ' +
            ' position: fixed;    ' +
            ' top: 8px; left: 8px;   ' +
            ' z-index: 999; opacity: 85%; ' +
            ' max-width: 400px;      ' ;
        document.body.appendChild( box );
        `
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: putbox,
    });
  } else {
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: `try { document.querySelector('div#xingoneAlertBox').innerHTML= "${update_text}"; } catch(e) {}`,
    });
  }

  // on error change frame to red
  if (errors > 0) {
    let frame = `try { document.querySelector('div#xingoneAlertBox').style.border = "${errors}px solid red"; } catch(e) {}`
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: frame,
    });
  }
}

// B) operational tracking
function logURL(requestDetails) {
  // one request to trackings
  //console.log(requestDetails);
  // POST data is raw, put it together and parse JSON
  let x = requestDetails.requestBody.raw.map(function(data) { return String.fromCharCode.apply(null, new Uint8Array(data.bytes)) }).join('')
  x = JSON.parse(x)
  // each object tracking
  x.forEach(function(item){
    // enhance events, for now do not show already handled viewport messages in console
    if ('entered_viewport;left_viewport;'.includes(item['event']) === false) {
        console.log(item);
    }
    // assume success of checks
    let errors = 0;
    // get object id that is used in data-qa to identify object in html
    // object_urn
    let object_id = 0
    // activity_id
    let activity_id = 0
    let error_string = ''

    // checks ---------------------------------------------
    // a) object_urn available and scrambled
    try {
        console.log(`- object_urn: ${item['object_urn']}`) // surn:x-xing:content:insider_article:3959854.f444dc
        object_id = item['object_urn'].split(':')[item['object_urn'].split(':').length-1]
        item['object_urn'].split(':')[3].toString()
        item['object_urn'].split(':')[item['object_urn'].split(':').length-1].split('.')[1].toString()
        object_id = object_id.split('.')[1]
    } catch (e) {
        error_string = `object_urn available and scrambled: ${item['event']} ${item['object_urn']}`
        console.log(`ERROR: ${error_string}`)
        if (tracking_error_list[object_id] === undefined) {
            tracking_error_list[object_id] = ''
        }
        if (tracking_error_list[object_id].indexOf(error_string) === -1) {
            tracking_error_list[object_id] += `<br> ${error_string}`
        }
        errors +=1
    }
    // b) additional_info.activity_id available
    try {
        console.log(`- activity_id: ${item['additional_info']['activity_id']}`) // 5425232315.4fc795
        activity_id = item['additional_info']['activity_id'].split('.')[0]
        item['additional_info']['activity_id'].split('.')[1].toString()
    } catch (e) {
        console.log('ERROR: additional_info.activity_id available')
        errors +=1
    }
    // c) tracking_tokens are available
    try {
        console.log(`- tracking_tokens: ${item['tracking_tokens']}`) // tracking_tokens: Array [ "disco.module.trendingObjects:9...f:0.7166135.postings_link_share_posting" ]
        item['tracking_tokens'][0].toString()
    } catch (e) {
        console.log('ERROR: tracking_tokens available')
        errors +=1
    }
    // d) id/urn available and scrambled
    Object.keys(item).forEach(function (key) {
      switch (key) {
          case 'login': 
            item[key] = item[key]['user_id']
          case 'object_actor_urn':
          case 'originActivityId':
          case 'originActivityId':
            try {
              console.log(`- ${key}: ${item[key]}`);
              item[key].split(':')[3].toString()
              item[key].split(':')[item[key].split(':').length-1].split('.')[1].toString()
            } catch (e) {
                console.log('ERROR: id/urn available and scrambled')
                errors +=1
            }
          break;
      }
      // event from dictionary? entered_viewport left_viewport
      // sent_by: "disco"
    })
    // \\checks ---------------------------------------------

    // identify in html - depending on page its's activity or object as id.... DIV data-qa=object-12345
    // execute 2 times to prevent non execution because of wrong object
    let result_frame_object = ''
    let result_frame_activity = ''
    let pixel = 5
    let color = 'green'
    if (errors > 0) {
        pixel = errors
        color = 'red'
    }
    // TODO: add list as popup whats wrong?
    // TODO: print in object which event took place
    result_frame_object = `try { document.querySelector('div[data-qa^=object-${object_id}]').style.border = "${pixel}px solid ${color}"; } catch(e) {}`
    result_frame_activity = `try { document.querySelector('div[data-qa^=object-${activity_id}]').style.border = "${pixel}px solid ${color}"; } catch(e) {}`
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: result_frame_object,
    });
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: result_frame_activity,
    });

    // put a click target on every object, if it does not jet have one
    // assuming, this function is fired when tracking events are send, thus page mooved, thus new items might got lazy loaded...
    browser.tabs.executeScript(
      requestDetails['tabId'],
      {code: `
           document.querySelectorAll('li div[data-qa^="object-"] ').forEach(function(userItem) {
                  //try {console.log(userItem.attributes.getNamedItem('data-qa').value)} catch(e) {}
                  try {let x = userItem.attributes.getNamedItem('data-qa').value
                    if (x !== 'object-0' && userItem.firstChild.id !== x) {
                        var box = document.createElement( 'div' );
                        box.id = x//.split('.')[0];
                        box.setAttribute('data-qa', x)
                        box.style.cssText =
                            ' background: white;     ' +
                            ' border: 5px solid orange; ' +
                            ' padding: 2px;          ' +
                            ' opacity: 85%; ' +
                            ' float: left;      ' ;
                        userItem.insertBefore( box , userItem.firstChild);
                    }
                  } catch(e) {}
            });
      `,
    });

  });
}

// listen to operational tracking requests
browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {urls: ["*://*.xing.com/api/quotable-blimp/operational"]},
  ["requestBody"]
);

// reset xing-one counters on page load
browser.webRequest.onSendHeaders.addListener(
  xingoneCountreset,
  {urls: ["*://*.xing.com/discover/*"]},
      //["requestHeaders"]
);

// listen to xing-one requests
browser.webRequest.onCompleted.addListener(
  xingoneSize,
  {urls: ["*://*.xing.com/xing-one/api"]},
      ["responseHeaders"]
);

// click on page reset xing-one counter
browser.runtime.onMessage.addListener(xingoneCountreset);

