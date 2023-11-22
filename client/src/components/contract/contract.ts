/* Autor: Harry Thünte */
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './contract.css?inline';

@customElement('app-create-contract')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ContractComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#requirements') private requirementsElement!: HTMLInputElement;

  @query('#budgetMin') private budgetMinElement!: HTMLInputElement;

  @query('#budgetMax') private budgetMaxElement!: HTMLInputElement;

  @query('#language') private languageElement!: HTMLInputElement;

  @query('#deadline') private deadlineElement!: HTMLInputElement;

  render() {
    return html`
      <h1>Create a contract</h1>
      <form novalidate>
        <div>
          <label for="title">Please enter the title of your project</label>
          <input type="text" id="title" autofocus required "/>
          <div class="invalid-feedback">A title is required</div>
        </div>
        <div class="form-group">
          <label for="requirements">Please enter the requirements of your project</label>
          <textarea id="requirements" rows="5"></textarea>
        </div>
        <div>
          <label for="budgetMin">Minimum budget</label>
          <input type="number" required id="budgetMin" />
          <div class="invalid-feedback">Please enter the minium pay for your project</div>
        </div>
        <div>
          <label for="budgetMax">Maximum budget</label>
          <input type="number" required id="budgetMax" />
          <div class="invalid-feedback">Please enter the maximum pay for your project</div>
        </div>
        <div>
          <label for="language">Language:</label>
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
        <div>
          <label for="deadline">Deadline</label>
          <input type="date" required id="deadline" />
          <div class="invalid-feedback">Please enter the latest date that this project is due to</div>
        </div>
        <button type="button" @click="${this.submit}">Create contract</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const contractData = {
        title: this.titleElement.value,
        requirements: this.requirementsElement.value,
        budgetMin: this.budgetMinElement.value,
        budgetMax: this.budgetMaxElement.value,
        language: this.languageElement.value,
        deadline: this.deadlineElement.value
      };
      try {
        await httpClient.post('contracts/create', contractData);
        router.navigate('/marketplace');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.budgetMinElement.value >= this.budgetMaxElement.value) {
      this.budgetMinElement.setCustomValidity('The minimum cannot be greater than the maximum.');
    } else {
      this.budgetMinElement.setCustomValidity('');
    }
    if (this.titleElement.value.length >= 35) {
      this.titleElement.setCustomValidity('The title should only be a short description.');
    } else {
      this.titleElement.setCustomValidity('');
    }
    if (this.requirementsElement.value.length >= 5000) {
      this.requirementsElement.setCustomValidity('Character limit reached.');
    } else {
      this.requirementsElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }
}
