/* Autor: Simon Guyon */
import { LitElement, html } from 'lit';
import { PageMixin } from '../../page.mixin';
import { customElement, property } from 'lit/decorators.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './course-dialog.css?inline';

interface Course {
  id: string;
  coursename: string;
  difficulty: Difficulty;
  tutor: string;
  startDate: Date;
  finishDate: Date;
  maxParticipants: number;
  price: string;
  type: 'Synchronous' | 'Asynchronous';
  courseDay: string;
  courseTime: string;
  categories: string[];
}

enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Advanced = 'Advanced'
}

interface User {
  id: string;
  name: string;
  lastname: string;
}
@customElement('app-course-dialog')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseDialogComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() courseId!: string;
  @property() user!: User;
  @property() course!: Course;
  @property() tutorName!: string;
  @property() errorMessage = '';
  @property() successMessage = '';

  async updated(changedProperties: any) {
    if (changedProperties.has('course') && this.course) {
      try {
        this.startAsyncInit();
        const response = await httpClient.get('/courses/getTutorByCourseIDandUserID/' + this.course.id);
        const tutor = await response.json();
        this.tutorName = `${tutor.name} ${tutor.lastname}`;
        const successMessage = sessionStorage.getItem('successMessage');
        if (successMessage) {
          this.showNotification(successMessage, 'info');
          sessionStorage.removeItem('successMessage');
        }
      } catch (e) {
        if ((e as { statusCode: number }).statusCode === 401) {
          router.navigate('sign-in');
        } else {
          this.showNotification((e as Error).message, 'error');
        }
      } finally {
        this.finishAsyncInit();
      }
    }
  }
  async joinCourse() {
    const courseData = {
      id: this.course.id
    };
    httpClient
      .post('/courses/joinCourse', courseData)
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          if (data.message === 'Successfully joined the course.') {
            this.successMessage = data.message;
            this.errorMessage = '';
          } else {
            this.errorMessage = data.message;
            this.successMessage = '';
          }
        } else {
          router.navigate('/edu/my-edu-area');
        }
      })
      .catch(e => {
        this.errorMessage = (e as Error).message;
        this.successMessage = '';
      });
  }

  render() {
    const startDate = new Date(this.course?.startDate);
    const finishDate = new Date(this.course?.finishDate);
    const formattedStartDate = startDate.toLocaleDateString('en-US');
    const formattedFinishDate = finishDate.toLocaleDateString('en-US');
    return html`
      <div class="dialog-content">
        <span @click="${this.close}" class="close-button">&times;</span>
        <h1>${this.course?.coursename}</h1>
        <div id="category">
          <h3>Languages and skills used:</h3>
          <p>${this.course?.categories.join(', ')}</p>
        </div>
        <div id="tutor">
          <h3>Tutor:</h3>
          <p>${this.tutorName}</p>
        </div>
        <div id="difficulty">
          <h3>Difficulty:</h3>
          <p>${this.course?.difficulty}</p>
        </div>
        <div id="price">
          <h3>Price:</h3>
          <p>${this.course?.price} €</p>
        </div>
        <div id="startDate">
          <h3>Start date:</h3>
          <p>${formattedStartDate}</p>
        </div>
        ${this.course?.type === 'Synchronous'
          ? html`
              <div id="finishDate">
                <h3>Finish date:</h3>
                <p>${formattedFinishDate || ''}</p>
              </div>
              <div id="maxParticipants">
                <h3>Maximum participants:</h3>
                <p>${this.course?.maxParticipants || ''}</p>
              </div>
              <div id="courseDay">
                <h3>Course day:</h3>
                <p>${this.course?.courseDay || ''}</p>
              </div>
              <div id="courseTime">
                <h3>Course time:</h3>
                <p>${this.course?.courseTime || ''}</p>
              </div>
            `
          : ''}
        <button class="join-button" @click="${this.joinCourse}">Join</button>
        ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ''}
        ${this.successMessage ? html`<div class="success-message">${this.successMessage}</div>` : ''}
      </div>
    `;
  }

  async open() {
    this.style.display = 'block';
  }

  async close() {
    this.style.display = 'none';
    this.errorMessage = '';
    this.successMessage = '';
  }
}
