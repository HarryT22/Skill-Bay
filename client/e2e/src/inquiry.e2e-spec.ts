/*Autor: Harry Thünte*/

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/inquirys/create', () => {
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

  it('should render invalid feedback', async () => {
    await page.goto(config.clientUrl('/inquirys/create'));
    await Promise.all([page.waitForResponse('**'), await page.click('app-create-inquiry button')]);
    expect(await page.locator('text="A title is required"').count()).to.equal(1);
  });

  it('should add a new inquiry', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/inquirys/create'));
    await page.fill('#title', 'Test inquiry');
    await page.fill('#skills', 'Test inq');
    await page.fill('#payEstimate', '12');
    await page.selectOption('#language', 'German');
    const [response] = await Promise.all([page.waitForResponse('**'), await page.click('app-create-inquiry button')]);
    expect(response.status()).to.equal(201);
    userSession.deleteUser();
  });
});
