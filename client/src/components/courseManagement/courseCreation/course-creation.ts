/* Autor: Simon Guyon */
import { customElement, property, query } from 'lit/decorators.js';
import { LitElement, html } from 'lit';
import { PageMixin } from '../../page.mixin';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './course-creation.css?inline';

type FieldKey = 'finishDate' | 'maxParticipants' | 'courseDay' | 'courseTime';

@customElement('app-course-create')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseCreationComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() private courseType = 'Asynchronous';

  @query('form') private form!: HTMLFormElement;

  @query('#coursename') private coursename!: HTMLInputElement;

  @query('#difficulty') private difficulty!: HTMLSelectElement;

  @query('#startDate') private startDate!: HTMLInputElement;

  @query('#finishDate') private finishDate!: HTMLInputElement;

  @query('#maxParticipants') private maxParticipants!: HTMLInputElement;

  @query('#price') private price!: HTMLInputElement;

  @query('#type') private type!: HTMLSelectElement;

  @query('#courseDay') private courseDay!: HTMLSelectElement;

  @query('#courseTime') private courseTime!: HTMLInputElement;

  @property() private categories: string[] = [];
  private selectedCategories: string[] = [];

  private errorMessageMap: { [key: string]: string } = {
    finishDate: 'Finish date is required.',
    maxParticipants: 'Max participants is required and must be a number.',
    courseDay: 'Course day is required.',
    courseTime: 'Course time is required.'
  };

  async firstUpdated() {
    this.fetchUserSkills();
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Course registration:</h1>
      <h4>Please note: You can only hold courses that are whitin your skills.</h4>
      <p>If you would like to extend your skills, <a href="/change-details">click here</a>.</p>
      <form novalidate>
        <div>
          <label for="coursename">Coursename:</label>
          <input type="text" autofocus required id="coursename" maxlength="50" />
          <div class="invalid-feedback">Required input, please fill in.</div>
        </div>
        <div>
          <label for="difficulty">Difficulty:</label>
          <select id="difficulty" required>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label for="type">Type:</label>
          <select id="type" required @change="${this.handleTypeChange}">
            <option value="Asynchronous" title="Self-paced course." ?selected="${this.courseType === 'Asynchronous'}">
              Asynchronous
            </option>
            <option value="Synchronous" title="Live video course." ?selected="${this.courseType === 'Synchronous'}">
              Synchronous
            </option>
          </select>
          <p class="info-text">
            <strong>Asynchronous:</strong> Self-paced course.<br />
            <strong>Synchronous:</strong> Live video course.
          </p>
        </div>
        <div>
          <label>Choose course categories:</label>
          ${this.categories.map(category => {
            const isSelected = this.selectedCategories.includes(category);
            return html`
              <div
                class="category ${isSelected ? 'selected' : ''}"
                @click=${() => {
                  if (isSelected) {
                    this.selectedCategories = this.selectedCategories.filter(c => c !== category);
                  } else {
                    this.selectedCategories = [...this.selectedCategories, category];
                  }
                  this.requestUpdate();
                }}
              >
                ${category}
              </div>
            `;
          })}
        </div>
        <div>
          <label for="startDate">Start date:</label>
          <input type="date" required id="startDate" />
        </div>
        <div>
          <label for="price">Price:</label>
          <input type="number" required id="price" maxlength="4" step="0.01" placeholder="0.00" />
        </div>
        <div id="hidden" class="${this.courseType === 'Synchronous' ? '' : 'hidden'}">
          <div>
            <label for="courseDay">Course Day:</label>
            <select id="courseDay">
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div>
            <label for="courseTime">Course Time:</label>
            <input type="time" id="courseTime" min="07:00" max="21:00" />
          </div>
          <div>
            <label for="finishDate">Finish date:</label>
            <input type="date" id="finishDate" />
          </div>
          <div>
            <label for="maxParticipants">Max Participants:</label>
            <input type="number" id="maxParticipants" />
          </div>
        </div>
        <div>
          <button id="submit" type="button" @click="${this.submit}">Create course</button>
          <button id="delete" type="button" @click="${this.deleteInput}">Delete input</button>
        </div>
      </form>
    `;
  }

  async deleteInput() {
    this.form.reset();
  }

  toggleCategory(categories: string) {
    if (this.selectedCategories.includes(categories)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== categories);
    } else {
      this.selectedCategories.push(categories);
    }
    this.requestUpdate();
  }

  async fetchUserSkills() {
    try {
      const response = await httpClient.get('courses/${this.id}/skills');
      const skills = await response.json();
      this.categories = skills;
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async handleTypeChange(event: Event) {
    this.courseType = (event.target as HTMLSelectElement).value;
  }
  async submit() {
    if (await this.isFormValid()) {
      const courseData = {
        coursename: this.coursename.value,
        difficulty: this.difficulty.value,
        startDate: this.startDate.value,
        finishDate: this.type.value === 'Synchronous' ? this.finishDate.value : undefined,
        maxParticipants: this.type.value === 'Synchronous' ? this.maxParticipants.value : undefined,
        price: this.price.value,
        type: this.type.value,
        courseDay: this.type.value === 'Synchronous' ? this.courseDay.value : undefined,
        courseTime: this.type.value === 'Synchronous' ? this.courseTime.value : undefined,
        categories: this.selectedCategories
      };
      try {
        await httpClient.post('courses/create', courseData);
        router.navigate('/edu/my-edu-area');
      } catch (e) {
        if ((e as { statusCode: number }).statusCode === 401) {
          router.navigate('sign-in');
        } else {
          this.showNotification((e as Error).message, 'error');
        }
      }
    } else {
      this.form.classList.add('was-validated');
      this.showInvalidFields();
    }
  }

  async isFormValid() {
    let isValid = true;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const startDate = new Date(this.startDate.value);
    const finishDate = new Date(this.finishDate.value);

    if (!this.startDate.value || startDate < currentDate) {
      this.startDate.setCustomValidity('Start date is required and cannot be in the past.');
      isValid = false;
    } else {
      this.startDate.setCustomValidity('');
    }
    this.startDate.reportValidity();

    if (this.type.value === 'Synchronous') {
      if (!this.finishDate.value || finishDate < startDate) {
        this.finishDate.setCustomValidity(
          'Finish date is required for synchronous courses and cannot be before the start date.'
        );
        isValid = false;
      } else {
        const sixMonthsLater = new Date(startDate.getTime());
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

        if (finishDate > sixMonthsLater) {
          this.finishDate.setCustomValidity(
            'Finish date for a synchronous course must be within six months of the start date.'
          );
          isValid = false;
        } else {
          this.finishDate.setCustomValidity('');
        }
      }
    } else {
      this.finishDate.setCustomValidity('');
    }
    this.finishDate.reportValidity();

    if (Number(this.price.value) <= 0) {
      this.price.setCustomValidity('Price must be greater than 0');
      isValid = false;
    } else {
      this.price.setCustomValidity('');
    }
    this.price.reportValidity();

    if (this.type.value === 'Synchronous') {
      const fields: FieldKey[] = ['finishDate', 'maxParticipants', 'courseDay', 'courseTime'];

      for (const field of fields) {
        const element = this[field] as HTMLInputElement;
        if (element.value === '' || (field === 'maxParticipants' && isNaN(parseInt(element.value)))) {
          element.setCustomValidity(this.errorMessageMap[field]);
          element.classList.add('is-invalid');
          isValid = false;
        } else {
          element.setCustomValidity('');
          element.classList.remove('is-invalid');
        }
        element.reportValidity();
      }
    }

    this.requestUpdate();
    return isValid;
  }

  async showInvalidFields() {
    const elements = this.form.querySelectorAll('input, select');
    elements.forEach(element => {
      const inputElement = element as HTMLInputElement;
      if (!inputElement.validity.valid) {
        inputElement.classList.add('is-invalid');
      }
    });
  }
}
