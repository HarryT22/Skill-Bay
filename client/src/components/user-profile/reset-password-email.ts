/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';

@customElement('app-reset-password-email')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class resetPasswordEmailComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle];

  @query('form') private form!: HTMLFormElement;
  @query('#email') private emailElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <form novalidate>
        <h1>Reset Password</h1>
        <p>To reset your password, please enter your E-mail adress so we can send you a link for reset</p>
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
        <button type="button" @click="${this.submit}">Send Email</button>
      </form>
    `;
  }

  async submit() {
    if (this.form.checkValidity()) {
      try {
        const response = await httpClient.post('users/reset-password', {
          email: this.emailElement.value
        });
        const json = await response.json();
        this.showNotification(json.message, 'info');
        setTimeout(() => router.navigate('/'), 10000);
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.reportValidity();
    }
  }
}
