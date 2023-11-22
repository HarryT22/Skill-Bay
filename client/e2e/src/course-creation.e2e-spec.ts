/* Simon Guyon */
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/edu/create', () => {
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

  /*   it('should create a new course', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/edu/create'));
    await page.fill('#coursename', 'Test Course');
    await page.selectOption('#difficulty', 'Easy');
    await page.selectOption('#type', 'Asynchronous');
    await page.click('.category');
    await page.fill('#startDate', '2023-07-01');
    await page.fill('#price', '100');
    const [response] = await Promise.all([page.waitForResponse('**'), page.click('button:text("Create course"')]);
    expect(response.status()).to.equal(201);
  }); */
  it('should fail to create a new course when required fields are not filled', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/edu/create'));
    await page.fill('#coursename', '');
    await page.selectOption('#difficulty', '');
    await page.selectOption('#type', '');
    await page.click('.category');
    await page.fill('#startDate', '');
    await page.fill('#price', '');
    const [response] = await Promise.all([page.waitForResponse('**'), page.click('button:text("Create course"')]);
    expect(response.status()).to.equal(400);
  });
  it('should fail to create a new course when user is not authenticated', async () => {
    await page.goto(config.clientUrl('/edu/create'));
    await page.fill('#coursename', 'Test Course');
    await page.selectOption('#difficulty', 'Easy');
    await page.selectOption('#type', 'Asynchronous');
    await page.click('.category');
    await page.fill('#startDate', '2023-07-01');
    await page.fill('#price', '100');
    const [response] = await Promise.all([page.waitForResponse('**'), page.click('button:text("Create course"')]);
    expect(response.status()).to.equal(401);
  });
  it('should load the course creation page', async () => {
    await userSession.registerUser();
    await page.goto(config.clientUrl('/edu/create'));
    const title = await page.title();
    expect(title).to.equal('Create Course');
  });
});
