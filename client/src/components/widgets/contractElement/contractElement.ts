/* Autor: Harry Thünte */
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentStyle from './contractElement.css?inline';

@customElement('app-contract-element')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class contractElementComponent extends LitElement {
  static styles = componentStyle;

  @property() min = 0;
  @property() max = 0;
  @property() lang = 'German';

  render() {
    return html`
      <slot name="title" @click="${() => this.emit('appcontractclick')}"></slot>
      <label for="1">Price range:</label>
      <div id="1">${this.min} - ${this.max}$</div>
      <label for="2">Language:</label>
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
