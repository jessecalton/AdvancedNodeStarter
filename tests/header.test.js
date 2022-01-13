const Page = require('./helpers/page'); // all Puppeteer stuff is encompassed here

let page; // scoping the variables so they are accessible in each func

beforeEach( async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
})

afterEach( async () => {
    await page.close();
});

test('the header has the correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster');
})

test('clicking login starts the oauth flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
})

test('when signed in shows logout button', async () => {
    await page.login();
    
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
});
