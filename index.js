require('dotenv').config();
// Script to access Fiverr "Buyer Requests" page

//const express = require('express'); // "import" express
const puppeteer = require('puppeteer'); // "import" puppeteer
// to look more like a user
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// telegram bot
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

bot.on('message', (msg) => {

    var Hi = "hi";
    if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
    bot.sendMessage(msg.chat.id,"Hold on, I'm working rn");
    }
    
});

// most of the functions we use in puppeteer returns a promise, which makes sense 'cause when ur webscrapping
// you basically telling a bot to wait something to happen to then take some action, and that's what ASYNC AWAIT does

(async() => {
    puppeteerExtra.use(StealthPlugin());
    const browser = await puppeteerExtra.launch({ headless: false }); // await for waiting this to finish / headless: false -> you see the browser
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto("https://www.fiverr.com/login?source=top_nav");

    await new Promise(r => setTimeout(r, 6000));

    await page.click(".icon-button.social-signing-button.google-signing-button");
    await new Promise(r => setTimeout(r, 4000));

    // Log in

    const pages = await browser.pages();
 
    await new Promise(r => setTimeout(r, 6000));

    await pages[2].keyboard.type(process.env.EMAIL, { delay: 50 });
    await pages[2].click('#identifierNext');
    await new Promise(r => setTimeout(r, 6000));
    await pages[2].keyboard.type(process.env.PASSWORD, { delay: 50 });
    await new Promise(r => setTimeout(r, 6000));
    await pages[2].click('#passwordNext');

    // you gonna need to allow on your device now, or disable google 2fa (recommended for this purpose)

    await new Promise(r => setTimeout(r, 6000));

    // After logged in, go to "Buyer Requests" page
    
    let buyerRequestsURL = "https://www.fiverr.com/users/" + process.env.FIVERR_USERNAME + "/requests?source=header_nav";

    await page.goto(buyerRequestsURL);
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: "fiverr-screenshot-buyer-request.png" });

    // Grab all requests which needs to be opened

    const grabRequests = await page.evaluate(() => {

        const infos = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr .see-more .ellipsis.text-wrap span");

        let listOfRequests = [];
        infos.forEach((info) => {
            listOfRequests.push(info.innerText)
        });
        
        return listOfRequests;
    });

    // Click on every single "See More"

    const gigs = await page.$$(".db-new-main-table.align-top.js-db-table table tbody tr .see-more .ellipsis.text-wrap span a");
    
    for (const requestIndex of grabRequests.keys()) {
        if(gigs[requestIndex]) {
            console.log(requestIndex);
            await gigs[requestIndex].click();
        }
    }

    // Grab all the requests, now opened

    const grabAllRequests = await page.evaluate(() => {

        const infos = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr td:nth-child(3) span");

        let allRequests = [];
        infos.forEach((info) => {
            allRequests.push(info.innerText)
        });
        
        return allRequests;
    });

    console.log(grabAllRequests);

    // Send all requests from the first page

    for (const requestIndex of grabAllRequests.keys()) {
        bot.sendMessage(process.env.CHAT_ID,grabAllRequests[requestIndex].toString());
    }

    //await browser.close();
})();

/*

const app = express(); // instance of express, called as a function to create a new express app

// first argument: URL route where the endpoint can be access
// second argument: callback function which will be executed everytime someone access this endpoint on our server

// req = request, the incoming data
// res = response, provides a way to send data back to the user

app.get('/api', (req, res) => {

    const apiKey = req.query.apiKey; // look for the API key which is provided by the end user

    // TODO validate API key
    // TODO bill user for usage

    res.send({data: 'ola'});
});

app.listen(8080, () => console.log('alive on http://localhost:8080'));

*/