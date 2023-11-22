/*Autor: Harry Thünte*/

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/contracts/show/:id', () => {
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
    await page.goto(config.clientUrl('/contracts/show/db75b305-9a20-4571-a2c1-df2f66715a7f'));
    expect(await page.locator('text="The requirements for this project:"').count()).to.equal(1);
    userSession.deleteUser();
  });
});
