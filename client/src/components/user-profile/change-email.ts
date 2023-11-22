/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import componentStyle from '../widgets/sidebar/sidebar.css?inline';

import sharedStyle from '../shared.css?inline';

// interface User {
//   id: string;
//   email: string;
// }
@customElement('app-change-email')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ChangeEmailComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];
  @property() userId!: string;
  @query('form') private form!: HTMLFormElement;
  @query('#email') private emailElement!: HTMLInputElement;
  @state() private email!: string;

  async firstUpdated() {
    const response = await httpClient.get('/users/email');
    const data = await response.json();
    this.email = data.email;
    this.requestUpdate();
    await this.updateComplete;
  }

  render() {
    return html`
      <div>
        <app-sidebar></app-sidebar>
        ${this.renderNotification()}
        <div id="wrapper">
          <form novalidate>
            <h1>Change Email</h1>
            <div>
              <label for="email">Your current E-mail Adress: </label>
              <p>${this.email || ''}</p>
            </div>
            <div>
              <label for="email">E-Mail</label>
              <input
                class="form-control is-invalid"
                id="email"
                type="email"
                placeholder="Email-address"
                pattern="^[a-zA-Z0-9._%+-]*@[a-z]*.[a-z]{2,4}$"
                maxlength="60"
                required
              />
              <div class="invalid-feedback">E-Mail is required and must be valid</div>
            </div>
            <button type="button" @click="${this.submit}">Change Email</button>
          </form>
        </div>
      </div>
    `;
  }

  async submit() {
    if (this.form.checkValidity()) {
      try {
        const response = await httpClient.patch('users/change-email', {
          email: this.emailElement.value
        });
        const json = await response.json();
        this.showNotification(json.message, 'info');
        setTimeout(() => router.navigate('email-verification/' + json.id), 1500);
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.reportValidity();
    }
  }
}
