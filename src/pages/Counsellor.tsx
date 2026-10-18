import { useEffect, useRef, useState, type FormEvent } from 'react';
import CrisisCard from '../components/CrisisCard';
import { Button, Card, LinkButton, PageHeader } from '../components/ui';
import { HELPLINE } from '../lib/constants';

type ContactMethod = 'phone' | 'email';
type PreferredTime = 'morning' | 'afternoon' | 'evening';

const TOPIC_MAX = 500;
const METHODS: { value: ContactMethod; label: string }[] = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
];
const TIMES: { value: PreferredTime; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

const fieldClass = 'block min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base';
const radioClass = 'size-5 accent-orange-800';

export default function Counsellor() {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<ContactMethod>('phone');
  const [contact, setContact] = useState('');
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState<PreferredTime | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const doneTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => { if (submitted) doneTitle.current?.focus(); }, [submitted]);

  // Demo only: nothing is sent or saved. Clearing the fields means the details don't stay on screen.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setName('');
    setMethod('phone');
    setContact('');
    setTopic('');
    setTime(null);
    setSubmitted(true);
  }

  return <>
    <PageHeader title="Talk to a counsellor" />
    <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800"><strong>Demo only.</strong> Requests are not sent to anyone yet. If you need help now, call <a href={HELPLINE.tel} className="font-semibold underline underline-offset-4">{HELPLINE.name} {HELPLINE.number}</a> (free, {HELPLINE.hours}).</p>
    <p className="mb-6 max-w-xl text-sm leading-relaxed text-stone-600">In the full version, a trained counsellor from the campus counselling centre will contact you.</p>

    {submitted ? <Card className="space-y-4">
      <h2 ref={doneTitle} tabIndex={-1} className="text-xl font-semibold text-stone-900 focus:outline-none">This was a demo, so nothing was sent.</h2>
      <p className="text-sm leading-relaxed text-stone-600">In the full version, a counsellor would reach out within one working day. Need help now? Call <a href={HELPLINE.tel} className="font-semibold text-red-800 underline underline-offset-4">{HELPLINE.name} {HELPLINE.number}</a>.</p>
      <div className="flex flex-wrap gap-3"><LinkButton to="/chat">Back to the chat</LinkButton><Button variant="secondary" onClick={() => setSubmitted(false)}>Fill in the form again</Button></div>
    </Card> : <Card>
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label htmlFor="counsellor-name" className="mb-2 block font-medium">Your name <span className="font-normal text-stone-500">(optional)</span></label>
          <input id="counsellor-name" type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={fieldClass} />
        </div>

        <fieldset>
          <legend className="mb-2 font-medium">Preferred contact method</legend>
          <div className="flex flex-wrap gap-x-6">
            {METHODS.map((item) => <label key={item.value} className="inline-flex min-h-11 items-center gap-3 text-sm">
              <input type="radio" name="contact-method" value={item.value} checked={method === item.value} onChange={() => setMethod(item.value)} className={radioClass} />{item.label}
            </label>)}
          </div>
        </fieldset>

        <div>
          <label htmlFor="counsellor-contact" className="mb-2 block font-medium">{method === 'phone' ? 'Phone number' : 'Email address'}</label>
          {/* The input type follows the chosen method so phones show the right keyboard. */}
          <input id="counsellor-contact" type={method === 'phone' ? 'tel' : 'email'} inputMode={method === 'phone' ? 'tel' : 'email'} autoComplete={method === 'phone' ? 'tel' : 'email'} value={contact} onChange={(event) => setContact(event.target.value)} required className={fieldClass} />
        </div>

        <div>
          <label htmlFor="counsellor-topic" className="mb-2 block font-medium">What would you like to talk about? <span className="font-normal text-stone-500">(optional)</span></label>
          <textarea id="counsellor-topic" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={TOPIC_MAX} rows={4} aria-describedby="counsellor-topic-count" className="block w-full resize-y rounded-md border border-stone-300 bg-white p-3 text-base leading-relaxed" />
          <p id="counsellor-topic-count" aria-live="polite" aria-atomic="true" className="mt-2 text-right text-xs tabular-nums text-stone-500">{topic.length} / {TOPIC_MAX}</p>
        </div>

        <fieldset>
          <legend className="mb-2 font-medium">Preferred time</legend>
          <div className="flex flex-wrap gap-x-6">
            {TIMES.map((item) => <label key={item.value} className="inline-flex min-h-11 items-center gap-3 text-sm">
              <input type="radio" name="preferred-time" value={item.value} checked={time === item.value} onChange={() => setTime(item.value)} required className={radioClass} />{item.label}
            </label>)}
          </div>
        </fieldset>

        <Button type="submit" className="w-full sm:w-auto">Request a call back (demo)</Button>
      </form>
    </Card>}

    <div className="mt-8"><CrisisCard showCounsellorLink={false} /></div>
  </>;
}
