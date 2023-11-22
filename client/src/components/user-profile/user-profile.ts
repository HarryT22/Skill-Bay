/* Autor: Annika Junge */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css?inline';
import componentStyle from './user-profile.css?inline';

interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  username: string;
  type: string;
  image: string;
  highestDegree: string;
  subject: string;
  interests: string[];
  skills: string[];
  verified: boolean;
}

@customElement('app-user-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class userProfileComponent extends PageMixin(LitElement) {
  static styles = [componentStyle, sharedStyle];

  @state() private image!: string;
  private user!: User;

  async firstUpdated() {
    const response = await httpClient.get('/profile/user');
    this.user = await response.json();
    this.requestUpdate();
    await this.updateComplete;
  }

  render() {
    return html`
      <div>
        <app-sidebar></app-sidebar>
        ${this.renderNotification()}
        <div id="wrapper">
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
                  <label for="email">Email:</label>
                  <p>${this.user?.email || ''}</p>
                </div>
                <div class="form-group">
                  <label for="username">Username:</label>
                  <p>${this.user?.username || ''}</p>
                </div>
                <div class="form-group">
                  <label for="type">You are registered as:</label>
                  <p>${this.user?.type || ''}</p>
                </div>
                <div class="form-group">
                  <label for="highestDegree">Highest Degree:</label>
                  <p>${this.user?.highestDegree || ''}</p>
                </div>
                <div class="form-group">
                  <label for="subject">Subject:</label>
                  <p>${this.user?.subject || ''}</p>
                </div>
                <div>
                  <label>Your interests: </label>
                  <br />
                  ${this.user?.interests.map(
                    interest => html`
                      <div class="interest" .value=${this.user?.interests ? this.user?.interests.join(', ') : ''}>
                        ${interest}
                      </div>
                    `
                  )}
                </div>
                <br />
                <div>
                  <label>Your Skills: </label>
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
        </div>
      </div>
    `;
  }
}
