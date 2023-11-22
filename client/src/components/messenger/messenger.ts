/* Autor: Marvin Schulze Berge */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './messenger.css?inline';

import { User } from '../../../../api-server/src/models/user';
import { Message } from '../../../../api-server/src/models/message';
import { Chat } from '../../../../api-server/src/models/chat';
import { httpClient } from '../../http-client';
import { router } from '../../router/router';

@customElement('app-messenger')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MessengerComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property({ type: Boolean }) menuOpen = false;
  @query('#friend-list') friendList!: HTMLUListElement;
  @query('#chatListButton') chatListButton!: HTMLButtonElement;
  @query('#newChatButton') newChatButton!: HTMLButtonElement;
  @query('#messageText') messageText!: HTMLInputElement;
  @query('#message-list') messageList!: HTMLUListElement;
  @query('#chatTitle') chatTitle!: HTMLHeadingElement;
  @query('#chat-list') chatList!: HTMLDivElement;
  @property({ type: Object }) webSocket: WebSocket | null = null;

  friends: User[] = [];
  chatName = '';
  messages: Message[] = [];
  chats: Chat[] = [];
  activeTab = 'chats';
  newChatReceiverId = '';
  userChatMap = new Map();

  private currentChat!: Chat;
  private currentUser!: User;
  private currentParticipant!: User;
  private chatMessageMap = new Map<string, Message[]>();

  async updated() {
    const lastMessage = this.messageList.lastElementChild;
    if (lastMessage != null) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  async firstUpdated() {
    const responseUser = await httpClient.get('community/getUser');
    this.currentUser = await responseUser.json();

    this.createWebsocket();
    this.checkWebsocketState();

    this.messageText.addEventListener('keypress', event => {
      console.log('Key pressed');
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });

    try {
      const responseChats = await httpClient.get('chats/getChatsByParticipant');
      this.chats = (await responseChats.json()).results;

      this.createUserChatMap();

      const responseFriends = await httpClient.get('community/getFriends');
      const friends = (await responseFriends.json()).results;

      // Filter friends that are already in chats
      this.friends = friends.filter((friend: User) => {
        // Check if friend's id exists in any of the chat's participants
        return !this.chats.some(chat => chat.participants.includes(friend.id));
      });

      this.chatClicked(this.chats[0]);

      if (this.currentChat != null) {
        this.getMessages();
      }
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
      </div>
      ${this.menuOpen
        ? null
        : html`
            <button id="openMenuButton" @click="${this.openMenu}" class="w3-button w3-teal w3-xlarge w3-left">
              &#9776;
            </button>
          `}
      <div class="messenger-container">
        <div class="chat-list-container">
          <div class="tab">
            <button id="chatListButton" class="tablinks" @click="${() => this.openTab('chat-list')}">Chats</button>
            <button id="newChatButton" class="tablinks" @click="${() => this.openTab('friend-list')}">New</button>
          </div>

          <ul id="chat-list">
            ${this.chats.map(
              chat => html`
                <li @click="${() => this.chatClicked(chat)}" href="javascript:void(0)">
                  <span id="chatListElement">
                    ${this.userChatMap.has(chat.id)
                      ? this.userChatMap.get(chat.id)!.name + ' ' + this.userChatMap.get(chat.id)!.lastname
                      : ''}
                  </span>
                </li>
              `
            )}
          </ul>

          <ul id="friend-list" hidden>
            ${this.friends.map(
              user => html`
                <li @click="${() => this.newChatClicked(user)}" href="javascript:void(0)">
                  <span id="friendListElement"> ${user.name + ' ' + user.lastname} </span>
                </li>
              `
            )}
          </ul>
        </div>
        <div class="chat-display-container">
          <div class="chat-header">
            <h1 id="chatTitle" @click="${() => this.userClicked(this.currentParticipant.id)}"></h1>
            <div class="image-container" @click="${() => this.userClicked(this.currentParticipant.id)}">
              <img src="${this.currentParticipant?.image || ''}" class="image" />
            </div>
          </div>
          <div class="chat-messages">
            <ul id="message-list">
              ${this.messages.map(
                message => html`
                  <li class="message ${message.senderId === this.currentUser.id ? 'current-user' : 'other-user'}">
                    <span class="message-text">${message.text}</span>
                  </li>
                `
              )}
            </ul>
          </div>
          <div class="chat-input">
            <input type="text" id="messageText" placeholder="Type a message..." />
            <button @click="${this.sendMessage}">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  openWebscoket() {
    if (this.webSocket) {
      if (this.webSocket.readyState == WebSocket.OPEN) {
        console.log('already open');
      } else {
        this.webSocket = new WebSocket(`ws://localhost:8080/?userId=${this.currentUser.id}`);
        if (this.webSocket) {
          this.webSocket.onopen = () => {
            if (this.webSocket) {
              console.log(this.webSocket.readyState);
            }
          };
        }
      }
    }
  }

  async createUserChatMap() {
    const otherParticipantIds = this.chats.map(chat => {
      const otherParticipants = chat.participants.filter(userId => userId !== this.currentUser.id);
      return otherParticipants.join(', ');
    });

    const response = await httpClient.get(`community/getUsersByIds?ids=${otherParticipantIds}`);
    const users = (await response.json()).results;

    const userChatMap = new Map();
    this.chats.forEach((chat, index) => {
      const otherParticipantId = otherParticipantIds[index];
      const user = users.find((user: User) => user.id === otherParticipantId);
      if (user) {
        userChatMap.set(chat.id, user);
      }
    });
    this.userChatMap = userChatMap;
    this.requestUpdate();
  }

  feedClicked(event: Event) {
    event.preventDefault();
    router.navigate('/landingpage');
  }

  exploreClicked(event: Event) {
    event.preventDefault();
    router.navigate('/explore');
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

  openTab(tabName: string) {
    if (tabName == 'chat-list') {
      this.friendList.hidden = true;
      this.chatList.hidden = false;
      this.chatListButton.style.backgroundColor = 'rgb(128, 189, 158)';
      this.newChatButton.style.backgroundColor = 'rgb(204, 204, 204)';
    } else {
      this.friendList.hidden = false;
      this.chatList.hidden = true;
      this.newChatButton.style.backgroundColor = 'rgb(128, 189, 158)';
      this.chatListButton.style.backgroundColor = 'rgb(204, 204, 204)';
    }
  }

  chatClicked(chat: Chat) {
    console.log('Chat Clicked');
    this.newChatReceiverId = '';

    if (chat != this.currentChat) {
      this.currentParticipant = this.userChatMap.get(chat.id);
      //if (this.currentParticipant != undefined) {
      this.chatTitle.textContent = this.currentParticipant.name + ' ' + this.currentParticipant.lastname;
      //}
      this.currentChat = chat;
      try {
        if (this.chatMessageMap.has(this.currentChat.id)) {
          this.getCachedMessages();
        } else {
          this.getMessages();
        }
      } catch (e) {
        console.log((e as Error).message);
        this.showNotification((e as Error).message, 'error');
      }
    }
    this.requestUpdate();
  }

  newChatClicked(user: User) {
    this.currentParticipant = user;
    this.currentChat = {} as Chat;
    this.messages = [];
    this.chatTitle.textContent = user.name + ' ' + user.lastname;
    this.newChatReceiverId = user.id;
    this.requestUpdate();
  }

  sendMessageToWebsocket(message: never) {
    if (this.webSocket && this.webSocket.readyState == WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(message));
    }
  }

  async sendMessage() {
    if (this.messageText.value != '') {
      if (this.newChatReceiverId != '') {
        const chatData = {
          receiverId: this.newChatReceiverId
        };
        try {
          // Creating new chat
          const respone = await httpClient.post('chats/createChat', chatData);
          const newChat: Chat = await respone.json();
          this.currentChat = newChat;

          //update chatlist
          const receiver = this.friends.find(user => user.id === this.newChatReceiverId);
          this.userChatMap.set(newChat.id, receiver);
          this.chats.push(newChat);

          //remove receiver from new chat list
          this.friends = this.friends.filter(user => user.id !== this.newChatReceiverId);

          // Redirect to the chat
          this.chatClicked(newChat);
          this.openTab('chat-list');

          // Creating messageData
          const messageData = {
            chatId: this.currentChat.id,
            receiverId: this.newChatReceiverId,
            text: this.messageText.value
          };

          //post request for message
          await httpClient.post('messages/sendMessage', messageData);

          //sending message to websocket
          this.sendMessageToWebsocket(messageData as never);

          //cleaing up and retrieving new messages
          this.messageText.value = '';
          this.newChatReceiverId = '';

          this.getMessages();
        } catch (e) {
          console.log((e as Error).message);
          this.showNotification((e as Error).message, 'error');
        }
      } else {
        //retrieving id of chatPartner
        const otherParticipantId = this.currentChat.participants.find(userId => userId !== this.currentUser.id);
        // Creating messageData
        const messageData = {
          chatId: this.currentChat.id,
          receiverId: otherParticipantId,
          text: this.messageText.value
        };

        //post request for message
        await httpClient.post('messages/sendMessage', messageData);

        //sending message to websocket
        this.sendMessageToWebsocket(messageData as never);

        //cleaing up
        this.messageText.value = '';

        this.getMessages();
      }

      this.requestUpdate();
    }
  }

  getCachedMessages() {
    console.log('Using cach');
    this.messages = this.chatMessageMap.get(this.currentChat.id)!;
    this.requestUpdate();
    const lastMessage = this.messageList.lastElementChild;
    if (lastMessage != null) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  async getMessages() {
    console.log('not using cach');
    const response = await httpClient.get('messages/getByChatId/' + this.currentChat.id);
    const messages = (await response.json()).results;
    this.messages = messages.sort((a: Message, b: Message) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    this.chatMessageMap.set(this.currentChat.id, messages);
    this.requestUpdate();
    const lastMessage = this.messageList.lastElementChild;
    if (lastMessage != null) {
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  userClicked(userId: string) {
    router.navigate(`/friends/details/${userId}`);
  }

  readWebSocketReadyState() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout exceeded while connecting to webserver. Trying again...'));
      }, 3000);

      const interval = setInterval(() => {
        const readyState = this.webSocket?.readyState;
        if (readyState !== 0) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(readyState);
        }
      }, 100);
    });
  }

  async checkWebsocketState() {
    try {
      await this.readWebSocketReadyState.call(this);
    } catch (e) {
      console.error('Error:', (e as Error).message);
      this.createWebsocket();
    }
  }

  createWebsocket() {
    this.webSocket = new WebSocket(`ws://localhost:8080/?userId=${this.currentUser.id}`);
    //this.webSocket = new WebSocket(`ws://stud-vm-6637:8080/?userId=${this.currentUser.id}`);

    this.webSocket.onmessage = event => {
      const message = JSON.parse(event.data);
      console.log(this.currentChat.id);
      console.log(message.chatId);

      if (this.chatMessageMap.has(this.currentChat.id)) {
        this.chatMessageMap.get(this.currentChat.id)?.push(message);
        console.log('message cached');
        if (this.currentChat.id == message.chatId) {
          this.getMessages();
          this.requestUpdate();
        }
      }
    };

    this.webSocket.onclose = () => {
      //console.log(`WebSocket connection closed: ${event.code}`);
      if (this.webSocket) {
        this.webSocket.close();
      }
    };

    this.webSocket.onopen = () => {
      console.log(`Websocket open`);
    };
  }
}
