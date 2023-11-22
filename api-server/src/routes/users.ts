/* Autor: Annika Junge */
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email.service.js';
import { Interest } from '../models/interest.js';
import { Token } from '../models/token.js';
import fs from 'fs';
import { cryptoService } from '../services/crypto.service.js';
const router = express.Router();

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-_=()])[A-Za-z\d@$!%*#?&\-_=()]{8,}$/);
const stringRegex = new RegExp(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/);
const usernameRegex = new RegExp(/^.{4,}$/);

// create user
router.post('/sign-up', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
  const errors: string[] = [];
  const blacklist = fs.readFileSync(new URL('./passwordBlacklist.txt', import.meta.url), 'utf-8').split(/\r?\n/);
  const sendErrorMessage = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };
  //check the inputs
  if (
    !hasRequiredFields(
      req.body,
      [
        'name',
        'lastname',
        'username',
        'email',
        'highestDegree',
        'subject',
        'birthday',
        'type',
        'interests',
        'password',
        'passwordCheck'
      ],
      errors
    )
  ) {
    return sendErrorMessage(errors.join('\n'));
  }
  if (!passwordRegex.test(req.body.password)) {
    return sendErrorMessage('The password does not meet the requirements');
  }
  if (req.body.password !== req.body.passwordCheck) {
    return sendErrorMessage('The passwords do not match');
  }
  if (blacklist.includes(req.body.password)) {
    return sendErrorMessage('Your Password is not permitted');
  }
  if (!emailRegex.test(req.body.email)) {
    return sendErrorMessage('Please use a valide email adress!');
  }
  if (!stringRegex.test(req.body.name)) {
    return sendErrorMessage('Name has not allowed characters');
  }
  if (!stringRegex.test(req.body.lastname)) {
    return sendErrorMessage('Lastname has not allowed characters');
  }
  if (!usernameRegex.test(req.body.username)) {
    return sendErrorMessage('Username has not allowed characters or is to short');
  }

  // check if user is already 18
  const today = new Date();
  const birthday = new Date(req.body.birthday);
  const yearsDiff = today.getFullYear() - birthday.getFullYear();
  const isUnderage = yearsDiff < 18;
  if (isUnderage) {
    return sendErrorMessage('You must be at least 18 years old to sign up');
  }
  const username: Partial<User> = { username: req.body.username };
  if (await userDAO.findOne(username)) {
    return sendErrorMessage('The username already exists');
  }
  const filter: Partial<User> = { email: req.body.email };
  if (await userDAO.findOne(filter)) {
    return sendErrorMessage('An account already exists with the specified email address.');
  }

  // create the user
  const createdUser = await userDAO.create({
    name: cryptoService.encrypt(req.body.name),
    lastname: cryptoService.encrypt(req.body.lastname),
    username: req.body.username,
    email: req.body.email,
    birthday: req.body.birthday,
    image: req.body.image,
    highestDegree: req.body.highestDegree,
    type: req.body.type,
    subject: req.body.subject,
    interests: req.body.interests,
    skills: req.body.skills,
    friends: [''],
    password: await bcrypt.hash(req.body.password, 10),
    verified: false,
    contracts: [''],
    inquirys: [''],
    activated: false,
    courses: ['']
  });

  //check if user is verified for beeing a tutor
  if (
    createdUser.highestDegree !== 'No Degree' &&
    createdUser.highestDegree !== 'Graduation' &&
    createdUser.highestDegree !== 'other' &&
    createdUser.subject !== 'other'
  ) {
    createdUser.verified = true;
    console.log('user successfully verified!');
  } else {
    createdUser.verified = false;
    console.log('user not verified!');
  }
  await userDAO.update(createdUser);

  // testmodus
  if (req.app.locals.testmodus) {
    createdUser.activated = true;
    userDAO.update(createdUser);
    authService.createAndSetToken({ id: createdUser.id }, res);
    res.status(201).send({ message: 'user signed up and registered with test account!' });
  } else {
    //create a token for the created user
    const token = await tokenDAO.create({
      userId: createdUser.id,
      token: crypto.randomBytes(32).toString('hex'),
      validationCode: Math.floor(Math.random() * 900000) + 100000,
      email: createdUser.email
    });

    // send email to users email adress
    const message = `http://localhost:3000/api/users/verify/${createdUser.id}/${token.token}`;
    await emailService.sendEmail(
      createdUser.email,
      'Verify Email',
      'Dear customer, please verify your account with the following link: ' +
        message +
        ' Or Verify your email with this code: ' +
        token.validationCode
    );
    res.status(201).json({ message: 'We sent an email to your account. Please verify!', id: createdUser.id });
    console.log('user registered successful!');
  }
});

