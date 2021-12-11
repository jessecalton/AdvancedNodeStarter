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
