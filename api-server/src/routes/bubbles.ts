/*Autor: Marvin Schulze Berge*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { Bubble } from '../models/bubble';

const router = express.Router();

router.get('/getAllBubbles', authService.authenticationMiddleware, async (req, res) => {
  try {
    const bubbleDAO: GenericDAO<Bubble> = req.app.locals.bubbleDAO;
    const bubbles = await bubbleDAO.findAll();
    res.status(200).json({ results: bubbles });
  } catch (error) {
    res.status(404).json({ message: 'Error fetching bubbles' });
  }
});

router.get('/getBubblesByParticipant', authService.authenticationMiddleware, async (req, res) => {
  try {
    const bubbleDAO: GenericDAO<Bubble> = req.app.locals.bubbleDAO;
    const bubbles = await bubbleDAO.findAll({ participants: { $in: [res.locals.user.id] } as never });
    res.status(200).json({ results: bubbles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bubbles' });
  }
});

router.post('/createBubble', authService.authenticationMiddleware, async (req, res) => {
  const bubbleDAO: GenericDAO<Bubble> = req.app.locals.bubbleDAO;
  const createdBubble: Bubble = await bubbleDAO.create({
    name: req.body.name,
    participants: [res.locals.user.id],
    image: req.body.image,
    description: req.body.description,
    interests: req.body.interests
  });
  res.status(201).json(createdBubble);
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const bubbleDAO: GenericDAO<Bubble> = req.app.locals.bubbleDAO;
  const bubble = await bubbleDAO.findOne({ id: req.params.id });
  if (!bubble) {
    res.status(204).json({ message: `No bubble exists with ID ${req.params.id}` });
  } else {
    res.status(200).json(bubble);
  }
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const bubbleDAO: GenericDAO<Bubble> = req.app.locals.bubbleDAO;
  await bubbleDAO.delete(req.params.id);
  res.status(200).end();
});

router.patch('/updateParticipants/:id', authService.authenticationMiddleware, async (req, res) => {
  const bubbleDAO: GenericDAO<Bubble> = req.app.locals.bubbleDAO;
  const bubble = await bubbleDAO.findOne({ id: req.params.id });
  const partialBubble: Partial<Bubble> = { id: req.params.id };

  if (bubble) {
    if (!bubble.participants.includes(res.locals.user.id)) {
      bubble.participants.push(res.locals.user.id);
      partialBubble.participants = bubble.participants;
      console.log('Participants: ' + bubble.participants);
      await bubbleDAO.update(partialBubble);
    }
  }

  res.status(200).end();
});

export default router;
