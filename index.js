require('dotenv').config();
// Script to access Fiverr "Buyer Requests" page

//const express = require('express'); // "import" express
const puppeteer = require('puppeteer'); // "import" puppeteer
// to look more like a user
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// most of the functions we use in puppeteer returns a promise, which makes sense 'cause when ur webscrapping
// you basically telling a bot to wait something to happen to then take some action, and that's what ASYNC AWAIT does

(async() => {
    puppeteerExtra.use(StealthPlugin());
    const browser = await puppeteerExtra.launch({ headless: false }); // await for waiting this to finish / headless: false -> you see the browser
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto("https://www.fiverr.com/login?source=top_nav");

    await new Promise(r => setTimeout(r, 5000));

    await page.click(".icon-button.social-signing-button.google-signing-button");
    await new Promise(r => setTimeout(r, 3000));

    // Log in

    const pages = await browser.pages();
 
    await new Promise(r => setTimeout(r, 5000));

    await pages[2].keyboard.type(process.env.EMAIL, { delay: 50 });
    await pages[2].click('#identifierNext');
    await new Promise(r => setTimeout(r, 5000));
    await pages[2].keyboard.type(process.env.PASSWORD, { delay: 50 });
    await new Promise(r => setTimeout(r, 5000));
    await pages[2].click('#passwordNext');

    // you gonna need to allow on your device now, or disable google 2fa (recommended for this purpose)

    await new Promise(r => setTimeout(r, 5000));

    // After logged in, go to "Buyer Requests" page
    
    let buyerRequestsURL = "https://www.fiverr.com/users/" + process.env.FIVERR_USERNAME + "/requests?source=header_nav";

    await page.goto(buyerRequestsURL);
    console.log(buyerRequestsURL);
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: "fiverr-screenshot-buyer-request.png" });

    await browser.close();
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