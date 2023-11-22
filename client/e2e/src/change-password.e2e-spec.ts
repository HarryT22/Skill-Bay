/* Autor: Annika Junge */
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import config from './config.js';
import { UserSession } from './user-session.js';
import { expect } from 'chai';

describe('/change-password', () => {
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

  it('should change the paassword of a user', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/change-password'));
    await page.fill('#password', userSession.password);
    await page.fill('#new-password', 'Test1234!!');
    await page.fill('#password-check', 'Test1234!!');
    const [response] = await Promise.all([
      page.waitForResponse('**/change-password'),
      page.click('button:text("Change password")')
    ]);
    expect(response.status()).to.equal(201);

    await userSession.deleteUser();
  });
});
