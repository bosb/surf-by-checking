# surf-by-checking

XING Hackweek 17 Projekt 05/2021
Proof of concept for checking API requests while surfing your object under test: xing.com.

## What it does

If you need to check some api requests from/on your website, you open up developer tools, network tab and dive through the requests...
On first exploring you find stuff, but would need to check hundreds of objects, manual...
Wouldn't it be more convenient to led code do the work?

### Example:
On xing every card/message/object has a view tracking that is fired every 10 seconds when an object leaves/enters the viewport;
The entries in there need to have specific values and a specific format, this can change while refactoring or introducing new content types and though break.
This can be found out in some backend monitoring checks, but thats quite late, wouldn't it be cool your browser gives you hints while exploring a developer version of the website?

![Website with tracking data request](https://raw.githubusercontent.com/bosb/surf-by-checking/main/docs/images/operational-fe.png)
![Results on extension console](https://raw.githubusercontent.com/bosb/surf-by-checking/main/docs/images/operational-ext.png)

Another one:
Your website might go berserk and fires too much api requests or your requests are too big in size, if you know what to watch out for, make a check like with this extension.

![API requests in network tab](https://raw.githubusercontent.com/bosb/surf-by-checking/main/docs/images/xing-one.png)

### Why an extension?
First I started with Tampermonkey/Greasemonkey but dropped it after one day, because I can not access the data I need from these user scripts: e.g. the request body.
So I started with firefox extension; There I have the freedom to access every aspect of network traffic and the website.
There is no UI to implement the checks, they need to be written by modifying the extension code, so this here should give you inspiration for your own checks.

### Blocks to reach the goal:
- Listen for defined URLs, get the POST body, request/response headers.
- Give feedback on the page, here by a red/green frame around the object which data was found;
  The wider the frame the more errors are found.
- Count number of specific requests while page loads and give status as overlay.
- Reset counters on click on the overlay: overlay vanishes.

## Learning on the way:
- An extension has its own set of developer tools and console messages from the extension show up there and not on the webpage console.
- Loading debug extension from directory.
- Pack and submit extension file to mozilla for signing and though getting a loadable extension to distribute.
- Developers of xing.com thought of qa-data id for each object that is also used in the trackng events.

## Todo:
- Transfer errors found from extension console log to overlay to open on click of object.

