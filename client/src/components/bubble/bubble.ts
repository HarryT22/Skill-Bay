/* Autor: Marvin Schulze Berge */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './bubble.css?inline';

import { Post } from '../../../../api-server/src/models/post';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import { User } from '../../../../api-server/src/models/user';
import { Bubble } from '../../../../api-server/src/models/bubble';

@customElement('app-bubble')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BubbleComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property({ type: Boolean }) menuOpen = false;

  @property() bubbleId!: string;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#text') private textElement!: HTMLInputElement;

  @query('#menu') private menu!: HTMLElement;

  @query('#openMenuButton') private openMenuButton!: HTMLButtonElement;

  posts: Post[] = [];
  userPostMap: Map<string, User> = new Map();
  users: User[] = [];
  userInBubble = false;
  private bubble!: Bubble;

  async firstUpdated() {
    try {
      const responseBubble = await httpClient.get('bubbles/' + this.bubbleId);
      this.bubble = await responseBubble.json();

      const responseAllMembers = await httpClient.get(`community/getUsersByIds?ids=${this.bubble.participants}`);
      this.users = (await responseAllMembers.json()).results;
      const response = await httpClient.get('posts/getByBubble/' + this.bubbleId);
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
              text: 'Create posts and fill this bubble with life',
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
            text: 'Create posts and fill this bubble with life',
            createdAt: Date.now()
          }
        ];
      }
      this.requestUpdate();
      console.log('user:' + this.users[0].name);
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
    this.checkIfUserInBubble();
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
      <div class="group-header" id="group-header">
        <div class="image-container">
          <img src="${this.bubble?.image || ''}" class="image" />
        </div>
        <div class="text-container">
          <h1>${this.bubble?.name}</h1>
          <p>${this.bubble?.description}</p>
        </div>
      </div>
      ${this.userInBubble
        ? null
        : html`
            <div class="membership-container" id="membership-container">
              <button @click="${() => this.joinBubble()}">Join Bubble</button>
            </div>
          `}
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
  }

  feedClicked(event: Event) {
    event.preventDefault();
    router.navigate('/landingpage');
  }

  bubblesClicked(event: Event) {
    event.preventDefault();
    router.navigate('/bubbles');
  }

  exploreClicked(event: Event) {
    event.preventDefault();
    router.navigate('/explore');
  }

  messengerClicked(event: Event) {
    event.preventDefault();
    router.navigate('/messenger');
  }

  closeMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  openMenu() {
    this.menuOpen = !this.menuOpen;
    this.requestUpdate();
  }

  async submit(event: Event) {
    event.preventDefault();
    if (this.userInBubble) {
      if (this.isFormValid()) {
        const postData = {
          title: this.titleElement.value,
          text: this.textElement.value,
          bubbleId: this.bubbleId
        };
        try {
          await httpClient.post('posts/createPostForBubble', postData);
          // Reload the page
          window.location.reload();
        } catch (e) {
          console.log((e as Error).message);
          this.showNotification((e as Error).message, 'error');
        }
      }
    } else {
      alert('You must join the bubble share a post.');
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
    if (post.id != 'dummy') {
      router.navigate(`/posts/${post.id}`);
    }
  }

  async joinBubble() {
    try {
      await httpClient.patch('/bubbles/updateParticipants/' + this.bubble.id, this.bubble);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
    window.location.reload();
  }

  async checkIfUserInBubble() {
    try {
      const response = await httpClient.get('community/getUser');
      const user: User = await response.json();
      this.userInBubble = this.bubble.participants.includes(user.id);
      this.requestUpdate();
      console.log(this.userInBubble);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }
}
