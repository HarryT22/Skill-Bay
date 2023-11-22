/* Autor: Harry Thünte */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './showInquirys.css?inline';

export interface Inquiry {
  id: string;
  userId: string;
  title: string;
  skills: string;
  payEstimate: number;
  language: string;
}

@customElement('app-show-inquiry')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ShowInquiryComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() inquiryId!: string;

  private inquiry!: Inquiry;

  async firstUpdated() {
    try {
      const response = await httpClient.get('/inquirys/get/' + this.inquiryId);
      this.inquiry = await response.json();
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
      <h1 id="inqTitle">${this.inquiry?.title || ''}</h1>
      <div id="skills">
        <h3>This user has these skills:</h3>
        <p>${this.inquiry?.skills || ''}</p>
      </div>
      <div id="pE">
        <b>Pay estimate: <font color="green">${this.inquiry?.payEstimate || ''} Euro</font></b>
      </div>
      <div id="lang">
        <b>Preferred language for communication: <font color="green">${this.inquiry?.language || ''}</font></b>
      </div>
      <div class="book">
        <form @submit=${this.bookInquiry}>
          <button id="book" type="submit">Book this inquiry</button>
        </form>
      </div>
    `;
  }

  bookInquiry() {
    try {
      const inquiryData = {
        id: this.inquiry.id
      };
      httpClient.post('/inquirys/addBookings', inquiryData);
      router.navigate('/marketplace');
    } catch (e) {
      alert((e as Error).message);
      this.showNotification((e as Error).message, 'error');
    }
  }
}
