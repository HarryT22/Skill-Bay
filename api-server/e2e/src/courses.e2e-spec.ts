/* Autor: Simon Guyon */
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import { Course } from '../../src/models/course.js';

interface User {
  id: string;
  name: string;
  lastname: string;
  verified: boolean;
  skills?: string[];
}

describe('/courses', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('/create', () => {
    it('should create a vaild course object', async () => {
      const now = new Date().getTime();
      const res = await userSession.post('/courses/create', {
        coursename: 'Kurs-e2e',
        difficulty: 'Moderate',
        tutor: '',
        students: '',
        startDate: '2023-09-09',
        price: '10',
        isActive: true,
        type: 'Asynchronous',
        categories: ['Vue.js', 'Angular', 'Express.js'],
        finishDate: null,
        maxParticipants: null,
        courseDay: null,
        courseTime: null
      });
      expect(res.status).to.equal(201);
      const json = (await res.json()) as Record<string, string>;
      expect(json.coursename).to.equal('Kurs-e2e');
      expect(json.difficulty).to.equal('Moderate');
      expect(json.price).to.equal('10');
      expect(json.isActive).to.equal(true);
      expect(json.type).to.equal('Asynchronous');
      expect(Number(json.createdAt)).to.be.greaterThanOrEqual(now);
      await userSession.delete(`/courses/${json.id}`);
    });
  });

  describe('/all', () => {
    it('should return all courses', async () => {
      const res1 = await userSession.get('/courses/all');
      expect(res1.status).to.equal(200);
      const json = (await res1.json()) as { results: Array<Course> };
      const beforeCreate = json.results.length;
      const res2 = await userSession.post('/courses/create', {
        coursename: 'Kurs-e2e',
        difficulty: 'Moderate',
        tutor: '',
        students: '',
        startDate: '2023-09-09',
        price: '10',
        isActive: true,
        type: 'Asynchronous',
        categories: ['Vue.js', 'Angular', 'Express.js'],
        finishDate: null,
        maxParticipants: null,
        courseDay: null,
        courseTime: null
      });
      const json2 = (await res2.json()) as Record<string, string>;
      const res3 = await userSession.get('/courses/all');
      expect(res3.status).to.equal(200);
      const json3 = (await res3.json()) as { results: Array<Course> };
      expect(json3.results.length).to.equal(beforeCreate + 1);
      await userSession.delete(`/courses/${json2.id}`);
    });
  });

  describe('/allActive', () => {
    it('should return all active courses', async () => {
      const res1 = await userSession.get('/courses/allActive');
      expect(res1.status).to.equal(200);
      const json = (await res1.json()) as { results: Array<Course> };
      const beforeCreate = json.results.length;
      const res2 = await userSession.post('/courses/create', {
        coursename: 'Kurs-e2e',
        difficulty: 'Moderate',
        tutor: '',
        students: '',
        startDate: '2023-09-09',
        price: '10',
        isActive: true,
        type: 'Synchronous',
        categories: ['Vue.js', 'Angular', 'Express.js'],
        finishDate: '2023-11-11',
        maxParticipants: '1',
        courseDay: 'Monday',
        courseTime: '14:00'
      });
      const json2 = (await res2.json()) as Record<string, string>;
      const res3 = await userSession.get('/courses/allActive');
      expect(res3.status).to.equal(200);
      const json3 = (await res3.json()) as { results: Array<Course> };
      expect(json3.results.length).to.equal(beforeCreate + 1);
      await userSession.delete(`/courses/${json2.id}`);
    });
  });

  describe('/joinCourse', () => {
    it('should not add a user to the course cause he is tutor', async () => {
      const res1 = await userSession.post('/courses/create', {
        coursename: 'Kurs-e2e',
        difficulty: 'Moderate',
        tutor: '',
        students: '',
        startDate: '2023-09-09',
        price: '10',
        isActive: true,
        type: 'Synchronous',
        categories: ['Vue.js', 'Angular', 'Express.js'],
        finishDate: '2023-11-11',
        maxParticipants: '1',
        courseDay: 'Monday',
        courseTime: '14:00'
      });
      const json = (await res1.json()) as Record<string, string>;
      const res2 = await userSession.post('/courses/joinCourse', { id: json.id });
      expect(res2.status).to.equal(400);
      await userSession.delete(`/courses/${json.id}`);
    });
  });
  describe('/myCourses', () => {
    it('should return 0 courses for a new user', async () => {
      const res = await userSession.get('/courses/myCourses');
      expect(res.status).to.equal(200);
      const json = (await res.json()) as { results: Array<Course> };
      expect(json.results.length).to.equal(0);
    });
  });

  describe('/myCurrentCourses', () => {
    it('should return all current courses for myCourse display', async () => {
      const res = await userSession.get('/courses/myCurrentCourses');
      expect(res.status).to.equal(200);
      const json = (await res.json()) as { results: Array<Course> };
      expect(json.results.length).to.equal(0);
    });
  });

  describe('/myTutorCourses', () => {
    it('should return all courses a user has created', async () => {
      const res = await userSession.get('/courses/myTutorCourses');
      expect(res.status).to.equal(200);
      const json = (await res.json()) as { results: Array<Course> };
      expect(json.results.length).to.equal(0);
    });
  });

  describe('/update/:id', () => {
    it('should update a given course by param courseId', async () => {
      const courseId = '80709d3a-f49d-48af-a00a-fe2a9e0adced';
      const res = await userSession.patch(`/courses/update/${courseId}`, {
        courseDay: 'Tuesday'
      });
      expect(res.status).to.equal(200);
    });
  });
});
