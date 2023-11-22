/* Autor: Harry Thünte */
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './inquiry.css?inline';

@customElement('app-create-inquiry')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InquiryComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#skills') private skillsElement!: HTMLInputElement;

  @query('#payEstimate') private payEstimateElement!: HTMLInputElement;

  @query('#language') private languageElement!: HTMLInputElement;

  render() {
    return html`
      <h1>Create an inquiry</h1>
      <form novalidate>
        <div>
          <label for="title">Please enter the title of your inquiry</label>
          <input type="text" id="title" autofocus required />
          <div class="invalid-feedback">A title is required</div>
        </div>
        <div>
          <label for="skills">Describe your qualifications</label>
          <textarea id="skills"></textarea>
        </div>
        <div>
          <label for="payEstimate">Hourly rate</label>
          <input type="number" required id="payEstimate" />
          <div class="invalid-feedback">Please enter the minium pay for your project</div>
        </div>
        <div>
          <label for="language">Language</label>
          <select id="language">
            <optgroup label="Select the language for communication">
              <option>German</option>
              <option>English</option>
              <option>Chinese</option>
              <option>Russian</option>
              <option>Spanish</option>
            </optgroup>
          </select>
        </div>
        <button type="button" @click="${this.submit}">Create inquiry</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const inquiryData = {
        title: this.titleElement.value,
        skills: this.skillsElement.value,
        payEstimate: this.payEstimateElement.value,
        language: this.languageElement.value
      };
      try {
        await httpClient.post('inquirys/create', inquiryData);
        router.navigate('/marketplace');
      } catch (e) {
        alert((e as Error).message);
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.titleElement.value.length >= 35) {
      this.titleElement.setCustomValidity('The title should only be a short description.');
    } else {
      this.titleElement.setCustomValidity('');
    }
    if (this.skillsElement.value.length >= 5000) {
      this.skillsElement.setCustomValidity('Character limit reached.');
    } else {
      this.skillsElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }
}
