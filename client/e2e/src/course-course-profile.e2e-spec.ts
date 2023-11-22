// /* Simon Guyon */
// import { Browser, BrowserContext, Page, chromium } from 'playwright';
// import { expect } from 'chai';
// import { UserSession } from './user-session.js';
// import config from './config.js';


// describe('/edu/course-profile/:id', () => {
//     let browser: Browser;
//     let context: BrowserContext;
//     let page: Page;
//     let userSession: UserSession;
  
//     before(async () => {
//       browser = await chromium.launch(config.launchOptions);
//     });
  
//     after(async () => {
//       await browser.close();
//     });
  
//     beforeEach(async () => {
//       context = await browser.newContext();
//       page = await context.newPage();
//       userSession = new UserSession(context);
//     });
  
//     afterEach(async () => {
//       await context.close();
//     });