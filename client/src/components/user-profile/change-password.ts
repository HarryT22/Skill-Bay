/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import componentStyle from '../widgets/sidebar/sidebar.css?inline';

import sharedStyle from '../shared.css?inline';

@customElement('app-change-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') private form!: HTMLFormElement;
  @query('#password') private passwordElement!: HTMLInputElement;
  @query('#new-password') private newPasswordElement!: HTMLInputElement;
  @query('#password-check') private passwordCheckElement!: HTMLInputElement;
  @state() private passwordtext =
    'Must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters, no withespaces';
  @state() private passwordTextForCheck!: string;
  passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-_=()])[A-Za-z\d@$!%*#?&\-_=()]{8,}$/);

  render() {
    return html`
      <div>
        <app-sidebar></app-sidebar>
        ${this.renderNotification()}
        <div id="wrapper">
          <form novalidate>
            <h1>Change Password</h1>
            <div>
              <label for="password">Old Password</label>
              <input class="form-control is-invalid" id="password" type="password" placeholder="Password" required />
              <div class="invalid-feedback">Old Password is required</div>
            </div>
            <div>
              <label for="new-password">New Password</label>
              <input
                type="password"
                placeholder="new password"
                required
                id="new-password"
                @keyup="${this.checkPassword}"
              />
              <br />
              <span>${this.passwordtext}</span>
            </div>
            <div>
              <label for="password-check">Enter password again</label>
              <input
                type="password"
                placeholder="password check"
                required
                id="password-check"
                @input="${this.checkSecondPassword}"
              />
              <span>${this.passwordTextForCheck}</span>
            </div>

            <button type="button" @click="${this.submit}">Change password</button>
          </form>
        </div>
      </div>
    `;
  }
  checkPassword() {
    const password = this.newPasswordElement.value;
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
    if (this.newPasswordElement.value !== this.passwordCheckElement.value) {
      this.passwordTextForCheck = 'Passwords are not matching!';
    } else {
      this.passwordTextForCheck = 'Passwords are matching now';
    }
  }

  async submit() {
    if (this.form.checkValidity()) {
      if (this.passwordRegex.test(this.passwordElement.value)) {
        if (this.newPasswordElement.value === this.passwordCheckElement.value) {
          try {
            const response = await httpClient.patch('users/change-password', {
              password: this.passwordElement.value,
              newPassword: this.newPasswordElement.value,
              passwordCheck: this.passwordCheckElement.value
            });
            const json = await response.json();
            this.showNotification(json.message, 'info');
            setTimeout(() => router.navigate('profile'), 1500);
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
