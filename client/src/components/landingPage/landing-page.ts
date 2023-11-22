/* Autor: Simon Guyon */
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin';

import sharedStyle from '../shared.css?inline';
import componentStyle from './landing-page.css?inline';

@customElement('app-landing-page')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LandingPage extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  async firstUpdated() {
    try {
      this.startAsyncInit();
      this.checkAuthentication();
    } finally {
      this.finishAsyncInit();
    }
  }

  async checkAuthentication() {
    try {
      await httpClient.get('users/secure');
      router.navigate('/landingpage');
    } catch (e) {
      console.log('You are not signed in.');
    }
  }

  render() {
    return html`
    
          <div class="box">
            <p>Skill-Bay</p>
            <div class="homepage-container">
              <div class="container">
                <div class="title">
                  <img src="../../../public/Logo.png" alt="Logo" />
                    <div class="developer-1">
                      <strong>1. Dev: Annika Junge</strong>
                      <strong>
                      <p>
                      Usermanagment
                      <p>
                    </strong>
                    </div>
                    <div class="developer-2">
                      <strong>2. Dev: Harry Thünte</strong>
                      <strong>
                      <p>
                      Market
                      <p>
                    </strong>
                    </div>
                    <div class="developer-3">
                      <strong>3. Dev: Marvin Schulze Berge </strong>
                    <strong>
                      <p>
                      Community
                      <p>
                    </strong>
                      </div>
                    <div class="developer-4">
                      <strong>4. Dev: Simon Guyon</strong>
                      <strong>
                      <p>
                      Education
                      <p>
                    </strong>
                    </div>
                  </div>
                  </div>
                  <div class="paragraph-box">
                    <p>
                      Skill-Bay is a platform that offers programming assignments and courses. Users can offer their
                      programming skills for assignments or enroll in courses to learn new skills. The platform provides
                      a user-friendly interface and features to connect with other professionals in the field.
                    </p>
                  </div>
                  <div class="paragraph-box">
                    <p>
                      We the developers of this Website are happy to present you with our result.  We are open for any recommendations in order to improve the userfriendlyness of this
                      website.
                    </p>
                  </div>

                  <div class="button-container">
                    <button class="btn" @click="${this.navigateToSignUp}">Sign-up for free now</button>
                    <button class="btn" @click="${this.navigateToSignIn}">Sign-in again</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  navigateToSignIn() {
    router.navigate('/users/sign-in');
  }

  navigateToSignUp() {
    router.navigate('/users/sign-up');
  }
}
