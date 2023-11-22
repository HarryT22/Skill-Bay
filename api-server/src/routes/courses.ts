/*Autor: Simon Guyon*/

import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { Course } from '../models/course';
import { User } from '../models/user';
import { Interest } from '../models/interest';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

//Get all courses including isActive = false for my courses
router.get('/all', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const courses = await courseDAO.findAll();
  courses.forEach(course => {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
  });
  res.json({ results: courses });
});

//Get all active courses for the course overview
router.get('/allActive', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const courses = await courseDAO.findAll({ isActive: true });
  courses.forEach(course => {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
  });
  res.json({ results: courses });
});

// Create a new course only for tutors
router.post('/create', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const userId = user?.id;
  const errors: string[] = [];
  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  console.log('Creating course...');
  const sendErrorMessage = (message: string) => {
    res.status(400).json({ message });
  };
  if (!hasRequiredFields(req.body, ['coursename', 'difficulty', 'startDate', 'price', 'type'], errors)) {
    return sendErrorMessage(errors.join('\n'));
  }
  const courseData = await courseDAO.create({
    coursename: cryptoService.encrypt(req.body.coursename),
    difficulty: req.body.difficulty,
    tutor: cryptoService.encrypt(userId!),
    students: [],
    startDate: new Date(req.body.startDate),
    finishDate: req.body.type === 'Synchronous' ? new Date(req.body.finishDate) : undefined,
    maxParticipants: req.body.type === 'Synchronous' ? parseInt(req.body.maxParticipants) : undefined,
    courseDay: req.body.type === 'Synchronous' ? req.body.courseDay : undefined,
    courseTime: req.body.type === 'Synchronous' ? req.body.courseTime : undefined,
    price: cryptoService.encrypt(req.body.price),
    type: req.body.type,
    isActive: true,
    categories: req.body.categories
  });

  res.status(201).json({
    ...courseData,
    coursename: cryptoService.decrypt(courseData.coursename),
    price: cryptoService.decrypt(courseData.price),
    tutor: cryptoService.decrypt(courseData.tutor)
  });
  console.log('The Course has successfully been created.');
});

//Get user skills for the course creation
router.get('/:id/skills', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (user) {
    res.status(200).json(user.skills);
    console.log('The user: ' + cryptoService.decrypt(user.name) + ' has the following skills: ' + user.skills);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

//Join a course, including constraints so that only viable users can join a course that is != full
router.post('/joinCourse', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const course = await courseDAO.findOne({ id: req.body.id });
  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  if (!course) {
    return res.status(404).json({ message: `Course not found with this ID: ${req.body.id}` });
  }
  if (cryptoService.decrypt(course.tutor) === user.id) {
    return res.status(400).json({ message: `As a tutor you can't enroll in your own course.` });
  }
  if (course.students.includes(user.id)) {
    return res.status(400).json({ message: `User already enrolled in this course.` });
  }
  if (
    course.type === 'Synchronous' &&
    course.maxParticipants !== undefined &&
    course.students.length >= course.maxParticipants
  ) {
    course.isActive = false;
    await courseDAO.update(course);
    return res.status(400).json({ message: `Course is full.` });
  }
  course.students.push(user.id);
  await courseDAO.update(course);
  user.courses.push(course.id);
  await userDAO.update(user);
  return res.status(201).json({ message: `Successfully joined the course.` });
});

//Used to find a course given the param courseId and checking for tutor
router.get('/display/:id', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const course = await courseDAO.findOne({ id: req.params.id });
  if (!course) {
    res.status(404).json({ message: `We couldn't find a course with this ID: ${req.params.id}` });
  } else {
    const tutor = await userDAO.findOne({ id: cryptoService.decrypt(course.tutor) });
    if (!tutor) {
      res
        .status(404)
        .json({ message: `We couldn't find a tutor with this ID: ${cryptoService.decrypt(course.tutor)}` });
    } else {
      const courseWithTutor = { ...course, tutor };
      courseWithTutor.coursename = cryptoService.decrypt(courseWithTutor.coursename);
      courseWithTutor.price = cryptoService.decrypt(courseWithTutor.price);
      res.status(200).json(courseWithTutor);
    }
  }
});

//Used to get course information by param courseId
router.get('/get/:id', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const course = await courseDAO.findOne({ id: req.params.id });
  if (!course) {
    res.status(404).json({ message: `There is no course with this ID: ${req.params.id}` });
  } else {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
    res.status(200).json(course);
  }
});

//Used to update a given course by param courseId
router.patch('/update/:id', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;

  const partialCourse: Partial<Course> = { id: req.params.id };
  if (req.body.categories) {
    partialCourse.categories = req.body.categories;
  }
  if (req.body.difficulty) {
    partialCourse.difficulty = req.body.difficulty;
  }
  if (req.body.price) {
    partialCourse.price = cryptoService.encrypt(req.body.price);
  }
  if (req.body.startDate) {
    partialCourse.startDate = req.body.startDate;
  }
  if (req.body.finishDate) {
    partialCourse.finishDate = req.body.finishDate;
  }
  if (req.body.maxParticipants) {
    partialCourse.maxParticipants = req.body.maxParticipants;
  }
  if (req.body.courseDay) {
    partialCourse.courseDay = req.body.courseDay;
  }
  if (req.body.courseTime) {
    partialCourse.courseTime = req.body.courseTime;
  }
  await courseDAO.update(partialCourse);
  res.status(200).end();
});

