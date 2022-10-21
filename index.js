require('dotenv').config();

// Script to access Fiverr "Buyer Requests" page

const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling : true });

let pollingError = false;

let running = false;

bot.on("polling_error", () => {
    console.log("Polling error. The script will not work properly with 2 or more instances. Please run only 1 instance of the script.");
    pollingError = true;
});

if(!pollingError) {

    console.log("Script started");

    cron.schedule('*/5 * * * *', () => {
        console.log("Scrapping ...");
        bot.sendMessage(process.env.CHAT_ID,"Scrapping ...");
        bot.stopPolling();
        (async() => {
            
            // Start

            running = true;

            puppeteerExtra.use(StealthPlugin());
            const browser = await puppeteerExtra.launch({ headless: false }); // headless: true -> don't show browser
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0); 
            await page.setViewport({ width: 1366, height: 768});
            await page.goto("https://www.fiverr.com/login?source=top_nav", { waitUntil: "domcontentloaded" });
            await page.click(".icon-button.social-signing-button.google-signing-button");
        
            // Logs in
            // Only works if google 2fa is disabled

            let pages = new Array(3).fill(null);
        
            while(pages[2] == null) {
                pages = await browser.pages();
                await new Promise(r => setTimeout(r, 3000));
            }
        
            await new Promise(r => setTimeout(r, 6000));
        
            await pages[2].keyboard.type(process.env.EMAIL, { delay: 50 });
            await pages[2].click('#identifierNext');

            await new Promise(r => setTimeout(r, 6000));

            await pages[2].keyboard.type(process.env.PASSWORD, { delay: 50 });
            await pages[2].click('#passwordNext');
        
            await new Promise(r => setTimeout(r, 10000));

            // Check if Log step was succesful. The page will close if authentication was sucessful.
            // If couldn't log in, so the page is still opened

            pages = await browser.pages();

            if(pages[2]) {
                console.log("An error occured while trying to login. I will try again in a few minutes.")
                bot.sendMessage(process.env.CHAT_ID,"Couldn't Log In ... I'll try again later ... ");
                browser.close();
                running = false;
                bot.startPolling();
                return 0;
            }
        
            // After logged in, go to "Buyer Requests" page
            
            let buyerRequestsURL = "https://www.fiverr.com/users/" + process.env.FIVERR_USERNAME + "/requests?source=header_nav";

            await page.goto(buyerRequestsURL, { waitUntil: "domcontentloaded" });
        
            // Grab requests, click on "See More" link, and return all requests opened

            let myList = null;

            while(!myList) {

                 // First, grab all requests which needs to be opened

                await new Promise(r => setTimeout(r, 2000));

                let grabRequests = await page.evaluate(() => {

                    let infos = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr .see-more .ellipsis.text-wrap span");
    
                    let listOfRequests = [];
                    infos.forEach((info) => {
                        listOfRequests.push(info.innerText)
                    });
                    
                    return listOfRequests;
                });

                myList = grabRequests;
            }
            
            let done = null;

            while(!done) {

                // Then click on every single "See More"

                let gigs = await page.$$(".db-new-main-table.align-top.js-db-table table tbody tr .see-more .ellipsis.text-wrap span a");

                for (const requestIndex of myList.keys()) {
                    if(gigs[requestIndex]) {
                        await gigs[requestIndex].click();
                        done = true;
                    }
                }
            }

            let myList2 = null;

            while(!myList2) {

                // Finally grab all the requests and other infos, now that everything is opened

                let grabAllRequests = await page.evaluate(() => {

                    let dates = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr td:nth-child(1) span");

                    let infos = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr td:nth-child(3) span:nth-child(1)");

                    let prices = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr td:nth-child(6) .hover-hide span");

                    let prices2 = document.querySelectorAll(".db-new-main-table.align-top.js-db-table table tbody tr td:nth-child(6) .hover-show .budget");

                    let allDates = [];

                    let allRequests = [];

                    let allPrices = [];

                    let allPrices2 = [];

                    dates.forEach((date) => {
                        allDates.push(date.innerText)
                    });

                    infos.forEach((info) => {
                        allRequests.push(info.innerText)
                    });

                    prices.forEach((price) => {
                        allPrices.push(price.innerText)
                    });

                    prices2.forEach((price2) => {
                        allPrices2.push(price2.innerText)
                    });

                    // Object model (for first page - 15 requests)

                    const myData = [
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        },
                        { 
                            date : "",
                            info : "",
                            price : ""
                        }
                    ]

                    for (const index of myData.keys()) {
                        myData[index].date = allDates[index];
                        myData[index].info = allRequests[index];
                        myData[index].price = allPrices[index];
                        if(allPrices[index] == "") {
                            myData[index].price = allPrices2[index];
                        }
                    }
                    
                    return myData;
                });

                myList2 = grabAllRequests;
            }
        
            // Send all requests from the first page

            await new Promise(r => setTimeout(r, 6000));

            const FileSystem = require("fs");

            let oldData = FileSystem.readFileSync('file.json', "utf8");

            let objOldData = JSON.parse(oldData)

            let newRequest = false;

            if(objOldData[0].info != myList2[0].info) {
                console.log("New request available");
                await bot.sendMessage(process.env.CHAT_ID,"NEW REQUEST AVAILABLE!");
                newRequest = true;
            } else {
                console.log("No new request");
                await bot.sendMessage(process.env.CHAT_ID,"NO NEW REQUEST!");
            }

            FileSystem.writeFile('file2.json', JSON.stringify(myList2), (error) => {
                if (error) throw error;
            });
        
            /* maybe will be useful later when we compare the old json file with new to check for new inputs

            for (const requestIndex of myList2.keys()) {
                if(myList2[requestIndex]) {
                    await bot.sendMessage("1332870599", myList2[requestIndex].toString());
                }
            }

            */

            // If there is new request, it will send the file and overwrites old file for new comparison

            if(newRequest) {
                await bot.sendDocument(process.env.CHAT_ID, 'file.json');

                FileSystem.writeFile('file.json', JSON.stringify(myList2), (error) => {
                    if (error) throw error;
                });

            }
        
            await browser.close();

            console.log("Closing ...")

            await bot.startPolling();

            running = false;
        })();
    });
    
    // You can check if the bot is working by sending a message

    bot.on('message', (msg) => {
        var Hi = "chatid"

        if(msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
            bot.sendMessage(msg.chat.id,msg.chat.id);
        }
        else{
            if(running == false) {
                bot.sendMessage(msg.chat.id,"Wait, I'll start scrapping soon");
            }
            else {
                bot.sendMessage(msg.chat.id,"Hold on, I'm scrapping");
            }
        }
    });
}