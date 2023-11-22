/* Autor: Harry Thünte */

import { LitElement, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './marketplace.css?inline';

interface Contract {
  id: string;
  userId: string;
  title: string;
  requirements: string;
  budgetMin: number;
  budgetMax: number;
  language: string;
  deadline: string;
}
interface Inquiry {
  id: string;
  userId: string;
  title: string;
  skills: string;
  payEstimate: number;
  language: string;
}

@customElement('app-marketplace')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MarketplaceComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private contracts: Contract[] = [];

  @state() private inquirys: Inquiry[] = [];

  @query('#titleI') private titleIElement!: HTMLInputElement;

  @query('#payEstimate') private payEstimateElement!: HTMLInputElement;

  @query('#languageI') private languageIElement!: HTMLInputElement;

  @query('#titleC') private titleCElement!: HTMLInputElement;

  @query('#budgetMin') private budgetMinElement!: HTMLInputElement;

  @query('#budgetMax') private budgetMaxElement!: HTMLInputElement;

  @query('#languageC') private languageCElement!: HTMLInputElement;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/contracts/all');
      this.contracts = (await response.json()).results;
      const response2 = await httpClient.get('/inquirys/all');
      this.inquirys = (await response2.json()).results;
      this.requestUpdate();
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  render() {
    return html` <div class="filter-contracts">
        <h1>Contracts</h1>
        <label for="titleC">Please enter a keyword you are looking for</label>
        <input type="text" id="titleC" autofocus"/>
        <label for="budgetMin">Minimal Price</label>
        <input type="number" id="budgetMin" />
        <label for="budgetMax">Maximal Price</label>
        <input type="number" id="budgetMax" />
        <label for="languageC">Language</label>
        <select id="languageC">
          <optgroup label="Select the language for communication">
            <option>None</option>
            <option>German</option>
            <option>English</option>
            <option>Chinese</option>
            <option>Russian</option>
            <option>Spanish</option>
          </optgroup>
        </select>
        <button id="conButton" @click="${this.filterContracts}">Filter Contracts</button>
      </div>
      <div>${this.emptyMessageContracts()}</div>
      <div class="contracts-container">
        ${repeat(
          this.contracts,
          contract => contract.id,
          contract => html`
            <app-contract-element
              lang=${contract.language}
              min=${contract.budgetMin}
              max=${contract.budgetMax}
              @appcontractclick=${() => this.showContract(contract.id)}
            >
              <span slot="title">${contract.title}</span>
            </app-contract-element>
          `
        )}
      </div>
      <div class="filter-inquirys">
        <h1>Inquirys</h1>
        <label for="titleI">Please enter the title of your project</label>
        <input type="text" id="titleI" autofocus"/>
        <label for="payEstimate">Highest pay estimate:</label>
        <input type="number" id="payEstimate" />
        <label for="languageI">Language</label>
        <select id="languageI">
          <optgroup label="Select the language for communication">
            <option>None</option>
            <option>German</option>
            <option>English</option>
            <option>Chinese</option>
            <option>Russian</option>
            <option>Spanish</option>
          </optgroup>
        </select>
        <button id="inqButton" @click="${this.filterInquirys}">Filter Inquirys</button>
      </div>
      <div>${this.emptyMessageInquirys()}</div>
      <div class="inquirys-container">
        ${repeat(
          this.inquirys,
          inquiry => inquiry.id,
          inquiry => html`
            <app-inquiry-element
              lang=${inquiry.language}
              pE=${inquiry.payEstimate}
              @appinquiryclick=${() => this.showInquiry(inquiry.id)}
            >
              <span slot="title">${inquiry.title}</span>
            </app-inquiry-element>
          `
        )}
        <div class="buttonContainer1">
          <div class="createContract">
            <form @submit=${this.createContract}>
              <button type="submit">Create contract</button>
            </form>
          </div>
          <div class="createInquiry">
            <form @submit=${this.createInquiry}>
              <button type="submit">Create inquiry</button>
            </form>
          </div>
        </div>
        <div class="buttonContainer2">
          <div class="personal">
            <form @submit=${this.personal}>
              <button type="submit">Personal area</button>
            </form>
          </div>
          <div class="bookings">
            <form @submit=${this.bookings}>
              <button type="submit">My bookings</button>
            </form>
          </div>
        </div>
      </div>`;
  }

  async createInquiry() {
    router.navigate('/inquirys/create');
  }

  async createContract() {
    router.navigate('/contracts/create');
  }

  async bookings() {
    router.navigate('/marketplace/bookings');
  }

  async showContract(id: string) {
    router.navigate('/contracts/show/' + id);
  }

  async showInquiry(id: string) {
    router.navigate('/inquirys/show/' + id);
  }

  async filterContracts() {
    await this.refreshContracts();
    if (this.titleCElement.value) {
      this.contracts = this.contracts.filter(c => c.title.includes(this.titleCElement.value));
    }
    if (this.budgetMinElement.value && this.budgetMinElement.valueAsNumber != 0) {
      this.contracts = this.contracts.filter(c => c.budgetMin >= this.budgetMinElement.valueAsNumber);
    }
    if (this.budgetMaxElement.value && this.budgetMinElement.valueAsNumber != 0) {
      this.contracts = this.contracts.filter(c => c.budgetMax <= this.budgetMaxElement.valueAsNumber);
    }
    if (this.languageCElement.value && this.languageCElement.value != 'None') {
      this.contracts = this.contracts.filter(c => c.language == this.languageCElement.value);
    }
  }

  async filterInquirys() {
    await this.refreshInquirys();
    if (this.titleIElement.value) {
      this.inquirys = this.inquirys.filter(i => i.title.includes(this.titleIElement.value));
    }
    if (this.payEstimateElement.value) {
      this.inquirys = this.inquirys.filter(i => i.payEstimate <= this.payEstimateElement.valueAsNumber);
    }
    if (this.languageIElement.value && this.languageIElement.value != 'None') {
      this.inquirys = this.inquirys.filter(i => i.language == this.languageIElement.value);
    }
  }
  async personal() {
    router.navigate('marketplace/personal');
  }

  async refreshContracts() {
    const response = await httpClient.get('/contracts/all');
    this.contracts = (await response.json()).results;
  }
  async refreshInquirys() {
    const response = await httpClient.get('/inquirys/all');
    this.inquirys = (await response.json()).results;
  }

  emptyMessageContracts() {
    if (this.contracts.length === 0) {
      return html`Looks like you have not booked anything yet. You can do so on the marketplace!`;
    } else {
      return nothing;
    }
  }

  emptyMessageInquirys() {
    if (this.inquirys.length === 0) {
      return html`Looks like you have not booked anything yet. You can do so on the marketplace!`;
    } else {
      return nothing;
    }
  }
}
