import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CrisisCard from './CrisisCard';
import { CAMPUS_COUNSELLING, HELPLINE } from '../lib/constants';

function render(element: ReactElement) {
  return renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);
}

describe('CrisisCard', () => {
  it('shows a tap-to-call helpline button, the campus contact and the emergency number', () => {
    const markup = render(<CrisisCard />);
    expect(markup).toContain(`href="${HELPLINE.tel}"`);
    expect(markup).toContain(`Call ${HELPLINE.name} ${HELPLINE.number}`);
    expect(markup).toContain(CAMPUS_COUNSELLING.name);
    expect(markup).toContain('href="tel:112"');
    expect(markup).toContain('href="/counsellor"');
  });

  it('can hide the counsellor button', () => {
    expect(render(<CrisisCard showCounsellorLink={false} />)).not.toContain('href="/counsellor"');
  });
});