// user login
router.post('/sign-in', async (req, res) => {
  const sendErrorMessage = (message: string) => {
    res.status(400).json({ message });
  };
  const sendUnauthorizedMessage = (message: string) => {
    res.status(401).json({ message });
  };
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  // const filter: Partial<User> = { username: req.body.username };
  const errors: string[] = [];

  if (!hasRequiredFields(req.body, ['usernameOrEmail', 'password'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
    return;
  }
  const filter2: Partial<User> = {};
  if (emailRegex.test(req.body.usernameOrEmail)) {
    filter2.email = req.body.usernameOrEmail;
  } else {
    filter2.username = req.body.usernameOrEmail;
  }
  const user = await userDAO.findOne(filter2);
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    authService.removeToken(res);
    sendUnauthorizedMessage('Incorrect username or password.');
    return;
  }
  //check if user is activated --> already clicked on link in email
  if (user?.activated == false) {
    sendErrorMessage('Email address not verified yet.');
    return;
  }
  authService.createAndSetToken({ id: user.id }, res);
  res
    .status(201)
    .json({ ...user, name: cryptoService.decrypt(user.name), lastname: cryptoService.decrypt(user.lastname) });
});

// verify user
router.get('/verify/:id/:token', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
  try {
    const user = await userDAO.findOne({ id: req.params.id });
    if (!user) return res.status(400).send('Invalid link');
    const token = await tokenDAO.findOne({
      userId: user.id,
      token: req.params.token
    });
    if (!token) return res.status(400).send('Invalid link');
    await userDAO.update({ id: user.id, activated: true, email: token.email });
    await tokenDAO.delete(token.id);
    authService.createAndSetToken({ id: user.id }, res);
    const link = `http://localhost:8080/app/landingpage`;
    res.redirect(link);
  } catch (error) {
    res.status(400).send('An error occured');
  }
});

//code for email verification
router.patch('/verify/code', async (req, res) => {
  const sendErrorMessage = (message: string) => {
    res.status(400).json({ message });
  };
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
  const token = await tokenDAO.findOne({ userId: req.body.userId });
  if (!token) return res.status(400).send('Invalid link');
  if (token.validationCode === Number(req.body.validationCode)) {
    await userDAO.update({ id: req.body.userId, activated: true, email: token.email });
    await tokenDAO.delete(token.id);
    authService.createAndSetToken({ id: req.body.userId }, res);
    res.status(200).json({ message: 'Email confirmed sucessfully' });
  } else {
    return sendErrorMessage('Wrong code. Please try again');
  }
});

// user signed-in
router.get('/secure', authService.authenticationMiddleware, (req, res) => {
  res.status(200).send({ message: 'User is logged in' });
});

// user sign-out
router.delete('/sign-out', async (req, res) => {
  authService.removeToken(res);
  res.status(200).json({ message: 'sign out successful' });
});

//delete user and his data
router.delete('/delete-user', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  userDAO.delete(res.locals.user.id);
  authService.removeToken(res);
  res.status(200).json({ message: 'The user was deleted' });
});

// find all interests
router.get('/interests', async (req, res) => {
  const interestDAO: GenericDAO<Interest> = req.app.locals.interestDAO;
  const interests = await interestDAO.findAll();
  res.status(200).json(interests);
});

