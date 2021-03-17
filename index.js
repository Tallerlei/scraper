const puppeteer = require('puppeteer');

let retry = 0;
let maxRetries = 5;

(async function scrape() {
    retry++;

    let proxyList = [
        '127.0.0.1:8080'
    ];

    var proxy = proxyList[Math.floor(Math.random() * proxyList.length)];

    console.log('proxy: ' + proxy);
    // config proxy if needed https://www.sslproxies.org/
    // const browser = await puppeteer.launch({
    //     headless: false,
    //     args: ['--proxy-server=' + proxy]
    // });
    const browser = await puppeteer.launch({ headless: false });
    try {
        const page = await browser.newPage();
        // hides the obvious headlessChrome which might be blocked
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36');
        await page.goto('https://quotes.toscrape.com/search.aspx');

        await page.waitForSelector('#author');
        await page.select('select#author', 'Albert Einstein');

        await page.waitForSelector('#tag');
        await page.select('select#tag', 'learning');

        await page.click('.btn');
        await page.waitForSelector('.quote');

        // extracting information from code
        let quotes = await page.evaluate(() => {

            let quotesElement = document.body.querySelectorAll('.quote');
            let quotes = Object.values(quotesElement).map(x => {
                return {
                    author: x.querySelector('.author').textContent ?? null,
                    quote: x.querySelector('.content').textContent ?? null,
                    tag: x.querySelector('.tag').textContent ?? null,

                }
            });

            return quotes;

        });

        // logging results
        console.log(quotes);
        await browser.close();
    } catch (e) {
        await browser.close();

        if (retry < maxRetries) {
            scrape();
        }
    }
})();