//Get the tutor name for the dialog component
router.get('/getTutorByCourseIDandUserID/:id', async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const course = await courseDAO.findOne({ id: req.params.id });
  if (!course) {
    return res.status(404).json({ message: `Course not found with this ID: ${req.params.id}` });
  }
  const decryptedTutorId = cryptoService.decrypt(course.tutor);
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const tutor = await userDAO.findOne({ id: decryptedTutorId });
  if (!tutor) {
    return res.status(404).json({ message: `There is no user with this ID: ${decryptedTutorId}` });
  }
  return res.status(200).json({
    name: cryptoService.decrypt(tutor.name),
    lastname: cryptoService.decrypt(tutor.lastname)
  });
});

//Get tutor id for a course so that the name is displayed
router.get('/courseTutor/:id', async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  const course = await courseDAO.findOne({ id: req.params.id });
  if (!course) {
    return res.status(404).json({ message: `Course not found with this ID: ${req.params.id}` });
  }

  const tutor = await userDAO.findOne({ id: cryptoService.decrypt(course.tutor) });
  if (!tutor) {
    return res.status(404).json({ message: `Tutor not found with this ID: ${cryptoService.decrypt(course.tutor)}` });
  }

  return res.status(200).json({ tutor });
});

//Used to fetch data for the edu-user-area
router.get('/myUser', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });

  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  const decryptedPartialUser = {
    id: user.id,
    name: cryptoService.decrypt(user.name),
    lastname: cryptoService.decrypt(user.lastname),
    verified: user.verified
  };

  res.status(200).json(decryptedPartialUser);
});

//Used to provide the course managment with the interest names --> for categoriesList
router.get('/interests', async (req, res) => {
  const interestDAO: GenericDAO<Interest> = req.app.locals.interestDAO;
  const interests = await interestDAO.findAll();
  const interestNames = interests.map(interest => interest.name);
  res.status(200).json(interestNames);
});

//Used to find all relevant courses for the SchedulerComponent --> only Synchronous courses for both user and tutor
router.get('/scheduler', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  const courses = await courseDAO.findAll();
  const relevantCourses = courses.filter(
    course =>
      (course.type === 'Synchronous' && course.students && course.students.includes(user.id)) ||
      (cryptoService.decrypt(course.tutor) && cryptoService.decrypt(course.tutor) === user.id)
  );
  relevantCourses.forEach(course => {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
  });

  res.status(200).json({ results: relevantCourses });
});

// Get all courses a user has joined --> used for myCourses Component all courses joined ever
router.get('/myCourses', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  const courses = await courseDAO.findAll();
  const myCourses = courses.filter(course => course.students && course.students.includes(user.id));
  myCourses.forEach(course => {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
  });
  res.status(200).json({ results: myCourses });
});

// Get all current courses for myCourse display --> current meaning all that have a finishDate that is not reached yet
router.get('/myCurrentCourses', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  const courses = await courseDAO.findAll();
  const myCurrentCourses = courses.filter(
    course =>
      course.students &&
      course.students.includes(user.id) &&
      course.finishDate &&
      new Date(course.finishDate) > new Date()
  );
  myCurrentCourses.forEach(course => {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
  });
  res.status(200).json({ results: myCurrentCourses });
});

// Get all courses a user has created --> for myCourses view so that tutors can see their courses too
router.get('/myTutorCourses', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    return res.status(404).json({ message: `User not found with this ID: ${res.locals.user.id}` });
  }
  const courses = await courseDAO.findAll();
  const myTutorCourses = courses.filter(
    course => cryptoService.decrypt(course.tutor) && cryptoService.decrypt(course.tutor) === user.id
  );
  myTutorCourses.forEach(course => {
    course.coursename = cryptoService.decrypt(course.coursename);
    course.price = cryptoService.decrypt(course.price);
    course.tutor = cryptoService.decrypt(course.tutor);
  });
  res.status(200).json({ results: myTutorCourses });
});

// If a user wishes to leave a course this endpoint is triggered
router.delete('/deleteByUser/:id', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  const course = await courseDAO.findOne({ id: req.params.id });
  if (!user || !course) {
    return res.status(404).json({ message: `User or Course not found.` });
  }
  course.students = course.students.filter(studentId => studentId !== user.id);
  if (
    course.finishDate &&
    new Date(course.finishDate) > new Date() &&
    course.type === 'Synchronous' &&
    !course.isActive
  ) {
    course.isActive = true;
  }
  await courseDAO.update(course);
  user.courses = user.courses.filter(courseId => courseId !== req.params.id);
  await userDAO.update(user);
  res.status(200).json({ message: `User removed from the course successfully.` });
});

// If the tutor deletes a course the course will be ereased from the entire db course as well as all entries in the user.courses array
router.delete('/deleteByTutor/:id', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const course = await courseDAO.findOne({ id: req.params.id });
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!course) {
    return res.status(404).json({ message: `Course not found with this ID: ${req.params.id}` });
  }
  const decryptedTutorId = cryptoService.decrypt(course.tutor);
  if (!decryptedTutorId || user?.id !== decryptedTutorId) {
    return res.status(403).json({ message: `You are not authorized to delete this course` });
  }
  const users = await userDAO.findAll();
  for (const user of users) {
    if (user.courses && user.courses.includes(req.params.id)) {
      user.courses = user.courses.filter(courseId => courseId !== req.params.id);
      await userDAO.update(user);
    }
  }
  await courseDAO.delete(req.params.id);
  res.status(200).json({ message: `Course deleted successfully.` });
});

// Delete a course by its ID
router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const courseDAO: GenericDAO<Course> = req.app.locals.courseDAO;
  const course = await courseDAO.findOne({ id: req.params.id });
  if (!course) {
    return res.status(404).json({ message: `Course not found with this ID: ${req.params.id}` });
  }
  await courseDAO.delete(req.params.id);
  res.status(200).json({ message: `Course deleted successfully.` });
});
function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + `shouldn't be empty.`);
      hasErrors = true;
    }
  });
  return !hasErrors;
}

export default router;
