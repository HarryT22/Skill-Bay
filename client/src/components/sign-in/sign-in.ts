/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './sign-in.css?inline';

@customElement('app-sign-in')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#usernameOrEmail') private usernameOrEmailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Login</h1>
      <form novalidate>
        <div>
          <label for="usernameOrEmail">Username or Email address</label>
          <input
            class="form-control is-invalid"
            id="usernameOrEmail"
            type="text"
            pattern="^.{4,}$"
            placeholder="Username/Email"
            maxlength="60"
            required
          />
          <div class="invalid-feedback">Field is required und input must be at least 4 characters long</div>
        </div>
        <div>
          <label for="password">Password</label>
          <input
            class="form-control is-invalid"
            id="password"
            type="password"
            placeholder="Password"
            maxlength="60"
            required
          />
          <div class="invalid-feedback">Password is required</div>
          <button type="button" @click="${this.submit}">Login</button>
        </div>
      </form>
      <br />
      <p>Don't have an account yet? Then <a href="http://localhost:8080/users/sign-up">register here!</a>.</p>
      <br />
      <p>Forgot Password? <a href="http://localhost:8080/reset-password-email">Click here!</a>.</p>
    `;
  }

  async submit(event: MouseEvent) {
    event.preventDefault();
    if (this.isFormValid()) {
      const authData = {
        usernameOrEmail: this.usernameOrEmailElement.value,
        password: this.passwordElement.value
      };
      try {
        await httpClient.post('/users/sign-in', authData);
        this.showNotification('You are now signed in');
        setTimeout(() => router.navigate('landingpage'), 1500);
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
