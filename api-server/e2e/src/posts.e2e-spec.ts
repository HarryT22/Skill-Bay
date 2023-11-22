/* Autor: Marvin Schulze Berge */

import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Post } from '../../src/models/post.js';
import { Comment } from '../../src/models/comment.js';
import { Bubble } from '../../src/models/bubble.js';
import { cryptoService } from '../../src/services/crypto.service.js';

describe('/posts', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/getAllPostsFriends', () => {
    it('should return a message if the user has no friends', async () => {
      const response = await userSession.get('/posts/getAllPostsFriends');
      expect(response.status).to.equal(200);
    });
  });

  describe('/createPost', () => {
    it('should create a new post and return the created post', async () => {
      const response = await userSession.post('/posts/createPost', {
        title: 'Test Post',
        text: 'This is a test post'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Post;
      expect(cryptoService.decrypt(json.title)).to.equal('Test Post');
      expect(cryptoService.decrypt(json.text)).to.equal('This is a test post');
      await userSession.delete('/posts/delete/' + json.id);
    });
  });

  describe('/createPostForBubble', () => {
    it('should create a new post for a specific bubble and return the created post', async () => {
      // Create a bubble and get its ID
      const responseBubble = await userSession.post('/bubbles/createBubble', {
        name: 'Test Bubble',
        image: 'test.jpg',
        description: ['This is a test bubble'],
        interests: ['Testing', 'E2E']
      });
      const json = (await responseBubble.json()) as Bubble;
      const bubbleId = json.id;

      const response = await userSession.post('/posts/createPostForBubble', {
        title: 'Test Post for Bubble',
        text: 'This is a test post for a bubble',
        bubbleId: bubbleId
      });

      expect(response.status).to.equal(201);
      const json1 = (await response.json()) as Post;
      expect(cryptoService.decrypt(json1.title)).to.equal('Test Post for Bubble');
      expect(cryptoService.decrypt(json1.text)).to.equal('This is a test post for a bubble');
      expect(json1.bubbleId).to.equal(bubbleId);
      await userSession.delete('/bubbles/delete/' + json.id);
      await userSession.delete('/posts/delete/' + json1.id);
    });
  });

  describe('/:id', () => {
    it('should return the post with the specified ID', async () => {
      const responseCreatedPost = await userSession.post('/posts/createPost', {
        title: 'Test Post',
        text: 'This is a test post'
      });
      const jsonCreatedPost = (await responseCreatedPost.json()) as Post;

      const response = await userSession.get(`/posts/${jsonCreatedPost.id}`);
      expect(response.status).to.equal(200);
      const json = (await response.json()) as Post;
      expect(json.id).to.equal(jsonCreatedPost.id);
      await userSession.delete('/posts/delete/' + jsonCreatedPost.id);
    });

    it('should return a 200 status code if the post does not exist', async () => {
      const response = await userSession.get('/posts/nonexistentId');
      expect(response.status).to.equal(200);
    });
  });

  describe('/getByBubble/:id', () => {
    it('should return a list of posts belonging to the specified bubble ID', async () => {
      // Create a bubble and get its ID
      const responeBubble = await userSession.post('/bubbles/createBubble', {
        name: 'Test Bubble',
        image: 'test.jpg',
        description: ['This is a test bubble'],
        interests: ['Testing', 'E2E']
      });
      const jsonBubble = (await responeBubble.json()) as Bubble;
      const bubbleId = jsonBubble.id;

      // Create a post for the bubble
      await userSession.post('/posts/createPostForBubble', {
        title: 'Test Post for Bubble',
        text: 'This is a test post for a bubble',
        bubbleId: bubbleId
      });

      const response = await userSession.get(`/posts/getByBubble/${bubbleId}`);
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Post> };
      expect(json.results).to.have.lengthOf(1);
      expect(json.results[0].bubbleId).to.equal(bubbleId);
      await userSession.delete('/bubbles/delete/' + bubbleId);
      await userSession.delete('/posts/delete/' + json.results[0].id);
    });

    it('should return a 200 status code if no posts belong to the specified bubble ID', async () => {
      const response = await userSession.get('/posts/getByBubble/nonexistentId');
      expect(response.status).to.equal(200);
    });
  });

  describe('/createComment', () => {
    it('should create a new comment for the specified post and return the created comment', async () => {
      const response = await userSession.post('/posts/createComment', {
        postId: 12345,
        text: 'This is a test comment'
      });
      expect(response.status).to.equal(201);
      const json = (await response.json()) as Comment;
      expect(json.postId).to.equal(12345);
      expect(json.text).to.equal('This is a test comment');
      await userSession.delete('/posts/deleteComment/' + json.id);
    });
  });

  describe('/comments/:id', () => {
    it('should return a list of comments belonging to the specified post ID', async () => {
      // Create post for comment
      const responsePost = await userSession.post('/posts/createPost', {
        title: 'Test Post',
        text: 'This is a test post'
      });
      const jsonPost = (await responsePost.json()) as Post;

      // Create a comment for the post
      const responseComment = await userSession.post('/posts/createComment', {
        postId: jsonPost.id,
        text: 'This is a test comment'
      });
      const jsonComment = (await responseComment.json()) as Comment;
      const commentId = jsonComment.id;

      const response = await userSession.get(`/posts/comments/${jsonPost.id}`);
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Comment> };
      expect(json.results.length).to.equal(1);
      expect(json.results[0].id).to.equal(commentId);

      await userSession.delete('/posts/delete/' + jsonPost.id);
      await userSession.delete('/posts/deleteComment/' + commentId);
    });

    it('should return a 200 status code if no comments belong to the specified post ID', async () => {
      const response = await userSession.get('/posts/comments/nonexistentId');
      expect(response.status).to.equal(200);
    });
  });
});
