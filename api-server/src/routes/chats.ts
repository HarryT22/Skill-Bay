/*Autor: Marvin Schulze Berge*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { Chat } from '../models/chat';

const router = express.Router();

router.post('/createChat', authService.authenticationMiddleware, async (req, res) => {
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  const createdChat: Chat = await chatDAO.create({
    participants: [res.locals.user.id, req.body.receiverId]
  });
  res.status(201).json(createdChat);
});

router.get('/getChatById/:id', authService.authenticationMiddleware, async (req, res) => {
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  const chat = await chatDAO.findOne({ id: req.params.id });
  if (!chat) {
    res.status(200).json({ chat, message: `No chat exists with ID ${req.params.id}` });
  } else {
    res.status(200).json(chat);
  }
});

router.get('/getChatsByParticipant', authService.authenticationMiddleware, async (req, res) => {
  try {
    const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
    const chats = await chatDAO.findAll({ participants: { $in: [res.locals.user.id] } as any });
    res.json({ results: chats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const chatDAO: GenericDAO<Chat> = req.app.locals.chatDAO;
  await chatDAO.delete(req.params.id);
  res.status(200).end();
});

export default router;
