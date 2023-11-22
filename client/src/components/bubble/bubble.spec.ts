/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement, html } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './bubble';

describe('app-bubble', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render the fetched posts', async () => {
    const bubble = {
      name: 'HTML',
      participants: ['1', '2'],
      description: 'Join us',
      image: '',
      id: '1',
      createdAt: 1686605598071
    };

    const bubbleResponse = {
      async json() {
        return Promise.resolve(bubble);
      }
    } as Response;

    const posts = [
      {
        creator: '1',
        title: 'Test',
        text: 'Hallo',
        bubbleId: '1',
        id: '1'
      },
      {
        creator: '2',
        title: 'Test2',
        text: 'Hallo2',
        bubbleId: '1',
        id: '2'
      }
    ];

    const postsResponse = {
      async json() {
        return Promise.resolve({ results: posts });
      }
    } as Response;

    const users = [
      {
        _id: '1',
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        birthday: '1990-01-01',
        image: 'https://example.com/johndoe.png'
      },
      {
        _id: '2',
        name: 'Jane',
        lastname: 'Smith',
        username: 'janesmith',
        email: 'janesmith@example.com',
        birthday: '1995-05-05',
        image: 'https://example.com/janesmith.png'
      }
    ];

    const usersResponse = {
      async json() {
        return Promise.resolve({
          results: users
        });
      }
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');

    getStub.withArgs('bubbles/' + bubble.id).returns(Promise.resolve(bubbleResponse));
    getStub.withArgs('posts/getByBubble/' + bubble.id).returns(Promise.resolve(postsResponse));
    getStub.withArgs(`community/getUsersByIds?ids=${bubble.participants}`).returns(Promise.resolve(usersResponse));
    // Create the component with the bubbleId property
    const element = (await fixture(html`<app-bubble bubbleId="${bubble.id}"></app-bubble>`)) as LitElement;
    await element.updateComplete;
    // Wait for the component's rendering to complete
    await new Promise(resolve => setTimeout(resolve));
    const postElems = element.shadowRoot!.querySelectorAll('.post');
    expect(postElems.length).to.equal(2);
  });
});
