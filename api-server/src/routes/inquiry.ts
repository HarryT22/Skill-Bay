/*Autor: Harry Thünte*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service.js';
import { Inquiry } from '../models/inquiry';
import { cryptoService } from '../services/crypto.service.js';
import { User } from '../models/user';

const router = express.Router();

router.post('/create', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;
  console.log('started inquirys create');
  const createdInquiry = await inquiryDAO.create({
    userId: res.locals.user.id,
    title: cryptoService.encrypt(req.body.title),
    skills: cryptoService.encrypt(req.body.skills),
    payEstimate: req.body.payEstimate,
    language: req.body.language
  });
  res.status(201).json({
    ...createdInquiry,
    title: cryptoService.decrypt(createdInquiry.title),
    skills: cryptoService.decrypt(createdInquiry.skills)
  });
});

router.get('/all', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;
  console.log('in get all');
  const inquirys = (await inquiryDAO.findAll()).map(inquiry => {
    return {
      ...inquiry,
      title: cryptoService.decrypt(inquiry.title),
      skills: cryptoService.decrypt(inquiry.skills)
    };
  });
  res.json({ results: inquirys });
});

router.get('/personal', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;
  const filter: Partial<Inquiry> = { userId: res.locals.user.id };
  console.log('personal inquiry');

  const inquirys = (await inquiryDAO.findAll(filter)).map(inquiry => {
    return { ...inquiry, title: cryptoService.decrypt(inquiry.title), skills: cryptoService.decrypt(inquiry.skills) };
  });
  res.json({ results: inquirys });
});

router.get('/get/:id', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;
  const inquiry = await inquiryDAO.findOne({ id: req.params.id });
  if (!inquiry) {
    res.status(404).json({ message: `There is no inquiry with this ID: ${req.params.id}` });
  } else {
    res
      .status(200)
      .json({ ...inquiry, title: cryptoService.decrypt(inquiry.title), skills: cryptoService.decrypt(inquiry.skills) });
  }
});

router.patch('/update/:id', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;

  const partialInquiry: Partial<Inquiry> = { id: req.params.id };
  if (req.body.title) {
    partialInquiry.title = cryptoService.encrypt(req.body.title);
  }
  if (req.body.skills) {
    partialInquiry.skills = cryptoService.encrypt(req.body.skills);
  }
  if (req.body.payEstimate) {
    partialInquiry.payEstimate = req.body.payEstimate;
  }
  if (req.body.language) {
    partialInquiry.language = req.body.language;
  }
  await inquiryDAO.update(partialInquiry);
  res.status(200).end();
});

router.delete('/delete/:id', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;
  await inquiryDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/bookings', authService.authenticationMiddleware, async (req, res) => {
  const inquiryDAO: GenericDAO<Inquiry> = req.app.locals.inquiryDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  console.log('in bookings');
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const userInquirys = user?.inquirys;
  const result = [];
  if (userInquirys?.length === 0) {
    res.status(404).json({ message: `You have no booked inquirys` });
  } else {
    for (const e in userInquirys) {
      const temp1 = parseInt(e);
      const partial: Partial<Inquiry> = { id: userInquirys[temp1] };
      const temp = await inquiryDAO.findOne(partial);
      if (temp) {
        result.push(temp);
      }
    }
    const inquirys = result.map(inquiry => {
      return {
        ...inquiry,
        title: cryptoService.decrypt(inquiry.title)
      };
    });
    res.json({ results: inquirys });
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
  const temp = user?.inquirys;
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
    partialUser.inquirys = temp;
    userDAO.update(partialUser);
    res.status(200).end();
  }
});

export default router;