// find all friends of a user
router.get('/friends/name', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const friends: string[] = user?.friends || [];
  const friendList: { id: string; username: string; image: string }[] = [];

  for (const friendId of friends) {
    const friend = await userDAO.findOne({ id: friendId });
    const friendName = friend?.username || '';
    const profilePicture = friend?.image || '';
    friendList.push({ id: friendId, username: friendName, image: profilePicture });
  }

  res.status(200).json(friendList);
});

// change the current password of the user
router.patch('/change-password', authService.authenticationMiddleware, async (req, res) => {
  const sendErrorMessage = (message: string) => {
    res.status(400).json({ message });
  };
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const blacklist = fs.readFileSync(new URL('./passwordBlacklist.txt', import.meta.url), 'utf-8').split(/\r?\n/);
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return sendErrorMessage('The Currrent password is not correct.');
  }
  if (!passwordRegex.test(req.body.newPassword)) {
    return sendErrorMessage('The password does not meet the requirements');
  }
  if (blacklist.includes(req.body.newPassword)) {
    return sendErrorMessage('Your Password is not permitted');
  }
  if (req.body.newPassword !== req.body.passwordCheck) {
    return sendErrorMessage('The passwords are not matching');
  }
  const newPassword = await bcrypt.hash(req.body.newPassword, 10);
  await userDAO.update({ id: user.id, password: newPassword });
  res.status(201).json({ message: 'Changed password' });
});

// forgot password -> send the link to the users email adress
router.post('/reset-password', async (req, res) => {
  try {
    const userDAO: GenericDAO<User> = req.app.locals.userDAO;
    const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
    const errors: string[] = [];
    const sendErrorMessage = async (message: string) => {
      authService.removeToken(res);
      res.status(400).json({ message });
    };
    if (!hasRequiredFields(req.body, ['email'], errors)) {
      return sendErrorMessage('Please fill out every required field');
    }

    if (!emailRegex.test(req.body.email)) {
      return sendErrorMessage('Please use a valide email adress!');
    }
    const user = await userDAO.findOne({ email: req.body.email });
    if (!user) {
      return sendErrorMessage('There is no Account with this Email address');
    }
    //create token
    let token = await tokenDAO.findOne({ userId: user.id });
    if (!token) {
      token = await tokenDAO.create({
        userId: user.id,
        token: crypto.randomBytes(32).toString('hex'),
        // validationCode: Math.floor(Math.random() * 900000) + 100000,
        email: user.email
      });
    }
    const link = `http://localhost:3000/api/users/reset-password/${token.userId}/${token.token}`;
    //send email to user
    await emailService.sendEmail(
      user.email,
      'Verify Email',
      'Dear customer, please click on the link to reset your password: ' + link
    );
    res.json({ message: 'password reset link was sent to your email address' });
  } catch (error) {
    res.send('An error occured');
    console.log(error);
  }
});

// verify user for password reset
router.get('/reset-password/:id/:token', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
  try {
    const user = await userDAO.findOne({ id: req.params.id });
    if (!user) return res.status(400).send('Invalid link');
    const token = await tokenDAO.findOne({
      userId: user.id,
      token: req.params.token
    });
    if (!token) return res.status(400).send('Invalid link');
    const link = `http://localhost:8080/app/reset-password/${token.userId}/${token.token}`;
    res.redirect(link);
    // res.send({ message: 'User verified', redirectUrl: 'reset-password' });
    console.log('redirected');
  } catch (error) {
    res.status(400).send('An error occured');
  }
});

