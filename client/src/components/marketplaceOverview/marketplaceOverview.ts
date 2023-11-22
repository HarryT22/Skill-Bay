/* Autor: Harry Thünte */

import { LitElement, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './marketplaceOverview.css?inline';

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

@customElement('app-marketplace-overview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MarketplaceComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  private contracts: Contract[] = [];
  private inquirys: Inquiry[] = [];

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/contracts/personal');
      const response2 = await httpClient.get('/inquirys/personal');

      this.contracts = (await response.json()).results;
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
    return html`
      <h1>Personal area</h1>
      <h3>Your contracts</h3>
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
              @appcontractclick=${() => this.showContractDetails(contract.id)}
            >
              <span slot="title">${contract.title}</span>
            </app-contract-element>
          `
        )}
      </div>
      <h3>Your inquirys</h3>
      <div>${this.emptyMessageInquirys()}</div>
      <div class="inquirys-container">
        ${repeat(
          this.inquirys,
          inquiry => inquiry.id,
          inquiry => html`
            <app-inquiry-element
              lang=${inquiry.language}
              pE=${inquiry.payEstimate}
              @appinquiryclick=${() => this.showInquiryDetails(inquiry.id)}
            >
              <span slot="title">${inquiry.title}</span>
            </app-inquiry-element>
          `
        )}
      </div>
    `;
  }

  async showContractDetails(id: string) {
    router.navigate('/contracts/update/' + id);
  }

  async showInquiryDetails(id: string) {
    router.navigate('/inquirys/update/' + id);
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
