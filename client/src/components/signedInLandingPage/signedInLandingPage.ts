/* Autor: Marvin Schulze Berge */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './signedInLandingPage.css?inline';

import { Post } from '../../../../api-server/src/models/post';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import { User } from '../../../../api-server/src/models/user';
import { FriendRequest } from '../../../../api-server/src/models/friendRequest';

@customElement('app-signed-in-landing-page')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignedInLandingPageComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property({ type: Boolean }) menuOpen = false;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#text') private textElement!: HTMLInputElement;

  @query('#menu') private menu!: HTMLElement;

  @query('#openMenuButton') private openMenuButton!: HTMLButtonElement;

  @query('#toggleFriendRequestListButton') private toggleFriendRequestListButton!: HTMLButtonElement;

  @query('#friendRequestList') private friendRequestList!: HTMLUListElement;

  @query('#friend-request-container') private friendRequestContainer!: HTMLDivElement;

  posts: Post[] = [];
  userPostMap: Map<string, User> = new Map();
  users: User[] = [];

  friendRequestTextToggle = 'friend-request-text-closed';
  friendRequestContainerToggle = 'friend-request-container-closed';
  friendRequestListOpen = false;
  friendRequests: FriendRequest[] = [];
  friendRequestSenders: User[] = [];
  friendRequestUserMap = new Map();

  async firstUpdated() {
    try {
      const responseAllUsers = await httpClient.get('community/allUsers');
      this.users = (await responseAllUsers.json()).results;

      const response = await httpClient.get('posts/getAllPostsFriends');
      const data = await response.json();

      if (data && data.results && Array.isArray(data.results)) {
        if (data.results.length > 0) {
          this.posts = data.results;
          this.createUserPostMap();
        } else {
          this.posts = [
            {
              id: 'dummy',
              creator: 'System',
              title: "It's empty here...",
              text: 'Explore and connect with other users',
              createdAt: Date.now()
            }
          ];
        }
      } else {
        this.posts = [
          {
            id: 'dummy',
            creator: 'System',
            title: "It's empty here...",
            text: 'Explore and connect with other users',
            createdAt: Date.now()
          }
        ];
      }
      console.log('Hallo');
      const responseFriendRequests = await httpClient.get(`friendRequests/getFriendRequests`);
      this.friendRequests = (await responseFriendRequests.json()).results;

      this.createFriendRequestUserMap();

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
        <a href="#" @click="${this.exploreClicked}" class="w3-bar-item w3-button">Explore</a>
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
      <div class="friend-request-container ${this.friendRequestContainerToggle}">
        <div class="friend-requests">
          <div class="flex-container">
            <h1>
              <span class="friend-request-text ${this.friendRequestTextToggle}">Friend Requests</span>
              <span class="friend-request-count">&nbsp(${this.friendRequests.length})</span>
            </h1>
            <button id="toggleFriendRequestListButton" @click="${this.toggleFriendRequestList}">&#9993;</button>
          </div>
          <ul id="friendRequestList" hidden>
            ${this.friendRequests.map(
              friendRequest => html`
                <li>
                  <span
                    id="friendRequestElement"
                    href="javascript:void(0)"
                    @click="${() => this.friendRequestClicked(friendRequest.senderId)}"
                  >
                    ${this.friendRequestUserMap.get(friendRequest.id)}
                    <button
                      id="acceptFriendButton"
                      <button
                      id="acceptFriendButton"
                      @click="${(e: { stopPropagation: () => void }) => {
                        e.stopPropagation();
                        this.acceptFriendRequest(friendRequest.id);
                      }}"
                    >
                      Accept
                    </button>
                  </span>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
      <div class="container">
        <div class="create-post-form-container">
          <h1>Create Post</h1>
          <form>
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required />
            <label for="text">Text:</label>
            <textarea id="text" name="text" required></textarea>
            <button type="submit" @click="${this.submit}">Submit</button>
          </form>
        </div>
        <div class="posts-container">
          ${this.posts.map(
            post => html`
              <div class="post" @click="${() => this.showPost(post)}">
                <h1>${post.title}</h1>
                <h2>${post.text}</h2>
                <h3>
                  Created by
                  ${this.userPostMap.has(post.id)
                    ? this.userPostMap.get(post.id)?.name + ' ' + this.userPostMap.get(post.id)?.lastname
                    : ''}
                </h3>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  createUserPostMap() {
    const userPostMap = new Map();
    this.posts.forEach(post => {
      const user = this.users.find((user: User) => user.id === post.creator);
      if (user) {
        userPostMap.set(post.id, user);
      }
    });
    this.userPostMap = userPostMap;
    this.requestUpdate();
    console.log(this.userPostMap);
  }

  exploreClicked(event: Event) {
    event.preventDefault();
    router.navigate('/explore');
  }

  messengerClicked(event: Event) {
    event.preventDefault();
    router.navigate('/messenger');
  }

  bubblesClicked(event: Event) {
    event.preventDefault();
    router.navigate('/bubbles');
  }

  friendRequestClicked(userId: string) {
    router.navigate(`/friends/details/${userId}`);
  }

  closeMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  openMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  async getPosts() {
    try {
      const response = await httpClient.get('posts/getAllPosts');
      this.posts = (await response.json()).results;
      this.requestUpdate();
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
      alert((e as Error).stack);
    }
  }

  async submit(event: Event) {
    event.preventDefault();
    if (this.isFormValid()) {
      const postData = {
        title: this.titleElement.value,
        text: this.textElement.value
      };
      try {
        const response = await httpClient.post('posts/createPost', postData);
        const post = await response.json();
        console.log('Created Post');
        this.showPost(post);
      } catch (e) {
        console.log((e as Error).message);
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  isFormValid() {
    let isValid = true;

    if (this.titleElement.value.length == 0) {
      this.titleElement.setCustomValidity('Title must be filled');
      isValid = false;
    } else {
      this.titleElement.setCustomValidity('');
    }

    if (this.textElement.value.length == 0) {
      this.textElement.setCustomValidity('Text must be filled');
      isValid = false;
    } else {
      this.textElement.setCustomValidity('');
    }

    // Trigger validation UI for invalid elements
    if (!isValid) {
      this.textElement.reportValidity();
      this.titleElement.reportValidity();
    }

    return this.form.checkValidity();
  }

  async showPost(post: Post) {
    if (post.id === 'dummy') {
      router.navigate('/explore');
    } else {
      router.navigate(`/posts/${post.id}`);
    }
  }

  createFriendRequestUserMap() {
    this.friendRequests.forEach(friendRequest => {
      const user = this.users.find(user => user.id === friendRequest.senderId);
      if (user) {
        this.friendRequestUserMap.set(friendRequest.id, user.name + ' ' + user.lastname);
      }
    });
    console.log(this.friendRequestUserMap);
  }

  async getFriendRequests() {
    const responseFriendRequests = await httpClient.get(`friendRequests/getFriendRequests`);
    this.friendRequests = (await responseFriendRequests.json()).results;

    this.friendRequests.forEach(async (friendRequest: FriendRequest) => {
      const responseUsers = await httpClient.get(`friendRequests/getUserById/${friendRequest.senderId}`);
      this.friendRequestSenders.push((await responseUsers.json()).results);
    });
    console.log(this.friendRequestSenders);
    this.requestUpdate();
  }

  async acceptFriendRequest(friendRequestId: string) {
    await httpClient.delete(`friendRequests/acceptFriendRequest/${friendRequestId}`);

    this.friendRequests = this.friendRequests.filter(request => request.id !== friendRequestId);
    this.friendRequestUserMap.delete(friendRequestId);
    this.requestUpdate();
  }

  toggleFriendRequestList() {
    if (this.friendRequestListOpen == false) {
      this.friendRequestList.hidden = false;
      this.friendRequestListOpen = true;
      this.toggleFriendRequestListButton.innerHTML = '&#10006;';
      this.toggleFriendRequestListButton.style.borderRadius = '50%';
      this.friendRequestTextToggle = 'friend-request-text-open';
      this.friendRequestContainerToggle = 'friend-request-container-open';
    } else {
      this.friendRequestList.hidden = true;
      this.friendRequestListOpen = false;
      this.toggleFriendRequestListButton.innerHTML = '&#9993;';
      this.friendRequestTextToggle = 'friend-request-text-closed';
      this.friendRequestContainerToggle = 'friend-request-container-closed';
      this.toggleFriendRequestListButton.style.borderRadius = '10%';
    }
    this.requestUpdate();
  }
}
