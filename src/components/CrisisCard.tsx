import { useId } from 'react';
import { CAMPUS_COUNSELLING, HELPLINE } from '../lib/constants';
import { LinkButton } from './ui';

// Shown under every crisis reply and on the counsellor page.
// The counsellor page hides the "Talk to a counsellor" button because the student is already there.
export default function CrisisCard({ showCounsellorLink = true }: { showCounsellorLink?: boolean }) {
  // A chat can show several cards, so each heading needs its own id.
  const headingId = useId();

  return <section aria-labelledby={headingId} className="rounded-lg border border-red-200 bg-red-50 p-5 sm:p-6">
    <h2 id={headingId} className="editorial-heading text-2xl text-red-800">You don’t have to handle this alone</h2>
    {/* The router passes tel: links straight through, so this opens the phone's dialler. */}
    <LinkButton to={HELPLINE.tel} className="mt-5 w-full text-base sm:w-auto">Call {HELPLINE.name} {HELPLINE.number}</LinkButton>
    <p className="mt-2 text-sm text-stone-700">{HELPLINE.cost}, {HELPLINE.hours}, in {HELPLINE.languages}.</p>
    <p className="mt-4 text-sm leading-relaxed text-stone-700"><span className="font-semibold">{CAMPUS_COUNSELLING.name}:</span> {CAMPUS_COUNSELLING.contact}</p>
    <p className="mt-2 text-sm font-semibold text-red-800">If you are in immediate danger, call <a href="tel:112" className="underline underline-offset-4">112</a>.</p>
    {showCounsellorLink && <LinkButton to="/counsellor" variant="secondary" className="mt-5">Talk to a counsellor</LinkButton>}
  </section>;
}
