/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */
/* Autor: Annika Junge (bzgl. Header) */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { router } from '../../router/router.js';
import { httpClient } from '../../http-client.js';

import componentStyle from './app.css?inline';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = componentStyle;

  @property() authenticated = false;

  @state() private appTitle = 'Skill-Bay';

  @state() private linkItems = [
    { title: 'Register', routePath: 'users/sign-up' },
    { title: 'Login', routePath: 'users/sign-in' }
  ];

  @state() private linkItemsSignedIn = [
    { title: 'Education', routePath: 'edu/my-edu-area' },
    { title: 'Community', routePath: 'landingpage' },
    { title: 'Market', routePath: 'marketplace' },
    { title: 'Profile', routePath: 'profile' }
  ];

  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }

  async checkAuthentication() {
    try {
      await httpClient.get('users/secure');
      this.authenticated = true;
    } catch (e) {
      console.log('user is not signed up');
      this.authenticated = false;
    }
  }

  renderRouterOutlet() {
    return router.select(
      {
        'users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        'users/verification': () => html`<app-email-verification></app-email-verification>`,
        'users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        'sign-out': () => html`<app-sign-out></app-sign-out>`,
        'delete': () => html`<app-delete-user></app-delete-user>`,
        'profile': () => html`<app-user-profile></app-user-profile>`,
        'friendslist': () => html`<app-friendslist></app-friendslist>`,
        'friends/details/:id': params => html`<app-friends-profile .friendId=${params.id}></app-friends-profile>`,
        'email-verification/:id': params => html`<app-email-verification .id=${params.id}></app-email-verification>`,
        'change-password': () => html`<app-change-password></app-change-password>`,
        'reset-password-email': () => html`<app-reset-password-email></app-reset-password-email>`,
        'reset-password/:id/:token': params =>
          html`<app-reset-password .userId=${params.id} .token=${params.token}></app-reset-password>`,
        'change-email': () => html`<app-change-email></app-change-email>`,
        'change-details': () => html`<app-change-details></app-change-details>`,
        'sidebar': () => html`<app-sidebar></app-sidebar>`,
        'homepage': () => html`<app-landing-page></app-landing-page>`,
        'contracts/create': () => html`<app-create-contract></app-create-contract>`,
        'contracts/update/:id': params => html`<app-contract-details .contractId=${params.id}></app-contract-details>`,
        'inquirys/update/:id': params => html`<app-inquiry-details .inquiryId=${params.id}></app-inquiry-details>`,
        'marketplace': () => html`<app-marketplace></app-marketplace>`,
        'inquirys/create': () => html`<app-create-inquiry></app-create-inquiry>`,
        'contracts/show/:id': params => html`<app-show-contract .contractId=${params.id}></app-show-contract>`,
        'inquirys/show/:id': params => html`<app-show-inquiry .inquiryId=${params.id}></app-show-inquiry>`,
        'marketplace/personal': () => html`<app-marketplace-overview></app-marketplace-overview>`,
        'marketplace/bookings': () => html`<app-marketplace-bookings></app-marketplace-bookings>`,
        'edu/create': () => html`<app-course-create></app-course-create>`,
        'edu/overview': () => html`<app-course-overview></app-course-overview>`,
        'edu/my-edu-area': () => html`<app-course-user-area></app-course-user-area>`,
        'edu/my-courses': () => html`<app-my-courses></app-my-courses>`,
        'edu/my-courses/display/:id': params =>
          html`<app-course-display .courseId=${params.id} .userId=${params.id}></app-course-display>`,
        'edu/course-profile/:id': params => html`<app-course-profile .courseId=${params.id}></app-course-profile>`,
        'landingpage': () => html`<app-signed-in-landing-page></app-signed-in-landing-page>`,
        'explore': () => html`<app-explore></app-explore>`,
        'posts/:id': params => html`<app-post .postId=${params.id}></app-post>`,
        'posts': () => html`<app-post></app-post>`,
        'messenger': () => html`<app-messenger></app-messenger>`,
        'bubbles': () => html`<app-bubble-overview></app-bubble-overview>`,
        'bubble/:id': params => html`<app-bubble .bubbleId=${params.id}></app-bubble>`
      },
      () => html`<app-landing-page></app-landing-page>`
    );
  }
  render() {
    this.checkAuthentication();

    return html`
      <app-header
        title="${this.appTitle}"
        .headerVariations=${this.authenticated ? this.linkItemsSignedIn : this.linkItems}
      ></app-header>
      <div class="main">${this.renderRouterOutlet()}</div>
      <app-footer></app-footer>
    `;
  }
}
