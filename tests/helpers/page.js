const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

// could call it Page, but calling it CustomPage for clarity's sake
class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property];
            }
            // with `get`, we can access customPage, page, and browser!
            // Allows us to open and close browser, which is a nice bonus.
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        // create a user and pass into session factory 
        const user = await userFactory(); // wait for the user to be saved
        const {session, sig } = sessionFactory(user);
        
        await this.page.setCookie({ name: 'session', value: session});
        await this.page.setCookie({ name: 'session.sig', value: sig});
        // Can get your cookie names in Chrome inspector --> application --> Cookies --> localhost:3000, and look under "Name" heading

        await this.page.goto('localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]'); // test will fail if <a> tag never appears
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;