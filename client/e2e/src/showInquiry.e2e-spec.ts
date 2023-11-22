/*Autor: Harry Thünte*/

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/inquirys/show/:id', () => {
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

  it('should render the correct contract title', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/inquirys/show/83da85b3-d4b7-4ada-a75d-e18e552009e0'));
    expect(await page.locator('text="This user has these skills:"').count()).to.equal(1);
    userSession.deleteUser();
  });
});
