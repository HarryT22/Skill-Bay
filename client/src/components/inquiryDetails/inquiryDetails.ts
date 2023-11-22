/* Autor: Harry Thünte */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './inquiryDetails.css?inline';

export interface Inquiry {
  id: string;
  userId: string;
  title: string;
  skills: string;
  payEstimate: number;
  language: string;
}

@customElement('app-inquiry-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InquiryDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() inquiryId!: string;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#skills') private skillsElement!: HTMLInputElement;

  @query('#payEstimate') private payEstimateElement!: HTMLInputElement;

  @query('#language') private languageElement!: HTMLInputElement;

  private inquiry!: Inquiry;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/inquirys/get/' + this.inquiryId);
      this.inquiry = await response.json();
      this.requestUpdate();
      await this.updateComplete;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  render() {
    return html`
      <h1>Inquiry Details</h1>
      <form novalidate>
        <div>
          <label for="title">Please enter the title of your project</label>
          <input type="text" id="title" autofocus required value=${this.inquiry?.title || ''} />
          <div class="invalid-feedback">A title is required</div>
        </div>
        <div class="form-group">
          <label for="skills">Please enter your skills</label>
          <textarea id="skills" rows="5" .value=${this.inquiry?.skills || ''}></textarea>
        </div>
        <div>
          <label for="payEstimate">Pay Estimate</label>
          <input type="number" id="payEstimate" value=${this.inquiry?.payEstimate || ''} />
          <div class="invalid-feedback">Please enter the minium pay for your project</div>
        </div>
        <div>
          <label for="language">Language:</label>
          <select id="language" value=${this.inquiry?.language || ''}>
            <optgroup label="Select the language for communication">
              <option>German</option>
              <option>English</option>
              <option>Chinese</option>
              <option>Russian</option>
              <option>Spanish</option>
            </optgroup>
          </select>
        </div>
        <button type="button" @click="${this.submit}">Save</button>
        <button type="button" @click="${this.removeContract}">Delete</button>
        <button type="button" @click="${this.cancel}">Cancel</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedInquiry: Inquiry = {
        ...this.inquiry,
        title: this.titleElement.value,
        skills: this.skillsElement.value,
        payEstimate: this.payEstimateElement.valueAsNumber,
        language: this.languageElement.value
      };
      try {
        await httpClient.patch('/inquirys/update/' + updatedInquiry.id, updatedInquiry);
        router.navigate('/marketplace');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    router.navigate('/marketplace');
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

  async removeContract() {
    const result = confirm('Want to delete?');
    if (result) {
      try {
        await httpClient.delete('/inquirys/delete/' + this.inquiry.id);
        alert('Inquiry has been removed.');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }
}
