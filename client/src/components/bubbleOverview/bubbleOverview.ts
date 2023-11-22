/* Autor: Marvin Schulze Berge */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './bubblesOverview.css?inline';

import { Bubble } from '../../../../api-server/src/models/bubble';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-bubble-overview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BubbleOverviewComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property({ type: Boolean }) menuOpen = false;

  @property() private interests: { name: string }[] = [];

  @query('#bubbleSearchInput') private bubbleSearchInput!: HTMLInputElement;

  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#description') private descriptionElement!: HTMLInputElement;

  @query('#image') private imageElement!: HTMLInputElement;

  @query('#interests-container') private interestsContainerElement!: HTMLDivElement;

  @query('#menu') private menu!: HTMLElement;

  @query('#openMenuButton') private openMenuButton!: HTMLButtonElement;

  @state() private image!: string;

  bubbles: Bubble[] = [];

  filteredBubbles: Bubble[] = [];

  bubbleColors: { [key: string]: string } = {};

  lastColorIndex = -1;

  colorPalette = ['#80bd9e', '#9e80bd', '#bd808e', '#809ebd', '#bda280'];

  private bubbleInterests: string[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('bubbles/getBubblesByParticipant');
      const data = await response.json();

      if (data && data.results && Array.isArray(data.results)) {
        this.bubbles = data.results;
        this.filteredBubbles = this.bubbles;
      }

      const responseInterests = await httpClient.get('users/interests');
      const interest = await responseInterests.json();
      this.interests = interest;
      this.requestUpdate();
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  render() {
    return html`
      <div
        class="${this.menuOpen
          ? 'w3-sidebar w3-bar-block w3-card w3-animate-left open'
          : 'w3-sidebar w3-bar-block w3-card w3-animate-left closed'}"
        id="menu"
      >
        <button id="closeMenuButton" class="w3-button w3-circle w3-xlarge" @click="${this.closeMenu}">&times;</button>
        <a href="#" @click="${this.feedClicked}" class="w3-bar-item w3-button">Feed</a>
        <a href="#" @click="${this.exploreClicked}" class="w3-bar-item w3-button">Explore</a>
        <a href="#" @click="${this.messengerClicked}" class="w3-bar-item w3-button">Messenger</a>
      </div>
      ${this.menuOpen
        ? null
        : html`
            <button id="openMenuButton" @click="${this.openMenu}" class="w3-button w3-teal w3-xlarge w3-left">
              &#9776;
            </button>
          `}
      <div class="container">
        <h1>Your bubbles</h1>
        <div class="search-bar">
          <input type="text" id="bubbleSearchInput" @input="${this.handleBubbleSearch}" placeholder="Search Bubbles" />
        </div>
        <div class="bubble-container">
          ${this.filteredBubbles.map(
            bubble => html`
              <div class="bubble ${this.getBubbleClass(bubble)}" @click="${() => this.loadBubble(bubble)}">
                <h1 class="bubble-title">${bubble.name}</h1>
                <p class="bubble-description">${bubble.description}</p>
              </div>
            `
          )}
        </div>
        <div class="create-bubble-form-container">
          <h1>Create your own bubble</h1>
          <form>
            <label for="name">Name:</label>
            <input type="text" id="name" name="title" required />
            <label for="description">Description:</label>
            <textarea id="description" name="text" required></textarea>
            <label>Bubble Picture:</label>
            <input @change="${this.handleImageUpload}" type="file" accept="image/*" id="image" required />
            <div id="interests-container">
              ${this.interests.map(
                (interest, index) => html` <div
                  id="interest-${index}"
                  class="interest ${this.bubbleInterests.includes(interest.name) ? 'selected' : ''}"
                  @click=${() => this.toggleInterest(interest.name)}
                >
                  ${interest.name}
                </div>`
              )}
            </div>
            <button type="submit" @click="${this.submit}">Submit</button>
          </form>
        </div>
      </div>
    `;
  }

  async submit(event: Event) {
    event.preventDefault();
    if (this.isFormValid()) {
      const bubbleData = {
        name: this.nameElement.value,
        description: this.descriptionElement.value,
        image: this.image,
        interests: this.bubbleInterests
      };
      try {
        const response = await httpClient.post('bubbles/createBubble', bubbleData);
        const bubble = await response.json();
        console.log('Created bubble');
        this.loadBubble(bubble);
      } catch (e) {
        console.log((e as Error).message);
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  isFormValid() {
    let isValid = true;

    if (this.nameElement.value.length == 0) {
      this.nameElement.setCustomValidity('Title must be filled');
      isValid = false;
    } else {
      this.nameElement.setCustomValidity('');
    }

    if (this.descriptionElement.value.length == 0) {
      this.descriptionElement.setCustomValidity('Text must be filled');
      isValid = false;
    } else {
      this.descriptionElement.setCustomValidity('');
    }

    if (!this.image) {
      this.imageElement.setCustomValidity('Image must be uploaded');
      isValid = false;
    } else {
      this.imageElement.setCustomValidity('');
    }

    // Trigger validation UI for invalid elements
    if (isValid == false) {
      this.imageElement.reportValidity();
      this.descriptionElement.reportValidity();
      this.nameElement.reportValidity();
    } else {
      if (this.bubbleInterests.length == 0) {
        this.interestsContainerElement.style.border = '2px solid red';
        isValid = false;
      }
    }

    return isValid;
  }

  exploreClicked(event: Event) {
    event.preventDefault();
    router.navigate('/explore');
  }

  messengerClicked(event: Event) {
    event.preventDefault();
    router.navigate('/messenger');
  }

  feedClicked(event: Event) {
    event.preventDefault();
    router.navigate('/landingpage');
  }

  closeMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  openMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  getRandomColor() {
    let colorIndex;
    do {
      colorIndex = Math.floor(Math.random() * this.colorPalette.length);
    } while (colorIndex === this.lastColorIndex);
    this.lastColorIndex = colorIndex;
    return this.colorPalette[colorIndex];
  }

  getBubbleColor(bubble: Bubble) {
    if (!this.bubbleColors[bubble.id]) {
      this.bubbleColors[bubble.id] = this.getRandomColor();
    }
    return this.bubbleColors[bubble.id];
  }

  handleBubbleSearch() {
    const filter = this.bubbleSearchInput.value.toUpperCase();

    // Filter the bubbles based on the search keyword
    const filteredBubbles = this.bubbles.filter(bubble => bubble.name.toUpperCase().includes(filter));

    // Update the bubbles to show only the filtered results
    this.filteredBubbles = filteredBubbles;
    this.requestUpdate();
  }

  getBubbleClass(bubble: Bubble) {
    // If the bubble's color class hasn't been assigned yet, assign it now
    if (!this.bubbleColors[bubble.id]) {
      const colorIndex = Math.floor(Math.random() * this.colorPalette.length);
      this.bubbleColors[bubble.id] = 'bubble-color-' + (colorIndex + 1);
    }

    // Return the stored color class for the bubble
    return this.bubbleColors[bubble.id];
  }

  async handleImageUpload(e: InputEvent) {
    const toBase64 = (file: Blob): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    const input = e.target as HTMLInputElement;
    this.image = await toBase64(input.files![0]);
    console.log('image uploaded');
  }

  toggleInterest(interest: string) {
    if (this.bubbleInterests.includes(interest)) {
      this.bubbleInterests = this.bubbleInterests.filter(i => i !== interest);
    } else {
      this.bubbleInterests.push(interest);
    }
    this.requestUpdate();
    console.log(this.bubbleInterests);
    this.interestsContainerElement.style.border = 'none';
  }

  loadBubble(bubble: Bubble) {
    router.navigate(`/bubble/${bubble.id}`);
  }
}
