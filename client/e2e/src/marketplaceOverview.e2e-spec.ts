/*Autor: Harry Thünte*/

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/marketplace/overview', () => {
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
    await page.goto(config.clientUrl('/marketplace/personal'));
    expect(
      await page
        .locator('text="Looks like you have not booked anything yet. You can do so on the marketplace!"')
        .count()
    ).to.equal(2);
    userSession.deleteUser();
  });

  it('should render the contract', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/contracts/create'));
    await page.fill('#title', 'Test contract');
    await page.fill('#requirements', 'Test req');
    await page.fill('#budgetMin', '12');
    await page.fill('#budgetMax', '13');
    await page.selectOption('#language', 'German');
    await page.fill('#deadline', '2022-12-24');
    const [response] = await Promise.all([page.waitForResponse('**'), await page.click('app-create-contract button')]);
    expect(response.status()).to.equal(201);
    await page.goto(config.clientUrl('/marketplace/personal'));
    expect(
      await page
        .locator('text="Looks like you have not booked anything yet. You can do so on the marketplace!"')
        .count()
    ).to.equal(2);
    userSession.deleteUser();
  });
});
