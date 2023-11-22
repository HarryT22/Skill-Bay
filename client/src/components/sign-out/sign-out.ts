/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';
import { router } from '../../router/router.js';

@customElement('app-sign-out')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  render() {
    return html` ${this.renderNotification()} `;
  }

  async firstUpdated() {
    try {
      const response = await httpClient.delete('users/sign-out');
      const json = await response.json();
      this.showNotification(json.message, 'info');
      setTimeout(() => router.navigate('/'), 1500);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
