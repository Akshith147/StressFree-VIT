import { useState } from 'react';
import { Button, Card, LinkButton, PageHeader } from '../components/ui';
import { getWeeklySummary, MOODS, useCheckIns } from '../lib/checkins';

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
};

export default function History() {
  const { checkIns, remove, clear } = useCheckIns();
  const [error, setError] = useState('');
  const summary = getWeeklySummary(checkIns);

  function change(action: () => void, question: string) {
    if (!window.confirm(question)) return;
    setError('');
    try { action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Your check-ins could not be updated. Please try again.'); }
  }

  return <>
    <PageHeader title="Your check-ins" subtitle="Newest first. Saved on this device only." />
    {error && <p role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {checkIns.length === 0 ? <Card className="space-y-4 py-10 text-center">
      <h2 className="text-xl font-semibold">No check-ins yet.</h2><p className="text-sm text-stone-500">Your first check-in will appear here.</p><LinkButton to="/checkin">Make a check-in</LinkButton>
    </Card> : <>
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <h2 className="text-xs font-semibold tracking-widest text-orange-800 uppercase">The last 7 days</h2>
        <p className="mt-2 text-lg font-medium text-orange-800">{summary.count} check-in{summary.count === 1 ? '' : 's'} this week{summary.average !== null && <> · average mood {summary.average.toFixed(1)} ({summary.label})</>}</p>
        <p className="mt-2 text-xs text-stone-500">Mood scale: 1 = Very low, 5 = Great. This summary is not a clinical assessment.</p>
      </Card>
      <ul className="space-y-4" aria-label="Saved check-ins">
        {checkIns.map((item) => {
          const mood = MOODS[item.mood - 1];
          const date = new Date(item.date).toLocaleString('en-IN', dateOptions);
          return <li key={item.id}><Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3"><span aria-hidden="true" className="editorial-heading inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-orange-200 bg-orange-50 text-2xl text-orange-900">{String(mood.value).padStart(2, '0')}</span><div><h2 className="font-semibold">{mood.label}</h2><time dateTime={item.date} className="text-xs text-stone-500">{date}</time></div></div>
              <Button variant="danger" aria-label={`Delete ${mood.label} check-in from ${date}`} onClick={() => change(() => remove(item.id), 'Delete this check-in?')} className="text-sm">Delete</Button>
            </div>
            <p className={`mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed ${item.note ? 'text-stone-800' : 'text-stone-500'}`}>{item.note || 'No note'}</p>
          </Card></li>;
        })}
      </ul>
      <div className="mt-6 flex flex-wrap justify-between gap-3"><LinkButton to="/checkin" variant="secondary">New check-in</LinkButton><Button variant="danger" onClick={() => change(clear, 'Clear all check-ins? This cannot be undone.')}>Clear all</Button></div>
    </>}
  </>;
}
