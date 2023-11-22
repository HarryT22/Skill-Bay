/* Autor: Annika Junge */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('sign-in', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
    await userSession.registerUser();
  });

  after(async () => {
    await browser.close();
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });

  it('should render the title "Login"', async () => {
    await page.goto(config.clientUrl('/users/sign-in'));
    const title = await page.textContent('app-sign-in h1');
    expect(title).to.equal('Login');
  });
  it('should fail given wrong credentials', async () => {
    await page.goto(config.clientUrl('/users/sign-in'));
    await page.fill('#usernameOrEmail', 'aaaa');
    await page.fill('#password', userSession.password);
    await page.locator('button:has-text("Login")').click();
    const text = await page.textContent('.error');
    expect(text).to.equal('Incorrect username or password.');
  });

  it('should succeed given correct credentials', async () => {
    await page.goto(config.clientUrl('/users/sign-in'));
    await page.fill('#usernameOrEmail', userSession.username);
    await page.fill('#password', userSession.password);
    const [response] = await Promise.all([page.waitForResponse('**/sign-in'), page.click('button:text("Login")')]);
    expect(response.status()).to.equal(201);
  });
});
