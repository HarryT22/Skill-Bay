/* Autor: Marvin Schulze Berge */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './postDetails.css?inline';

import { Post } from '../../../../api-server/src/models/post';
import { Comment } from '../../../../api-server/src/models/comment';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';
import { User } from '../../../../api-server/src/models/user';

@customElement('app-post')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PostDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property({ type: Boolean }) menuOpen = false;

  @property() postId!: string;

  @query('#commentText') private commentText!: HTMLInputElement;
  @query('#menu') private menu!: HTMLElement;
  @query('#openMenuButton') private openMenuButton!: HTMLButtonElement;

  private post!: Post;
  private postCreator!: User;

  private comments: Comment[] = [];
  private userCommentMap = new Map();

  async firstUpdated() {
    try {
      const responsePost = await httpClient.get('/posts/' + this.postId);
      this.post = await responsePost.json();

      const responseComments = await httpClient.get('/posts/comments/' + this.postId);
      this.comments = (await responseComments.json()).results;

      const responseUser = await httpClient.get('community/getUser/' + this.post.creator);
      this.postCreator = await responseUser.json();
      console.log(this.postCreator);
      this.createUserCommentMap();
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
      <div class="posts-container">
        <div class="post">
          <h1>${this.post?.title}</h1>
          <h2>${this.post?.text}</h2>
          <h3>Created by ${this.postCreator?.name + ' ' + this.postCreator?.lastname}</h3>
        </div>
        <div class="comments-container">
          <h3>Comments</h3>
          <div class="comment-input">
            <form>
              <input type="text" id="commentText" placeholder="Add a comment" />
              <button type="submit" @click="${this.submitComment}">Add</button>
            </form>
          </div>
          <ul class="comment-list">
            ${this.comments.map(
              comment => html`
                <li class="comment">
                  <span class="comment-text">${comment.text}</span>
                  <span class="comment-author"
                    >~
                    ${this.userCommentMap.has(comment.id)
                      ? this.userCommentMap.get(comment.id).name + ' ' + this.userCommentMap.get(comment.id).lastname
                      : ''}
                  </span>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    `;
  }

  async submitComment() {
    if (this.commentText.value.length > 0) {
      this.commentText.setCustomValidity('');
      const commentData = {
        postId: this.postId,
        text: this.commentText.value
      };
      try {
        await httpClient.post('posts/createComment', commentData);
      } catch (e) {
        console.log((e as Error).message);
        this.showNotification((e as Error).message, 'error');
      }
    } else {
      this.commentText.setCustomValidity('Text must be filled');
    }
  }

  async createUserCommentMap() {
    const commentCreators = new Set<string>(); // Use a Set to store unique comment creators

    for (const comment of this.comments) {
      commentCreators.add(comment.creator);
    }
    const commentCreatorsArray = Array.from(commentCreators); // Convert the Set to an array
    const commentCreatorsString = commentCreatorsArray.join(',');

    const response = await httpClient.get(`community/getUsersByIds?ids=${commentCreatorsString}`);
    const users = (await response.json()).results;

    const userCommentMap = new Map();
    this.comments.forEach(comment => {
      const user = users.find((user: User) => user.id == comment.creator);
      if (user) {
        userCommentMap.set(comment.id, user);
      }
    });
    this.userCommentMap = userCommentMap;
    this.requestUpdate();
  }

  feedClicked(event: Event) {
    event.preventDefault();
    router.navigate('/landingpage');
  }

  exploreClicked(event: Event) {
    event.preventDefault();
    router.navigate('/friends');
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
}
