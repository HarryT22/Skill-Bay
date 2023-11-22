/*Autor: Harry Thünte*/

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/marketplace', () => {
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

  it('should render the correct title', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/marketplace'));
    const title = await page.textContent('app-marketplace h1');
    expect(title).to.equal('Contracts');
    userSession.deleteUser();
  });

  it('should render the correct amount of elements', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/contracts/create'));
    await page.fill('#title', 'Test contract');
    await page.fill('#requirements', 'Test req');
    await page.fill('#budgetMin', '12');
    await page.fill('#budgetMax', '13');
    await page.selectOption('#language', 'German');
    await page.fill('#deadline', '2022-12-24');
    await Promise.all([page.waitForResponse('**'), await page.click('app-create-contract button')]);
    await page.goto(config.clientUrl('/marketplace'));
    expect(await page.textContent('app-contract-element span[slot="title"]')).to.equal('Test contract');
    userSession.deleteUser();
  });

  it('should filter contracts correctly', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/marketplace'));
    await page.fill('#titleC', 'should not find ');
    await page.selectOption('#languageC','Chinese');
    await Promise.all([page.waitForResponse('**'), page.click('button:text("Filter Contracts")')]);
    expect(await page.locator('app-contract-element').count()).to.equal(0);
    userSession.deleteUser();
  });

  it('should filter inquirys correctly', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/marketplace'));
    await page.fill('#titleI', 'should not find ');
    await page.selectOption('#languageI','Chinese');
    await Promise.all([page.waitForResponse('**'), page.click('button:text("Filter Inquirys")')]);
    expect(await page.locator('app-inquiry-element').count()).to.equal(0);
    userSession.deleteUser();
  });
});
