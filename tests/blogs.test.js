const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
})

afterEach(async () => {
    await page.close();
})

test('When logged in, can see blog create form', async () => {
    // gotta log in first...
    await page.login();
    // go to create blog page by clicking the "+" button
    await page.click('a.btn-floating');
    // verify the form appears - look for "Blog Title" label
    const label = await page.getContentsOf('form label');

    expect(label).toEqual('Blog Title');
})