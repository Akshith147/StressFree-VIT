import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Card, LinkButton, PageHeader } from '../components/ui';
import { HELPLINE } from '../lib/constants';
import { MOODS, NOTE_MAX, useCheckIns, type CheckIn as CheckInEntry, type Mood } from '../lib/checkins';

export default function CheckIn() {
  const { add } = useCheckIns();
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<CheckInEntry | null>(null);
  const [error, setError] = useState('');
  const successTitle = useRef<HTMLHeadingElement>(null);
  const firstMood = useRef<HTMLInputElement>(null);

  useEffect(() => { if (saved) successTitle.current?.focus(); }, [saved]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mood === null) return;
    setError('');
    try { setSaved(add({ mood, note })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Your check-in could not be saved. Please try again.'); }
  }

  function reset() {
    setSaved(null);
    setMood(null);
    setNote('');
    setError('');
    requestAnimationFrame(() => firstMood.current?.focus());
  }

  return <>
    <PageHeader title="How are you feeling today?" subtitle="Pick what feels closest. Add a note if you want to." />
    {saved ? <Card className="space-y-5">
      <h2 ref={successTitle} tabIndex={-1} className="text-xl font-semibold text-stone-900 focus:outline-none">Your check-in is saved.</h2>
      <p className="text-sm text-stone-500">Your check-in is saved in this browser on this device.</p>
      {saved.mood <= 2 && <p className="rounded-md bg-orange-50 p-4 leading-relaxed text-orange-800">If you’d like to talk to someone, you can call <a className="font-medium underline underline-offset-4" href={HELPLINE.tel}>{HELPLINE.name} {HELPLINE.number}</a> any time.</p>}
      <div className="flex flex-wrap gap-3"><LinkButton to="/history">See your history</LinkButton><LinkButton to="/chat" variant="secondary">Talk to the chatbot</LinkButton><Button variant="secondary" onClick={reset}>Check in again</Button></div>
    </Card> : <Card>
      <form onSubmit={save} className="space-y-6">
        <fieldset>
          <legend className="mb-4 font-medium text-stone-800">Choose the mood that fits right now</legend>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {MOODS.map((item, index) => <label key={item.value} className="relative min-w-0 cursor-pointer">
              <input ref={index === 0 ? firstMood : undefined} type="radio" name="mood" value={item.value} checked={mood === item.value} onChange={() => setMood(item.value)} aria-label={`Mood ${item.value}: ${item.label}`} className="peer sr-only" required />
              <span className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-md border px-1 py-4 text-sm transition peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-2 ${mood === item.value ? 'border-orange-700 bg-orange-50 text-orange-800 ring-1 ring-orange-700' : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'}`}><span aria-hidden="true" className="editorial-heading text-3xl">{String(item.value).padStart(2, '0')}</span><span className="text-center text-xs font-medium sm:text-sm">{item.label}</span></span>
            </label>)}
          </div>
        </fieldset>
        <div>
          <label htmlFor="note" className="mb-2 block font-medium">Anything on your mind? <span className="font-normal text-stone-500">(optional)</span></label>
          <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={NOTE_MAX} rows={5} aria-describedby="note-count privacy" className="block w-full resize-y rounded-md border border-stone-200 bg-amber-50/40 p-3 leading-relaxed placeholder:text-stone-500" placeholder="You can leave this blank." />
          <p id="note-count" aria-live="polite" aria-atomic="true" className="mt-2 text-right text-xs tabular-nums text-stone-500">{note.length} / {NOTE_MAX}</p>
        </div>
        <div className="border-l-2 border-amber-300 pl-4 text-xs leading-relaxed text-stone-600"><p id="privacy">Your check-ins are saved only in this browser on this device.</p><p className="mt-1">They are not sent to a counsellor. Anyone using this browser profile may be able to see them.</p></div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={mood === null} className="w-full sm:w-auto">Save check-in</Button>
      </form>
    </Card>}
  </>;
}
