/* Autor: Annika Junge */
import { expect } from 'chai';
import { fixture } from '@open-wc/testing-helpers';
import './sidebar';

describe('app-sidebar', () => {
  it('should render the sidebar with all links', async () => {
    const element = await fixture('<app-sidebar></app-sidebar>');
    const sidebarLinks = element.shadowRoot!.querySelectorAll('#sidebar-wrapper a');

    expect(sidebarLinks.length).to.equal(8);
    expect(sidebarLinks[0].getAttribute('href')).to.equal('#');
    expect(sidebarLinks[1].getAttribute('href')).to.equal('profile');
    expect(sidebarLinks[2].getAttribute('href')).to.equal('change-details');
    expect(sidebarLinks[3].getAttribute('href')).to.equal('change-password');
    expect(sidebarLinks[4].getAttribute('href')).to.equal('change-email');
    expect(sidebarLinks[5].getAttribute('href')).to.equal('friendslist');
    expect(sidebarLinks[6].getAttribute('href')).to.equal('sign-out');
    expect(sidebarLinks[7].getAttribute('href')).to.equal('delete');
  });
});
