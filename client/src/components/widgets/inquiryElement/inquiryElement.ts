/* Autor: Harry Thünte */
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentStyle from './inquiryElement.css?inline';

@customElement('app-inquiry-element')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class inquiryElementComponent extends LitElement {
  static styles = componentStyle;

  @property() pE = 0;
  @property() lang = 'German';

  render() {
    return html`
      <slot name="title" @click="${() => this.emit('appinquiryclick')}"></slot>
      <label for="1">Pay estimate:</label>
      <div id="1">${this.pE}$</div>
      <label for="2"> Language: </label>
      <div id="2">${this.lang}</div>
    `;
  }

  emit(eventType: string, eventData = {}) {
    const event = new CustomEvent(eventType, {
      detail: eventData,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}
