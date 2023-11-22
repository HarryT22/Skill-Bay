/* Autor: Annika Junge */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';
const router = express.Router();

router.get('/user', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    res.status(503).send('user is not in db');
  } else {
    res.status(201).json({
      ...user,
      name: cryptoService.decrypt(user.name),
      lastname: cryptoService.decrypt(user.lastname)
    });
    console.log('got user successful');
  }
});

router.get('/friend/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: req.params.id });
  if (!user) {
    res.status(503).send('user does not exist');
  } else {
    res.status(201).json({
      ...user,
      name: cryptoService.decrypt(user.name),
      lastname: cryptoService.decrypt(user.lastname)
    });
    console.log('got user successful');
  }
});
export default router;
