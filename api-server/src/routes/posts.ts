/*Autor: Marvin Schulze Berge*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { User } from '../models/user';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/getAllPostsFriends', authService.authenticationMiddleware, async (req, res) => {
  try {
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;
    const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
    const user = await userDAO.findOne({ id: res.locals.user.id });
    const friends: string[] = user?.friends || [];

    const posts = await postDAO.findAll({ creator: { $in: friends } as never, bubbleId: '' });

    console.log(posts);

    if (posts.length > 0) {
      const decryptedPosts = posts.map(post => {
        post.title = cryptoService.decrypt(post.title as string);
        post.text = cryptoService.decrypt(post.text as string);
        return post;
      });
      res.status(200).json({ results: decryptedPosts });
    } else {
      res.status(200).json({ message: 'User has no friends yet.' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Error fetching posts' });
  }
});

router.post('/createPost', authService.authenticationMiddleware, async (req, res) => {
  const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
  const createdPost: Post = await postDAO.create({
    creator: res.locals.user.id,
    title: cryptoService.encrypt(req.body.title),
    text: cryptoService.encrypt(req.body.text),
    bubbleId: ''
  });
  res.status(201).json(createdPost);
});

router.post('/createPostForBubble', authService.authenticationMiddleware, async (req, res) => {
  const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
  const createdPost: Post = await postDAO.create({
    creator: res.locals.user.id,
    title: cryptoService.encrypt(req.body.title),
    text: cryptoService.encrypt(req.body.text),
    bubbleId: req.body.bubbleId
  });
  res.status(201).json(createdPost);
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
  const post = await postDAO.findOne({ id: req.params.id });
  if (!post) {
    res.status(200).json({ message: `No posts exists with ID ${req.params.id}` });
  } else {
    post.title = cryptoService.decrypt(post.title);
    post.text = cryptoService.decrypt(post.text);
    res.status(200).json(post);
  }
});

router.get('/getByBubble/:id', authService.authenticationMiddleware, async (req, res) => {
  const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
  console.log(req.params.id);
  const posts = await postDAO.findAll({ bubbleId: req.params.id });
  if (posts) {
    if (posts.length == 0) {
      res.status(200).json({ message: `No posts exists with bubbleId ${req.params.id}` });
    } else {
      const decryptedPosts = posts.map(post => {
        post.title = cryptoService.decrypt(post.title as string);
        post.text = cryptoService.decrypt(post.text as string);
        return post;
      });
      res.status(200).json({ results: decryptedPosts });
    }
  } else {
    res.status(404).json({ message: 'Error fetching posts' });
  }
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
  await postDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/comments/:id', authService.authenticationMiddleware, async (req, res) => {
  try {
    const commentDAO: GenericDAO<Comment> = req.app.locals.commentDAO;
    const comments = await commentDAO.findAll({ postId: req.params.id });

    if (comments.length > 0) {
      res.status(200).json({ results: comments });
    } else {
      res.status(200).json({ results: comments, message: 'No comments found for post' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Error fetching posts' });
  }
});

router.post('/createComment', authService.authenticationMiddleware, async (req, res) => {
  const commentDAO: GenericDAO<Comment> = req.app.locals.commentDAO;
  const createdComment: Comment = await commentDAO.create({
    postId: req.body.postId,
    creator: res.locals.user.id,
    text: req.body.text
  });
  res.status(201).json(createdComment);
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const postDAO: GenericDAO<Post> = req.app.locals.postDAO;
  await postDAO.delete(req.params.id);
  res.status(200).end();
});

router.post('/deleteComment/:id', authService.authenticationMiddleware, async (req, res) => {
  const commentDAO: GenericDAO<Comment> = req.app.locals.commentDAO;
  await commentDAO.delete(req.params.id);
  res.status(200).end();
});

export default router;
