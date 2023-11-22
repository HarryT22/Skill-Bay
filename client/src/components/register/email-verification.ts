/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './registerStyle.css?inline';
import { router } from '../../router/router.js';
import { httpClient } from '../../http-client.js';

@customElement('app-email-verification')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class emailVerificationComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() id!: string;

  @query('form') private form!: HTMLFormElement;
  @query('#code') private codeElement!: HTMLInputElement;
  render() {
    return html`
      ${this.renderNotification()}
  <head>
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
      }
      .wrapper {
        display: flex;
        justify-content: center;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      h1 {
        font-size: 36px;
        color: #333;
        margin-top: 0;
      }
      p {
        font-size: 18px;
        color: #666;
      }
      form {
        margin-top: 30px;
      }
      input[type="email"] {
        width: 100%;
        padding: 10px;
        font-size: 18px;
        border-radius: 5px;
        border: none;
        margin-bottom: 10px;
      }
      button[type="submit"] {
        background-color: #4CAF50;
        color: #fff;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-size: 18px;
        cursor: pointer;
      }
      button[type="submit"]:hover {
        background-color: #3e8e41;
      }
    </style>
  </head>
  <body>
      <form novalidate>
  <div style="height: 50px;"></div> 
    <div class="wrapper">
      <div class="container">
      <h1>Please Verify Your Email</h1>
      <p>You're almost there! We sent an email to you</p>
      <p>Just click on the link in that email to complete your sign-up or type in the code: </p>
      <div>
          <label for="code">Code</label>
          <input
          class="form-control is-invalid"
            id="code"
            type="number"
            pattern="/^\d{6}$/"
            placeholder="Verification Code"
            required
          />
          <div class="invalid-feedback">Code is required</div>
        </div>
        <div>
          <button type="button" @click="${this.submit}">Send</button>
        </div>
    </div>
    </div>
    <div style="height: 100px;"></div>
  </body>
  </form>
</html>
`;
  }
  async submit() {
    if (this.form.checkValidity()) {
      try {
        const response = await httpClient.patch('users/verify/code', {
          userId: this.id,
          validationCode: this.codeElement.value
        });
        const json = await response.json();
        this.showNotification(json.message, 'info');
        setTimeout(() => router.navigate('landingpage'), 1500);
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.reportValidity();
    }
  }
}
