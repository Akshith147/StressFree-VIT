import { LinkButton } from '../components/ui';

export default function Home() {
  return <>
    <section className="relative isolate overflow-hidden rounded-lg border border-orange-200 bg-orange-50 px-6 py-10 sm:px-10 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -bottom-24 -z-10 opacity-60 sm:-right-10 sm:-bottom-20"><div className="sun-print" /></div>
      <p className="mb-8 text-xs font-semibold tracking-widest text-orange-900 uppercase">A moment between everything else</p>
      <h1 className="editorial-heading max-w-lg text-5xl text-stone-900 sm:text-6xl">A little room to check in.</h1>
      <p className="mt-5 max-w-sm text-base leading-relaxed text-stone-700">Between classes, deadlines, and the rest of the day. Take a moment to notice how you’re doing.</p>
      <div className="mt-8 flex flex-wrap gap-3"><LinkButton to="/checkin">Make a check-in</LinkButton><LinkButton to="/history" variant="secondary">Your history</LinkButton></div>
      <p className="mt-5 text-xs text-stone-600">No account needed. Saved in your browser.</p>
    </section>
    <section aria-labelledby="how-it-works" className="mt-12">
      <h2 id="how-it-works" className="editorial-heading text-3xl">Keep it simple.</h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3">
        <li className="border-t border-stone-300 pt-4"><span className="text-xs font-semibold text-orange-800">01</span><h3 className="mt-3 font-semibold">Choose a mood</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Pick what feels closest. There’s no right answer.</p></li>
        <li className="border-t border-stone-300 pt-4"><span className="text-xs font-semibold text-orange-800">02</span><h3 className="mt-3 font-semibold">Leave a note, or don’t</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">A few words about your day are enough. You can also leave it blank.</p></li>
        <li className="border-t border-stone-300 pt-4"><span className="text-xs font-semibold text-orange-800">03</span><h3 className="mt-3 font-semibold">Look back when you want</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Your entries stay together in History, on this browser and device.</p></li>
      </ol>
    </section>
    <p className="mt-10 border-t border-stone-300 pt-5 text-xs leading-relaxed text-stone-600">Built as a student project at VIT Vellore. A place to keep a record, not a clinical assessment. Anyone using the same browser profile may be able to see your entries.</p>
  </>;
}
