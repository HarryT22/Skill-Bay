/* Autor: Marvin Schulze Berge */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './explore.css?inline';

import { User } from '../../../../api-server/src/models/user';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import { Bubble } from '../../../../api-server/src/models/bubble';
import { FriendRequest } from '../../../../api-server/src/models/friendRequest';

@customElement('app-explore')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ExploreComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property({ type: Boolean }) menuOpen = false;

  @property({ type: Boolean }) isPopupOpen = false;

  @query('#textInput') private textInput!: HTMLInputElement;

  @query('#userList') private userList!: HTMLUListElement;

  @query('#addFriendButton') private addFriendButton!: HTMLButtonElement;

  @query('#toggleFriendRequestListButton') private toggleFriendRequestListButton!: HTMLButtonElement;

  @query('#bubbleSearchInput') private bubbleSearchInput!: HTMLInputElement;

  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#description') private descriptionElement!: HTMLInputElement;

  @query('#menu') private menu!: HTMLElement;

  @query('#openMenuButton') private openMenuButton!: HTMLButtonElement;

  //private User!: User;
  bubbles: Bubble[] = [];

  filteredBubbles: Bubble[] = [];

  bubbleColors: { [key: string]: string } = {};

  lastColorIndex = -1;

  colorPalette = ['#80bd9e', '#9e80bd', '#bd808e', '#809ebd', '#bda280'];

  users: User[] = [];
  friendRequests: FriendRequest[] = [];
  friendRequestSenders: User[] = [];

  async firstUpdated() {
    try {
      const responseAllUsers = await httpClient.get('community/allUsers');
      this.users = (await responseAllUsers.json()).results;
      const response = await httpClient.get('bubbles/getAllBubbles');
      this.bubbles = (await response.json()).results;
      this.filteredBubbles = this.bubbles;

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
        <a href="#" @click="${this.bubblesClicked}" class="w3-bar-item w3-button">Bubbles</a>
        <a href="#" @click="${this.messengerClicked}" class="w3-bar-item w3-button">Messenger</a>
      </div>
      ${this.menuOpen
        ? null
        : html`
            <button id="openMenuButton" @click="${this.openMenu}" class="w3-button w3-teal w3-xlarge w3-left">
              &#9776;
            </button>
          `}
      <div class="${this.isPopupOpen ? 'friendRequestPopup' : 'friendRequestPopup hidden'}" data-type="warning">
        <div class="successContent">
          <div class="success-icon">
            <svg class="successIcon" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" />
              <polyline points="22,30 28,36 38,26" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="title">Friendrequest sent!</h3>
          <p class="text">Your friend request has been successfully sent. Waiting for the user to accept.</p>
        </div>
      </div>
      <div class="container">
        <div class="bubble-overview-container">
          <div class="search-bar">
            <input
              type="text"
              id="bubbleSearchInput"
              @input="${this.handleBubbleSearch}"
              placeholder="Search for bubbles..."
            />
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
        </div>
        <div class="user-search-container">
          <div class="user-search">
            <input type="text" id="textInput" @keyup="${this.filterUsers}" placeholder="Search for users..." />
            <ul id="userList">
              ${this.users.map(
                user => html`
                    <li>
                      <a href="javascript:void(0)" @click="${() => this.userClicked(user.id)}">
                        <span align-items: center;">${user.name + ' ' + user.lastname}</span>
                        
                        <button id="addFriendButton" @click="${(e: { stopPropagation: () => void }) => {
                          e.stopPropagation();
                          this.sendFriendRequest(user.id);
                        }}">Add Friend</button>
                      </a>
                    </li>
                  `
              )}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  filterUsers() {
    // Declare variables
    let a, i, txtValue;
    const filter = this.textInput.value.toUpperCase();
    const li = this.userList.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName('a')[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  }

  async sendFriendRequest(receiverId: string) {
    const friendRequestData = {
      receiverId: receiverId
    };
    try {
      let friendRequests: FriendRequest[] = [];
      const response = await httpClient.get(
        `friendRequests/getFriendRequestByReceiverAndSender?receiverId=${receiverId}`
      );
      friendRequests = (await response.json()).results;
      if (friendRequests.length > 0) {
        alert('Already sent a friendrequest to this user.');
      } else {
        await httpClient.post('friendRequests/sendFriendRequest', friendRequestData);
        console.log('Sent friendRequest');
        this.showPopup();
      }
    } catch (e) {
      console.log((e as Error).message);
      this.showNotification((e as Error).message, 'error');
    }
  }

  feedClicked(event: Event) {
    event.preventDefault();
    router.navigate('/landingpage');
  }

  messengerClicked(event: Event) {
    event.preventDefault();
    router.navigate('/messenger');
  }

  bubblesClicked(event: Event) {
    event.preventDefault();
    router.navigate('/bubbles');
  }

  closeMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  openMenu() {
    this.menuOpen = !this.menuOpen;
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

  handleBubbleSearch() {
    const filter = this.bubbleSearchInput.value.toUpperCase();

    // Filter the bubbles based on the search keyword
    const filteredBubbles = this.bubbles.filter(bubble => bubble.name.toUpperCase().includes(filter));

    // Update the bubbles to show only the filtered results
    this.filteredBubbles = filteredBubbles;
    this.requestUpdate();
  }

  loadBubble(bubble: Bubble) {
    router.navigate(`/bubble/${bubble.id}`);
  }

  userClicked(userId: string) {
    router.navigate(`/friends/details/${userId}`);
  }

  showPopup() {
    this.isPopupOpen = true;
    this.requestUpdate();
    setTimeout(() => {
      this.isPopupOpen = false;
      this.requestUpdate();
    }, 3000);
  }
}
