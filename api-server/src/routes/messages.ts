/*Autor: Marvin Schulze Berge*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { Message } from '../models/message';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.post('/sendMessage', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  //const filter: Partial<Message> = { senderId: res.locals.user.id, receiverId: req.body.receiverId};
  const createdMessage: Message = await messageDAO.create({
    chatId: req.body.chatId,
    senderId: res.locals.user.id,
    receiverId: req.body.receiverId,
    text: cryptoService.encrypt(req.body.text)
  });
  res.status(201).json(createdMessage);
});

router.get('/getByChatId/:id', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  const messages = await messageDAO.findAll({ chatId: req.params.id });
  if (!messages) {
    res.status(404).json({ message: `No chats exists with chatId ${req.params.id}` });
  } else {
    const decryptedMessages = messages.map(message => {
      message.text = cryptoService.decrypt(message.text as string);
      return message;
    });
    res.json({ results: decryptedMessages });
  }
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const messageDAO: GenericDAO<Message> = req.app.locals.messageDAO;
  await messageDAO.delete(req.params.id);
  res.status(200).end();
});

export default router;
