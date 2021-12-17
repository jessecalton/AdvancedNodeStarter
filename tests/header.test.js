const puppeteer = require('puppeteer');

let browser, page; // scoping the variables so they are accessible in each func

beforeEach( async () => {
    browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
})

afterEach( async () => {
    await browser.close();
});

test('the header has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML); // nothing special about the $ sign.
    expect(text).toEqual('Blogster');
})

test('clicking login starts the oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
})

test.only('when signed in shows logout button', async () => {
    const id = '61ba845cd63687174d1c9212'; // copied from MongoDB collection
    
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport: {
            user: id
        }
    };
    const sessionString = Buffer.from(JSON.stringify(sessionObject))
        .toString('base64'); // sessionString will be the exact same session string as what we'd get using keygrip
    
    const Keygrip = require('keygrip');
    const keys = require('../config/keys');
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session=' + sessionString); // 'session=' is just what the keygrip library does. No other reason.
    
    await page.setCookie({ name: 'session', value: sessionString});
    await page.setCookie({ name: 'session.sig', value: sig});
    // Can get your cookie names in Chrome inspector --> application --> Cookies --> localhost:3000, and look under "Name" heading

    await page.goto('localhost:3000');
    await page.waitFor('a[href="/auth/logout"]'); // test will fail if <a> tag never appears

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
});
