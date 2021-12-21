const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

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

test('when signed in shows logout button', async () => {
    // create a user and pass into session factory 
    const user = await userFactory(); // wait for the user to be saved
    const {session, sig } = sessionFactory(user);
    
    await page.setCookie({ name: 'session', value: session});
    await page.setCookie({ name: 'session.sig', value: sig});
    // Can get your cookie names in Chrome inspector --> application --> Cookies --> localhost:3000, and look under "Name" heading

    await page.goto('localhost:3000');
    await page.waitFor('a[href="/auth/logout"]'); // test will fail if <a> tag never appears

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
});
