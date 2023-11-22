/* Autor: Harry Thünte */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './contractDetails.css?inline';

export interface Contract {
  id: string;
  userId: string;
  title: string;
  requirements: string;
  budgetMin: number;
  budgetMax: number;
  language: string;
  deadline: string;
}

@customElement('app-contract-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ContractDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() contractId!: string;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#requirements') private requirementsElement!: HTMLInputElement;

  @query('#budgetMin') private budgetMinElement!: HTMLInputElement;

  @query('#budgetMax') private budgetMaxElement!: HTMLInputElement;

  @query('#language') private languageElement!: HTMLInputElement;

  @query('#deadline') private deadlineElement!: HTMLInputElement;

  private contract!: Contract;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/contracts/get/' + this.contractId);
      this.contract = await response.json();
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
      <h1>Contract Details</h1>
      <form novalidate>
        <div>
          <label for="title">Please enter the title of your project</label>
          <input type="text" id="title" autofocus required value=${this.contract?.title || ''} />
          <div class="invalid-feedback">A title is required</div>
        </div>
        <div class="form-group">
          <label for="requirements">Please enter the requirements of your project</label>
          <textarea id="requirements" rows="5" .value=${this.contract?.requirements || ''}></textarea>
        </div>
        <div>
          <label for="budgetMin">Minimum budget</label>
          <input type="number" required id="budgetMin" value=${this.contract?.budgetMin || ''} />
          <div class="invalid-feedback">Please enter the minium pay for your project</div>
        </div>
        <div>
          <label for="budgetMax">Maximum budget</label>
          <input type="number" required id="budgetMax" value=${this.contract?.budgetMax || ''} />
          <div class="invalid-feedback">Please enter the maximum pay for your project</div>
        </div>
        <div>
          <label for="language">Language:</label>
          <select id="language" value=${this.contract?.language || ''}>
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
          <input type="date" required id="deadline" value=${this.contract?.deadline || ''} />
          <div class="invalid-feedback">Please enter the latest date that this project is due to</div>
        </div>
        <button type="button" @click="${this.submit}">Save</button>
        <button type="button" @click="${this.removeContract}">Delete</button>
        <button type="button" @click="${this.cancel}">Cancel</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedContract: Contract = {
        ...this.contract,
        title: this.titleElement.value,
        requirements: this.requirementsElement.value,
        budgetMin: this.budgetMinElement.valueAsNumber,
        budgetMax: this.budgetMaxElement.valueAsNumber,
        language: this.languageElement.value,
        deadline: this.deadlineElement.value
      };
      try {
        await httpClient.patch('/contracts/update/' + updatedContract.id, updatedContract);
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

  async removeContract() {
    const result = confirm('Want to delete?');
    if (result) {
      try {
        await httpClient.delete('/contracts/delete/' + this.contract.id);
        alert('Contract has been removed.');
        router.navigate('/marketplace');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }
}
