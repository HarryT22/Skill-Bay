/* Autor: Simon Guyon */
import { LitElement, html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { PageMixin } from '../../page.mixin';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './course-overview.css?inline';

interface Course {
  id: string;
  coursename: string;
  difficulty: Difficulty;
  maxParticipants: number;
  price: string;
  startDate: string;
  finishDate: string;
  type: 'Synchronous' | 'Asynchronous';
  courseDay: string;
  courseTime: string;
  categories: [];
}

enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Advanced = 'Advanced'
}
@customElement('app-course-overview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CourseOverviewComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private courses: Course[] = [];
  @state() private filteredCourses: Course[] = [];
  @state() private categoriesList: string[] = [];

  @query('#search') private searchElement!: HTMLInputElement;
  @query('#type') private typeElement!: HTMLSelectElement;
  @query('#difficulty') private difficultyElement!: HTMLSelectElement;
  @query('#maxPrice') private maxPriceElement!: HTMLInputElement;
  @query('#categories') private categoriesElement!: HTMLDivElement;
  @query('app-course-dialog') private courseDialog!: any;

  @state() private showCategories = false;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/courses/allActive');
      this.courses = (await response.json()).results;
      this.filteredCourses = this.courses;
      const response2 = await httpClient.get('/courses/interests');
      this.categoriesList = await response2.json();
      this.enterKeyListener();
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  render() {
    return html`
      <h1>Explore our courses and become the next master in ... 🔍 :</h1>
      <div class="filter">
        <div class="search-row">
          <input type="text" id="search" maxlength="50" placeholder="Search courses..." />
        </div>
        <div class="button-row">
          <button type="button" id="searchbutton" @click="${this.filterCourses}">🔍 Filter courses</button>
          <button type="button" id="clearbutton" @click="${this.clearFilters}">✕ Clear all filters</button>
          <button type="button" id="catbutton" @click="${() => (this.showCategories = !this.showCategories)}">
            ${this.showCategories ? ' ▲ Hide' : '▼ Open'} category filter
          </button>
        </div>
        <div class="filter-row">
          <select id="type">
            <option value="">All types</option>
            <option value="Synchronous">Synchronous</option>
            <option value="Asynchronous">Asynchronous</option>
          </select>
          <select id="difficulty">
            <option value="">All difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <input type="number" id="maxPrice" placeholder="Maximum price in €" />
        </div>
        ${this.showCategories
          ? html`
              <div id="categories" class="category-row">
                ${this.categoriesList.map(
                  category => html`
                    <label>
                      <input type="checkbox" value="${category}" @change="${this.filterCourses}" />
                      ${category}
                    </label>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
      <div class="disclaimer">
        <p>To view more details about a course, please click on the corresponding course name.</p>
      </div>
      <div class="courses">
        ${this.filteredCourses.length > 0
          ? repeat(
              this.filteredCourses,
              course => course.id,
              course => html`
                <div class="course-tile">
                  <app-course
                    .startDate=${course.startDate}
                    price=${course.price}
                    @appcourseclick=${() => this.displayCourse(course.id)}
                  >
                    <span slot="coursename">${course.coursename}</span>
                  </app-course>
                </div>
              `
            )
          : html`<div class="empty-message">No courses found for the selected filters, please wait .</div>`}
      </div>
      <app-course-dialog></app-course-dialog>
    `;
  }

  async displayCourse(id: string) {
    try {
      const response = await httpClient.get('/courses/display/' + id);
      this.courseDialog.course = await response.json();
      this.courseDialog.open();
    } catch (e) {
      console.error((e as Error).message, 'error');
    }
  }
  async enterKeyListener() {
    this.searchElement.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        this.filterCourses();
      }
    });
    this.typeElement.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        this.filterCourses();
      }
    });
    this.difficultyElement.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        this.filterCourses();
      }
    });
    this.maxPriceElement.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        this.filterCourses();
      }
    });
  }
  clearFilters() {
    this.searchElement.value = '';
    this.typeElement.value = '';
    this.difficultyElement.value = '';
    this.maxPriceElement.value = '';
    const checkboxes = this.categoriesElement.querySelectorAll('input[type=checkbox]:checked');
    checkboxes.forEach((checkbox: Element) => ((checkbox as HTMLInputElement).checked = false));

    this.filterCourses();
  }

  async filterCourses() {
    const searchInput = this.searchElement.value.toLowerCase();
    const type = this.typeElement.value;
    const difficulty = this.difficultyElement.value;
    const maxPrice = this.maxPriceElement.valueAsNumber;
    const categories = Array.from(this.shadowRoot!.querySelectorAll('input[type=checkbox]:checked')).map(
      (opt: Element) => (opt as HTMLInputElement).value
    );

    this.filteredCourses = this.courses.filter(course => {
      const matchesSearchInput = course.coursename.toLowerCase().includes(searchInput);
      const matchesType = !type || course.type === type;
      const matchesDifficulty = !difficulty || course.difficulty === difficulty;
      const matchesMaxPrice = !maxPrice || parseFloat(course.price) <= maxPrice;
      const matchesCategory =
        !categories.length ||
        (course.categories && categories.some(cat => (course.categories as string[]).includes(cat)));
      return matchesSearchInput && matchesType && matchesDifficulty && matchesMaxPrice && matchesCategory;
    });
  }
}
