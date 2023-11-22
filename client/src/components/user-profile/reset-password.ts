/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';

interface Token {
  userId: string;
  token: string;
}

@customElement('app-reset-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class resetPasswordComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle];

  @property() private userId!: string;
  @property() private token!: string;

  @query('form') private form!: HTMLFormElement;
  @query('#password') private passwordElement!: HTMLInputElement;
  @query('#password-check') private passwordCheckElement!: HTMLInputElement;
  @state() private passwordtext =
    'Must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters, no withespaces';
  @state() private passwordTextForCheck!: string;
  passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-_=()])[A-Za-z\d@$!%*#?&\-_=()]{8,}$/);

  private tokeen!: Token;

  render() {
    return html`
      ${this.renderNotification()}
      <form novalidate>
        <h1>Reset Password</h1>
        <div>
          <label for="password">Passwort</label>
          <input type="password" required id="password" @keyup="${this.checkPassword}" />
          <span>${this.passwordtext}</span>
        </div>
        <div>
          <label for="password-check">Passwort nochmals eingeben</label>
          <input type="password" required id="password-check" @input="${this.checkSecondPassword}" />
          <span>${this.passwordTextForCheck}</span>
        </div>
        <button type="button" @click="${this.submit}">Reset Password</button>
      </form>
    `;
  }

  checkPassword() {
    const password = this.passwordElement.value;
    if (!this.passwordRegex.test(password)) {
      if (password.length < 8) {
        this.passwordtext = 'The password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])/.test(password)) {
        this.passwordtext = 'The password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(password)) {
        this.passwordtext = 'The password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(password)) {
        this.passwordtext = 'The password must contain at least one digit';
      } else if (!/(?=.*[@$!%*#?&\-_=()])/.test(password)) {
        this.passwordtext = 'The password must contain at least one special character';
      }
    } else {
      this.passwordtext = 'Good password!';
    }
  }

  checkSecondPassword() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordTextForCheck = 'Passwords are not matching!';
    } else {
      this.passwordTextForCheck = 'Passwords are matching now';
    }
  }

  async submit() {
    if (this.form.checkValidity()) {
      if (this.passwordRegex.test(this.passwordElement.value)) {
        if (this.passwordElement.value === this.passwordCheckElement.value) {
          try {
            const res = await httpClient.post('users/reset-password/form', {
              id: this.userId,
              token: this.token,
              password: this.passwordElement.value,
              passwordCheck: this.passwordCheckElement.value
            });
            const json = await res.json();
            this.showNotification(json.message, 'info');
            setTimeout(() => router.navigate('landingpage'), 1500);
          } catch (e) {
            this.showNotification((e as Error).message, 'error');
          }
        } else {
          this.showNotification('Passwords do not match.', 'error');
        }
      } else {
        this.showNotification('Password does not meet the requirements.', 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
}
