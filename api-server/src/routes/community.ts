/* Autor: Marvin Schulze Berge*/
import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/allUsers', authService.authenticationMiddleware, async (req, res) => {
  try {
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;
    const users = await userDAO.findAll();

    const decryptedUsers = users
      .filter(user => user.id !== res.locals.user.id)
      .map(user => {
        user.name = cryptoService.decrypt(user.name);
        user.lastname = cryptoService.decrypt(user.lastname);
        return user;
      });

    if (decryptedUsers.length > 0) {
      res.status(200).json({ results: decryptedUsers });
    } else {
      console.log('No users found');
      res.status(200).json({ results: users, message: 'No users found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
    console.log((error as Error).message);
  }
});

router.get('/getUser', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    res.status(404).json({ message: `There is no user with this ID: ${res.locals.user.id}` });
  } else {
    user.name = cryptoService.decrypt(user.name);
    user.lastname = cryptoService.decrypt(user.lastname);
    res.status(200).json(user);
  }
});

router.get('/getUsersByIds', authService.authenticationMiddleware, async (req, res) => {
  try {
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;
    const ids = req.query.ids as string;
    const idsArray = ids.split(',');

    const users = await userDAO.findAll({ id: { $in: idsArray } as never });
    const decryptedUsers = users.map(user => {
      user.name = cryptoService.decrypt(user.name as string);
      user.lastname = cryptoService.decrypt(user.lastname as string);
      return user;
    });

    res.json({ results: decryptedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/getUser/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: req.params.id });

  if (!user) {
    res.status(404).json({ message: `No user exists with ID ${req.params.id}` });
  } else {
    user.name = cryptoService.decrypt(user.name as string);
    user.lastname = cryptoService.decrypt(user.lastname as string);
    res.status(200).json(user);
  }
});

router.get('/getFriends', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  // Fetch the current user
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    return res.status(404).json({ message: `User not found` });
  }

  // Fetch the friends of the current user
  const friends = await userDAO.findAll({ id: { $in: user.friends } as never });

  const decryptedFriends = friends.map(user => {
    user.name = cryptoService.decrypt(user.name as string);
    user.lastname = cryptoService.decrypt(user.lastname as string);
    return user;
  });

  console.log(decryptedFriends);
  return res.json({ results: decryptedFriends });
});

export default router;
