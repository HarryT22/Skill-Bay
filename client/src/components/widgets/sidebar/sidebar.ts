/* Autor: Annika Junge */
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PageMixin } from '../../page.mixin.js';
import componentStyle from './sidebar.css?inline';

import sharedStyle from '../../shared.css?inline';

@customElement('app-sidebar')
export class Sidebar extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];
  render() {
    return html`
      <div>
        <div id="sidebar-wrapper">
          <ul class="sidebar-nav">
            <li class="sidebar-brand">
              <a href="#"></a>
            </li>
            <li>
              <a href="profile">Profile</a>
            </li>
            <li>
              <a href="change-details">Update Profile</a>
            </li>
            <li>
              <a href="change-password">Change Password</a>
            </li>
            <li>
              <a href="change-email">Change Email</a>
            </li>
            <li>
              <a href="friendslist">Friendslist</a>
            </li>
            <li>
              <a href="sign-out">Sign-out</a>
            </li>
            <li>
              <a href="delete">Delete Account</a>
            </li>
          </ul>
        </div>
        <div class="container">
          <div class="row">
            <div class="col-sm-12 hidden-lg hidden-md visible-sm visible-xs">
              <select id="sub-menu" name="sub-menu" onchange="location = this.value;">
                <option value="#">Navigate to...</option>
                <option value="profile">Profile</option>
                <option value="change-details">Update Profile</option>
                <option value="change-password">Change Password</option>
                <option value="change-email">Change Email</option>
                <option value="friendslist">Friendslist</option>
                <option value="sign-out">Sign Out</option>
                <option value="delete">Delete Account</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
