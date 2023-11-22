/* Autor: Harry Thünte */
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import componentStyle from './footer.css?inline';

@customElement('app-footer')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FooterComponent extends LitElement {
  static styles = componentStyle;

  render() {
    return html`
      <footer>
        <div class="content">
          <div class="left box">
            <div class="topic">USEFUL LINKS</div>
            <div><a href="#">About</a></div>
            <div><a href="#">Services</a></div>
            <div><a href="#">Contact</a></div>
            <div><a href="#">Shop</a></div>
            <div><a href="#">Blog</a></div>
          </div>
          <div class="middle box">
            <div class="topic">NEWSLETTER</div>
            <form action="#">
              <input type="email" placeholder="Enter email address" />
              <input type="submit" name="" value="SUBSCRIBE" />
            </form>
          </div>
          <div class="right box">
            <div class="topic">CONTACT</div>
            <p>
              Correnstraße 25 <br />
              Nordrhein-Westfalen, Münster, DE
            </p>
          </div>
        </div>
      </footer>
    `;
  }
}
