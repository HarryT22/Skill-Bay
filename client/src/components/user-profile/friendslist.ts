/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './friendslist.css?inline';
import { router } from '../../router/router.js';

@customElement('app-friendslist')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FriendlistComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];
  @state() private friends: { id: string; username: string; image: string }[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('users/friends/name');
      const friends = await response.json();
      this.friends = friends;
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      <div>
        <app-sidebar></app-sidebar>
        ${this.renderNotification()}
        <div id="wrapper">
          <h1>Your Friends</h1>
          <ul class="friends-list">
            ${this.friends.map(
              friend => html`
                <li class="friend-item" @click=${() => this.showUserDetails(friend)}>
                  <img src=${friend.image} />
                  <span>${friend.username}</span>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    `;
  }

  async showUserDetails(friend: { id: string }) {
    router.navigate(`friends/details/${friend.id}`);
  }
}
