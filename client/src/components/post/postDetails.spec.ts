/* Autor: Marvin Schulze Berge */

import { fixture, html } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { httpClient } from '../../http-client.js';
import './postDetails.js';
import { LitElement } from 'lit';

describe('app-post', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch and render post details', async () => {
    const postId = '123';
    const post = {
      title: 'Post Title',
      text: 'Post Text',
      creator: 'user123'
    };
    const comments = [
      { id: 'comment1', text: 'Comment 1', creator: '456' },
      { id: 'comment2', text: 'Comment 2', creator: '789' }
    ];
    const user = { id: 'user123', name: 'John', lastname: 'Doe' };

    const users = [
      {
        _id: '456',
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        birthday: '1990-01-01',
        image: 'https://example.com/johndoe.png'
      },
      {
        _id: '789',
        name: 'Jane',
        lastname: 'Smith',
        username: 'janesmith',
        email: 'janesmith@example.com',
        birthday: '1995-05-05',
        image: 'https://example.com/janesmith.png'
      }
    ];

    const postResponse = {
      json: async () => post
    } as Response;
    const commentsResponse = {
      json: async () => ({ results: comments })
    } as Response;
    const userResponse = {
      json: async () => user
    } as Response;
    const usersResponse = {
      json: async () => ({ results: users })
    } as Response;

    const getStub = sinon.stub(httpClient, 'get');
    getStub.withArgs(`/posts/${postId}`).resolves(postResponse);
    getStub.withArgs(`/posts/comments/${postId}`).resolves(commentsResponse);
    getStub.withArgs(`community/getUser/user123`).resolves(userResponse);
    getStub.withArgs(`community/getUsersByIds?ids=456,789`).resolves(usersResponse);

    const element = (await fixture(html`<app-post .postId="${postId}"></app-post>`)) as LitElement;

    await element.updateComplete;

    const titleElement = element.shadowRoot!.querySelector('h1');
    const textElement = element.shadowRoot!.querySelector('h2');
    const creatorElement = element.shadowRoot!.querySelector('h3');

    expect(titleElement!.textContent).to.equal(post.title);
    expect(textElement!.textContent).to.equal(post.text);
    expect(creatorElement!.textContent).to.equal(`Created by ${user.name} ${user.lastname}`);
  });

  it('should submit a comment', async () => {
    const postId = '123';
    const commentText = 'Test Comment';

    const postResponse = {
      json: async () => ({})
    } as Response;

    const postStub = sinon.stub(httpClient, 'post').resolves(postResponse);

    const element = (await fixture(html`<app-post .postId="${postId}"></app-post>`)) as LitElement;

    await element.updateComplete;

    const commentInput = element.shadowRoot!.querySelector('#commentText') as HTMLInputElement;
    commentInput.value = commentText;

    const submitButton = element.shadowRoot!.querySelector('button');
    submitButton!.click();

    await element.updateComplete;
    expect(postStub.calledOnceWith('posts/createComment', { postId: postId, text: commentText })).to.be.true;
  });
});
