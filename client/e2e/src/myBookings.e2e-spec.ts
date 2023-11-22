/*Autor: Harry Thünte*/

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/marketplace/myBookings', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
  });

  afterEach(async () => {
    await context.close();
  });

  it('should render the nothing here text', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/marketplace/bookings'));
    expect(
      await page
        .locator('text="Looks like you have not booked anything yet. You can do so on the marketplace!"')
        .count()
    ).to.equal(2);
    userSession.deleteUser();
  });
});
