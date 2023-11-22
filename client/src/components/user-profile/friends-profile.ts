/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';

import componentStyle from './friends-profile.css?inline';

interface User {
  id: string;
  name: string;
  lastname: string;
  username: string;
  type: string;
  image: string;
  highestDegree: string;
  subject: string;
  skills: string[];
  verified: boolean;
}

@customElement('app-friends-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class userProfileComponent extends PageMixin(LitElement) {
  static styles = [componentStyle];

  @property() friendId!: string;
  @state() private image!: string;
  private user!: User;

  async firstUpdated() {
    const response = await httpClient.get('/profile/friend/' + this.friendId);
    this.user = await response.json();
    this.requestUpdate();
    await this.updateComplete;
  }

  render() {
    return html`
      ${this.renderNotification()}
      <div class="container">
        <div class="user-info">
          <h1>User Information</h1>
          <div class="form-group">
            <div class="image-container">
              <img src="${this.user?.image || ''}" class="image" />
            </div>
            <div class="form-group">
              <label for="name">Firstname:</label>
              <p>${this.user?.name || ''}</p>
            </div>
            <div class="form-group">
              <label for="lastname">Last Name:</label>
              <p>${this.user?.lastname || ''}</p>
            </div>
            <div class="form-group">
              <label for="lastname">User Name:</label>
              <p>${this.user?.username || ''}</p>
            </div>
            <div class="form-group">
              <label for="type">Registered as:</label>
              <p>${this.user?.type || ''}</p>
            </div>
            <div class="form-group">
              <label for="highestDegree">Highest Degree:</label>
              <p>${this.user?.highestDegree || ''}</p>
            </div>
            <br />
            <div>
              <label>Skills: </label>
              <br />
              ${this.user?.skills.map(
                skill => html`
                  <div class="skill" .value=${this.user?.skills ? this.user?.skills.join(', ') : ''}>${skill}</div>
                `
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
