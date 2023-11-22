/* Autor: Annika Junge */
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import config from './config.js';
import { UserSession } from './user-session.js';

describe('/delete-profile', () => {
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

  it('should delete user profile', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/delete'));
    page.locator('text=Yes delete my account!').click();

    await userSession.deleteUser();
  });
});
