/* Autor: Annika Junge */
import { expect } from 'chai';
import { Browser, BrowserContext, chromium, Page } from 'playwright';
import config from './config.js';
import { UserSession } from './user-session.js';

describe('sidebar', () => {
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

  it('should change to all sites', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/profile'));
    await page.locator('a:has-text("Update Profile")').click();
    expect(page.url()).to.eq(config.clientUrl('/change-details'));
    await page.locator('a:has-text("Change Email")').click();
    expect(page.url()).to.eq(config.clientUrl('/change-email'));
    await page.locator('a:has-text("Change Password")').click();
    expect(page.url()).to.eq(config.clientUrl('/change-password'));
    await page.locator('a:has-text("Delete Account")').click();
    expect(page.url()).to.eq(config.clientUrl('/delete'));
    await page.locator('a:has-text("Friendslist")').click();
    expect(page.url()).to.eq(config.clientUrl('/friendslist'));

    await userSession.deleteUser();
  });
});
