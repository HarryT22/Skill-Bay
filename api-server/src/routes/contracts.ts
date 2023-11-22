/*Autor: Harry Thünte*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { Contract } from '../models/contract';
import { cryptoService } from '../services/crypto.service.js';
import { User } from '../models/user.js';

const router = express.Router();

router.post('/create', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  console.log('started contract create');
  const createdContract = await contractDAO.create({
    userId: res.locals.user.id,
    title: cryptoService.encrypt(req.body.title),
    requirements: cryptoService.encrypt(req.body.requirements),
    budgetMin: req.body.budgetMin,
    budgetMax: req.body.budgetMax,
    language: req.body.language,
    deadline: req.body.deadline
  });
  res.status(201).json({
    ...createdContract,
    title: cryptoService.decrypt(createdContract.title),
    requirements: cryptoService.decrypt(createdContract.requirements)
  });
});

router.get('/all', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  console.log('in get all');
  const contracts = (await contractDAO.findAll()).map(contract => {
    return {
      ...contract,
      title: cryptoService.decrypt(contract.title),
      requirements: cryptoService.decrypt(req.body.requirements)
    };
  });
  res.json({ results: contracts });
});

router.get('/personal', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  const filter: Partial<Contract> = { userId: res.locals.user.id };
  console.log('personal contracts');
  const contracts = (await contractDAO.findAll(filter)).map(contract => {
    return {
      ...contract,
      title: cryptoService.decrypt(contract.title),
      requirements: cryptoService.decrypt(contract.requirements)
    };
  });
  res.json({ results: contracts });
});

router.get('/get/:id', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  const contract = await contractDAO.findOne({ id: req.params.id });
  console.log('in get id');
  if (!contract) {
    res.status(404).json({ message: `There is no contract with this ID: ${req.params.id}` });
  } else {
    res.status(200).json({
      ...contract,
      title: cryptoService.decrypt(contract.title),
      requirements: cryptoService.decrypt(contract.requirements)
    });
  }
});

router.patch('/update/:id', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  console.log('update received');
  const partialContract: Partial<Contract> = { id: req.params.id };

  const contract = await contractDAO.findOne({ id: req.params.id });
  if (!contract) {
    res.status(404).json({ message: `There is no contract with this ID: ${req.params.id}` });
  } else {
    if (res.locals.user.id != contract?.userId) {
      res.status(401).end();
    }
  }

  if (cryptoService.encrypt(req.body.title)) {
    partialContract.title = cryptoService.encrypt(req.body.title);
  }
  if (cryptoService.encrypt(req.body.requirements)) {
    partialContract.requirements = cryptoService.encrypt(req.body.requirements);
  }
  if (req.body.budgetMin) {
    partialContract.budgetMin = req.body.budgetMin;
  }
  if (req.body.budgetMax) {
    partialContract.budgetMax = req.body.budgetMax;
  }
  if (req.body.language) {
    partialContract.language = req.body.language;
  }
  if (req.body.deadline) {
    partialContract.deadline = req.body.deadline;
  }

  await contractDAO.update(partialContract);
  res.status(200).end();
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  console.log('in delete id:' + req.params.id);
  const contract = await contractDAO.findOne({ id: req.params.id });
  if (!contract) {
    res.status(404).json({ message: `There is no contract with this ID: ${req.params.id}` });
  } else {
    if (res.locals.user.id == contract?.userId) {
      await contractDAO.delete(req.params.id);
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  }
});

router.get('/bookings', authService.authenticationMiddleware, async (req, res) => {
  const contractDAO: GenericDAO<Contract> = req.app.locals.contractDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  console.log('in bookings');
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const userContracts = user?.contracts;
  const result = [];
  if (userContracts?.length === 0) {
    res.status(404).json({ message: `You have no booked contracts` });
  } else {
    for (const e in userContracts) {
      const temp1 = parseInt(e);
      const partial: Partial<Contract> = { id: userContracts[temp1] };
      const temp = await contractDAO.findOne(partial);
      if (temp) {
        result.push(temp);
      }
    }
    const contracts = result.map(contract => {
      return {
        ...contract,
        title: cryptoService.decrypt(contract.title)
      };
    });
    res.json({ results: contracts });
  }
});

router.post('/addBookings', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const partialUser: Partial<User> = { id: res.locals.user.id };
  let a = false;
  console.log('booking add');
  if (!user) {
    res.status(404).json({ message: `There is no user with this ID: ${res.locals.user.id}` });
  }
  const temp = user?.contracts;
  for (const e in temp) {
    const temp1 = parseInt(e);
    if (temp[temp1] == req.body.id) {
      a = true;
      break;
    }
  }
  if (a == true) {
    res.status(404).json({ message: `You cannot book the same thing twice.` });
  } else {
    temp?.push(req.body.id);
    partialUser.contracts = temp;
    userDAO.update(partialUser);
    res.status(200).end();
  }
});

export default router;
