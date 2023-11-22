/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement, html } from 'lit';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';

describe('app-explore', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should filter users based on search input', async () => {
    const users = [
      { id: '1', name: 'John Doe', lastname: 'Smith' },
      { id: '2', name: 'Jane Doe', lastname: 'Johnson' }
    ];

    const responseAllUsers = {
      async json() {
        return Promise.resolve({ results: users });
      }
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');
    getStub.withArgs('community/allUsers').returns(Promise.resolve(responseAllUsers));

    // Create the component
    const element = (await fixture(html`<app-explore></app-explore>`)) as LitElement; // Cast the element to ExploreComponent
    await element.updateComplete; // Update the component again after waiting
    await nextFrame(); // Wait for the next rendering frame

    const textInput = element.shadowRoot!.querySelector('#textInput') as HTMLInputElement;
    console.log(element.shadowRoot?.innerHTML);
    textInput.value = 'John';
    textInput.dispatchEvent(new Event('keyup'));

    await nextFrame(); // Wait for the next rendering frame

    const userList = element.shadowRoot!.querySelector('#userList');
    const filteredUsers = Array.from(userList?.querySelectorAll('li') || []) as HTMLLIElement[];

    expect(filteredUsers.length).to.equal(1);
    expect(filteredUsers[0].textContent!.trim()).to.equal('John Doe Smith');
  });

  it('should send a friend request', async () => {
    const users = [
      { id: '1', name: 'John Doe', lastname: 'Smith' },
      { id: '2', name: 'Jane Doe', lastname: 'Johnson' }
    ];

    const responseAllUsers = {
      async json() {
        return Promise.resolve({ results: users });
      }
    } as Response;

    const friendRequests = [{ id: '1', senderId: '2', receiverId: '1' }];

    const responseFriendRequests = {
      async json() {
        return Promise.resolve({ results: friendRequests });
      }
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');

    getStub.withArgs('community/allUsers').returns(Promise.resolve(responseAllUsers));
    getStub
      .withArgs('friendRequests/getFriendRequestByReceiverAndSender?receiverId=1')
      .returns(Promise.resolve(responseFriendRequests));

    // Create the component
    const element = (await fixture(html`<app-explore></app-explore>`)) as LitElement;

    await element.updateComplete;
    await nextFrame(); // Wait for the next rendering frame

    await element.updateComplete; // Update the component again after waiting

    const addFriendButton = element.shadowRoot?.querySelector('#addFriendButton') as HTMLButtonElement;
    addFriendButton.click();

    await nextFrame(); // Wait for the next rendering frame

    const popup = element.shadowRoot?.querySelector('.friendRequestPopup');
    const isPopupOpen = !!popup;

    expect(isPopupOpen).to.be.true;
  });
});
