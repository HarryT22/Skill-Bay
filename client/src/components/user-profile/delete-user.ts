/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import componentStyle from '../widgets/sidebar/sidebar.css?inline';
import sharedStyle from '../shared.css?inline';

@customElement('app-delete-user')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DeleteUserComponent extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];
  render() {
    return html`
      <div>
        <app-sidebar></app-sidebar>
        ${this.renderNotification()}
        <div id="wrapper">
          <form novalidate>
            <h1>Delete your Profile</h1>
            <p>Delete Profile?</p>
            <p>Your data will be irrevocably deleted.</p>
            <button type="button" @click="${this.deleteUser}">Yes delete my account!</button>
          </form>
        </div>
      </div>
    `;
  }

  async deleteUser() {
    try {
      const res = await httpClient.delete('users/delete-user');
      if (res.status === 200) {
        const json = await res.json();
        this.showNotification(json.message, 'info');
        setTimeout(() => router.navigate('/'), 1500);
      }
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
