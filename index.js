const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const token = '6402409854:AAEp1rlgKQULRZus9Q2f7KFpO8bysChIZ_c';
const token1 = '6671614133:AAGAgLQgsHoSViJvh7NOFuCdrbfilt7lXp4';
const apiUrl = 'https://www.goethe.de/rest/examfinder/exams/institute/O%2010000610?category=E006&type=ER&countryIsoCode=&locationName=&count=100&start=1&langId=134&timezone=54&isODP=0&sortField=startDate&sortOrder=ASC&dataMode=0&langIsoCodes=de%2Cen%2Cvi';

const bot = new TelegramBot(token, { polling: true });
const bot1 = new TelegramBot(token1, { polling: true });
const chatId = '-1001528944131';
const chatPiloId = '-1001689881393';
const chatUserId = '2036381446';
processedUrls = new Set();
let isBotRunning = true;

bot.onText(/\/start/, (msg) => {
    const userId = msg.from.id;
    if (isAdmin(userId) && msg.chat.type === 'supergroup') {
        isBotRunning = true;
        bot.sendMessage(chatId, 'Bot đã được bật.');
    }
});

bot.onText(/\/stop/, (msg) => {
    const userId = msg.from.id;
    if (isAdmin(userId) && msg.chat.type === 'supergroup') {
        isBotRunning = false;
        bot.sendMessage(chatId, 'Bot đã bị tắt.');
    }
});

bot.onText(/\/goethe/, (msg) => {
    const userId = msg.from.id;
    if (msg.chat.type === 'supergroup' && isAdmin(userId) && isBotRunning) {
        processedUrls.clear();
        fetchDataFromApi();
        bot.sendMessage(chatId, 'Đang hoạt động...');
    }
});

async function fetchDataFromApi() {
    try {
        const response = await axios.get(apiUrl);
        const data = response.data;
        if (data && data.hasOwnProperty('DATA')) {
            processedUrls1 = new Set();
            for (const record of data.DATA) {
                if (record.buttonLink && !processedUrls.has(record.offerKeyID) && !processedUrls1.has(record.offerKeyID)) {
                    const buttonLink = record.buttonLink;
                    const eventName = record.eventName.split(' ')[1] || 'Không có thông tin về kỳ thi';
                    const eventTimeSpan = record.eventTimeSpan || 'Không có thông tin về thời gian';
                    bot.sendMessage(chatId, `${eventName} - ${eventTimeSpan}\nLink: ${buttonLink}`);
                    processedUrls.add(record.offerKeyID);
                    processedUrls1.add(record.offerKeyID);
                } else if (!record.buttonLink && processedUrls.has(record.offerKeyID)) {
                    processedUrls.delete(record.offerKeyID);
                }
            }
        }
        setTimeout(fetchDataFromApi, 3000);
    } catch (error) {
        bot.sendMessage(chatUserId, `Lỗi: ${error}`);
    }
}

function isAdmin(userId) {
    return userId === 2036381446;
}

bot1.on('message', async (msg) => {
    const messageText = msg.text;
    if (messageText) {
        getShopee(messageText, 0);
    }
});

async function getShopee(messageText, index) {
    let count = index;
    if (messageText && index < 6) {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const matches = messageText.match(urlRegex);

        if (matches && matches.length > 0) {
            const link = matches[0];
            const requestData = {
                link: link,
                token: "p3B5ZOWFVshHajgl",
                tokenCaptcha: "03AFcWeA5cDUtMR98PjFOTc2DJXVs8_oUNpkHgqBvwyfBACt6DX7cRROZsrZ1jzfIROA4hImLFEzNb2n0A0CvgpX5duWgo3oyc2Z5wqnxnpwOPlZAEoNrHQHS-6HqMXjMNYxMAsaHG-HMM3_pXGaUF4e7fHKhncbl0bRPUMJ3K8j1GGGIrDpDpA5uREnsh8_gT0uEA2FNzFR8cXJ8WtUg4u47TsQ3tv4dZTUdxzu74dy5H_eZkLlClzf9VRjgPMTrv7T_jN5WMR3dWpA-D2oItKwZBSBvB9JZ7ldjS-JkDoHyF9VGs4fqN1d0SydMErlp-mHvm9jvcVG6b_yPx5xE8c6D2InKh-xW0JaxvBCo_T4ew0LxeHBw9O69PCt2yVXq8SHrCvtdye27NQA5ogSqsDrJEYhJBam7QU5m20MYz2qeufYxJKbeOIIMoGujHJmOWWBee9ZnYbfLu-2cedQ4pfH-xO0N-QzQ2xMaMpVH1VivrneBfAwvjSFV5GMXDKS1pwJIYMGHM2UbvDgOsNsDlSdjIFvQYZwWFoMzul5RLEGt6erVICsIukaQ"
            };

            try {
                const response = await axios.post('https://api.bloggiamgia.vn/api/amusement/add-shop-live-cart', requestData);
                if (response.status === 200) {
                    const responseData = response.data;
                    const shopId = responseData.shopid;
                    const itemId = responseData.itemid;

                    const getProductData = {
                        shopid: shopId,
                        itemid: itemId
                    };

                    const getProductResponse = await axios.post('https://api.bloggiamgia.vn/api/amusement/get-shop-live-product', getProductData);

                    if (getProductResponse.status === 200) {
                        const productData = getProductResponse.data;
                        bot1.sendMessage(chatPiloId, `${productData.liveStream.url}\nSố: ${productData.product.indexInLive}`);
                    } else {
                        bot1.sendMessage(chatPiloId, `Có lỗi xảy ra khi gọi API get-shop-live-product`);
                    }
                } else {
                    bot1.sendMessage(chatPiloId, `Có lỗi xảy ra khi xử lý link: ${link}`);
                }
            } catch (error) {
                setTimeout(() => {
                    getShopee(messageText, count + 1);
                }, 2000);
                // bot1.sendMessage(chatPiloId, `Có lỗi xảy ra khi gọi API: ${error.message}`);
            }
        } else {
            bot1.sendMessage(chatPiloId, `Gửi cc jz beo`);
        }
    }
}