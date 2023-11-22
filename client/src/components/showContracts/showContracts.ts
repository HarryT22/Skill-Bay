/* Autor: Harry Thünte */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './showContracts.css?inline';

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

@customElement('app-show-contract')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ShowContractsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() contractId!: string;

  private contract!: Contract;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/contracts/get/' + this.contractId);
      this.contract = await response.json();
      this.requestUpdate();
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
      <h1 id="conTitle">${this.contract?.title || ''}</h1>
      <div id="requirements">
        <h3>The requirements for this project:</h3>
        <p>${this.contract?.requirements || ''}</p>
      </div>
      <div id="range">
        <b
          >Price range:
          <font color="green">${this.contract?.budgetMin || ''} - ${this.contract?.budgetMax || ''} Euro</font></b
        >
      </div>
      <div id="lang">
        <b>Preferred language for communication: <font color="green">${this.contract?.language || ''}</font></b>
      </div>
      <div id="deadline">
        <b>Has to be finished by the: <font color="green">${this.contract?.deadline || ''}</font></b>
      </div>
      <div class="book">
        <form @submit=${this.bookContract}>
          <button id="book" type="submit">Book this contract</button>
        </form>
      </div>
    `;
  }
  bookContract() {
    try {
      const contractData = {
        id: this.contract.id
      };
      httpClient.post('/contracts/addBookings', contractData);
      router.navigate('/marketplace');
    } catch (e) {
      alert((e as Error).message);
      this.showNotification((e as Error).message, 'error');
    }
  }
}
