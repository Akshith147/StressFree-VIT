import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { HELPLINE } from './constants';

afterEach(() => vi.unstubAllGlobals());

describe('page contracts', () => {
  it.each([
    ['/', 'A little room to check in.'], ['/checkin', 'How are you feeling today?'],
    ['/history', 'Your check-ins'], ['/chat', 'Chat'],
    ['/resources', 'Resources'],
    ['/counsellor', 'Talk to a counsellor'],
  ])('renders %s with one heading, shared navigation and help footer', (route, title) => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    const markup = renderToStaticMarkup(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);
    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain(title);
    expect(markup).toContain('aria-label="Main navigation"');
    expect(markup).toContain(HELPLINE.tel);
    expect(markup).toContain('This website is not an emergency service.');
    expect(markup).toContain('id="main-content"');
  });
});
