/* Autor: Simon Guyon */
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentStyle from './course.css?inline';

@customElement('app-course')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseComponent extends LitElement {
  static styles = componentStyle;

  @property() price = '';
  @property() startDate = '';

  render() {
    const date = new Date(this.startDate);
    const formattedDate = date.toLocaleDateString('en-CA');

    return html`
      <div>
        <slot name="coursename" @click="${() => this.emit('appcourseclick')}"></slot>
      </div>
      <div class="info-row">
        <span>Price:</span>
        <span>${this.price}€</span>
      </div>
      <div class="info-row">
        <span>Start Date:</span>
        <span>${formattedDate}</span>
      </div>
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