//actually reset the password
router.post('/reset-password/form', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
  const blacklist = fs.readFileSync(new URL('./passwordBlacklist.txt', import.meta.url), 'utf-8').split(/\r?\n/);
  const sendErrorMessage = async (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };
  try {
    const user = await userDAO.findOne({ id: req.body.id });
    if (!user) return res.status(400).send('Invalid link');
    const token = await tokenDAO.findOne({
      userId: user.id,
      token: req.body.token
    });
    if (!token) return res.status(400).send('Invalid link');
    if (!passwordRegex.test(req.body.password)) {
      return sendErrorMessage('The password does not meet the requirements');
    }
    if (req.body.password !== req.body.passwordCheck) {
      return sendErrorMessage('The passwords do not match');
    }
    if (blacklist.includes(req.body.password)) {
      return sendErrorMessage('Your Password is not permitted');
    }
    const newPassword = await bcrypt.hash(req.body.password, 10);
    await userDAO.update({ id: user.id, password: newPassword });
    await tokenDAO.delete(token.id);
    authService.createAndSetToken({ id: user.id }, res);
    res.json({ message: 'password changed successfull' });
  } catch (error) {
    res.status(400).send('An error occured');
  }
});

router.get('/email', authService.authenticationMiddleware, async (req, res) => {
  // const sendErrorMessage = (message: string) => {
  //   res.status(400).json({ message });
  // };
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    res.status(503).send('user is not in db');
  } else {
    res.status(200).json({ email: user.email });
    console.log('got user successful');
  }
});

//change the current email of a user
router.patch('/change-email', authService.authenticationMiddleware, async (req, res) => {
  const sendErrorMessage = (message: string) => {
    res.status(400).json({ message });
  };

  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tokenDAO: GenericDAO<Token> = req.app.locals.tokenDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) return sendErrorMessage('user is not in db');
  const errors: string[] = [];
  if (!hasRequiredFields(req.body, ['email'], errors)) {
    return sendErrorMessage('Please fill out every required field');
  }
  if (!emailRegex.test(req.body.email)) {
    return sendErrorMessage('Please use a valide email adress!');
  }
  const filter: Partial<User> = { email: req.body.email };
  if (await userDAO.findOne(filter)) {
    return sendErrorMessage('An account already exists with the specified email address.');
  }
  //create a token for the user to change the email
  const token = await tokenDAO.create({
    userId: user.id,
    token: crypto.randomBytes(32).toString('hex'),
    validationCode: Math.floor(Math.random() * 900000) + 100000,
    email: req.body.email
  });
  const message = `http://localhost:3000/api/users/verify/${user.id}/${token.token}`;
  await emailService.sendEmail(
    req.body.email,
    'Verify Email to Change your email adress',
    'Dear customer, please verify your account with the following link: ' +
      message +
      ' Or Verify your email with this code: ' +
      token.validationCode
  );
  res.status(201).json({ message: 'We sent an email to your account. Please verify!', id: user.id });
});

// update the user information
router.patch('/update-user', authService.authenticationMiddleware, async (req, res) => {
  const sendErrorMessage = (message: string) => {
    res.status(400).json({ message });
  };
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];
  const PartialUser: Partial<User> = { id: res.locals.user.id };

  if (!stringRegex.test(req.body.name)) {
    return sendErrorMessage('Name has not allowed characters');
  }
  if (!stringRegex.test(req.body.lastname)) {
    return sendErrorMessage('Lastname has not allowed characters');
  }
  if (req.body.name) {
    PartialUser.name = cryptoService.encrypt(req.body.name);
  }
  if (req.body.lastname) {
    PartialUser.lastname = cryptoService.encrypt(req.body.lastname);
  }
  if (req.body.highestDegree) {
    PartialUser.highestDegree = req.body.highestDegree;
  }
  if (req.body.type) {
    PartialUser.type = req.body.type;
  }
  if (req.body.subject) {
    PartialUser.subject = req.body.subject;
  }
  if (req.body.image) {
    PartialUser.image = req.body.image;
  }
  if (req.body.skills) {
    PartialUser.skills = req.body.skills;
  }
  if (req.body.interests) {
    PartialUser.interests = req.body.interests;
  }
  await userDAO.update(PartialUser);
  res.status(200).json({ message: 'Information updatet successful!' });
});

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' darf nicht leer sein.');
      hasErrors = true;
    }
  });
  return !hasErrors;
}

export default router;
