/* Autor: Annika Junge */
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import componentStyle from './header.css?inline';
import { httpClient } from '../../../http-client';

@customElement('app-header')
class HeaderComponent extends LitElement {
  static styles = componentStyle;

  @property() title = '';

  @property({ type: Array }) headerVariations: Array<{ title: string; routePath: string }> = [];

  @state() menuOpen = false;

  @property() authenticated = false;

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
  }

  async checkAuthentication() {
    try {
      await httpClient.get('users/secure');
      this.authenticated = true;
    } catch (e) {
      console.log('user is not signed up');
      this.authenticated = false;
    }
  }

  render() {
    return html`
      <a href="/" class="title">${this.title}</a>
      <span class="menu-button" @click="${this.toggleMenu}"></span>
      <ol ?open=${this.menuOpen}>
        ${this.headerVariations.map(
          linkItem => html`<li>
            <a href="${linkItem.routePath}" @click=${this.closeMenu}>${linkItem.title}</a>
          </li>`
        )}
      </ol>
    `;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
