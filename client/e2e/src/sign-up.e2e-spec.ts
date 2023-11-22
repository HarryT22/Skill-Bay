/* Autor: Annika Junge */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('sign-up', () => {
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
  });

  after(async () => {
    await browser.close();
    userSession.deleteUser();
  });

  afterEach(async () => {
    await context.close();
  });

  it('should render the title "Register"', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.getByRole('link', { name: 'Register' }).click();
    //await page.goto(config.clientUrl('/users/sign-up'));
    console.log('Current URL:', page.url());
  });
  it('should render "E-Mail is required and must be valid', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.fill('#name', 'John');
    await page.fill('#lastname', 'Doe');
    await page.fill('#email', 'john.doe+example.com');
    await page.fill('#username', 'johndoe');
    await page.fill('#birthday', '1990-01-01');
    await page.fill('#password', 'Test@1234');
    await page.fill('#password-check', 'Test@1234');
    await page.click('#client');
    await page.click('.interest');
    await page.click('button');
    expect(await page.locator('text="E-Mail is required and must be valid"').count()).to.equal(1);
  });
  it('should render "Birthday is required and you need to be at least 18 years old to register', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.fill('#name', 'John');
    await page.fill('#lastname', 'Doe');
    await page.fill('#email', 'john.doe+example.com');
    await page.fill('#username', 'johndoe');
    await page.fill('#birthday', '2020-01-01');
    await page.fill('#password', 'Test@1234');
    await page.fill('#password-check', 'Test@1234');
    await page.click('#client');
    await page.click('.interest');
    await page.click('button');
    expect(
      await page.locator('text="Birthday is required and you need to be at least 18 years old to register"').count()
    ).to.equal(1);
  });
  it('should create a new user account', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.fill('#name', 'John');
    await page.fill('#lastname', 'Doe');
    await page.fill('#email', 'john.doe@gmail.com');
    await page.fill('#username', 'johndoe');
    await page.fill('#birthday', '1990-01-01');
    await page.selectOption('#highestDegree', { value: 'Promotion' });
    await page.selectOption('#subject', { value: 'Business informatics' });
    await page.fill('#password', 'Test@1234');
    await page.fill('#password-check', 'Test@1234');
    await page.click('#client');
    await page.click('.interest');
    const [response] = await Promise.all([
      page.waitForResponse('**/sign-up'),
      page.locator('text=Register now').click()
    ]);
    expect(response.status()).to.equal(201);
  });
  it('should succeed given correct credentials', async () => {
    await page.goto(config.clientUrl('/users/sign-in'));
    await page.fill('#usernameOrEmail', 'johndoe');
    await page.fill('#password', 'Test@1234');
    const [response] = await Promise.all([page.waitForResponse('**/sign-in'), page.click('button:text("Login")')]);
    expect(response.status()).to.equal(201);

    // delete user after register
    const deletion = await fetch(config.serverUrl('/users/delete-user'), {
      method: 'DELETE',
      headers: { Cookie: `jwt-token=${((await context.cookies()) as unknown as [{ value: string }])[0].value}` }
    });

    expect(deletion.status).to.equal(200);
  }).timeout(3000);
});
