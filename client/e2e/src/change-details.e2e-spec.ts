/* Autor: Annika Junge */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('change-details', () => {
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
  it('should render "Lastname is required and must not contain any numbers or similar"', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/change-details'));
    await page.fill('#lastname', 'Doe+1');
    await page.click('button');
    expect(
      await page.locator('text="Lastname is required and must not contain any numbers or similar"').count()
    ).to.equal(1);
    await userSession.deleteUser();
  });

  it('should successful update profile', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/change-details'));
    await page.fill('#name', 'John');
    await page.fill('#lastname', 'Doe');
    const [response] = await Promise.all([page.waitForResponse('**/update-user'), page.click('button:text("Save")')]);
    expect(response.status()).to.equal(200);
    userSession.deleteUser();
  });
});
