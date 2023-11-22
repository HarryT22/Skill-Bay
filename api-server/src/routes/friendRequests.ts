/*Autor: Marvin Schulze Berge*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { FriendRequest } from '../models/friendRequest';
import { User } from '../models/user';

const router = express.Router();

router.post('/sendFriendRequest', authService.authenticationMiddleware, async (req, res) => {
  const friendRequestDAO: GenericDAO<FriendRequest> = req.app.locals.friendRequestDAO;
  const createdFriendRequest: FriendRequest = await friendRequestDAO.create({
    senderId: res.locals.user.id,
    receiverId: req.body.receiverId
  });
  res.status(201).json(createdFriendRequest);
});

router.get('/getFriendRequestByReceiverAndSender', authService.authenticationMiddleware, async (req, res) => {
  if (req.query.receiverId == res.locals.user.id) {
    console.log('ReceiverID cant be UserID');
    res.status(400).json({ message: 'ReceiverID cant be UserID' });
  } else {
    try {
      const friendRequestDAO: GenericDAO<FriendRequest> = req.app.locals.friendRequestDAO;
      const friendRequests = await friendRequestDAO.findAll({
        receiverId: req.query.receiverId as string,
        senderId: res.locals.user.id as string
      });
      res.status(200).json({ results: friendRequests });
    } catch (error) {
      res.status(404).json({ message: 'Error fetching friendRequests' });
    }
  }
});

router.get('/getFriendRequests', authService.authenticationMiddleware, async (req, res) => {
  try {
    const friendRequestDAO: GenericDAO<FriendRequest> = req.app.locals.friendRequestDAO;
    const filter: Partial<FriendRequest> = { receiverId: res.locals.user.id };
    const friendRequests = await friendRequestDAO.findAll(filter);
    res.status(200).json({ results: friendRequests });
  } catch (error) {
    res.status(404).json({ message: 'Error fetching friendRequests' });
  }
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const friendRequestDAO: GenericDAO<FriendRequest> = req.app.locals.friendRequestDAO;
  await friendRequestDAO.delete(req.params.id);
  res.status(200).end();
});

router.delete('/acceptFriendRequest/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const friendRequestDAO: GenericDAO<FriendRequest> = req.app.locals.friendRequestDAO;
  const friendRequestId = req.params.id;

  // Fetch the friend request
  const friendRequest = await friendRequestDAO.findOne({ id: friendRequestId });
  if (!friendRequest) {
    return res.status(404).json({ message: `Friend request not found` });
  }

  // Fetch the sender and receiver
  const sender = await userDAO.findOne({ id: friendRequest.senderId });
  const receiver = await userDAO.findOne({ id: friendRequest.receiverId });
  if (!sender || !receiver) {
    return res.status(404).json({ message: `User not found` });
  }

  // Add each user to the other's friends list
  sender.friends = sender.friends || [];
  sender.friends.push(receiver.id);
  receiver.friends = receiver.friends || [];
  receiver.friends.push(sender.id);

  // Save the updated users
  const updatedSender = await userDAO.update(sender);
  const updatedReceiver = await userDAO.update(receiver);

  // Optionally, delete the friend request
  await friendRequestDAO.delete(friendRequestId);

  return res.status(200).json({ sender: updatedSender, receiver: updatedReceiver });
});

export default router;
