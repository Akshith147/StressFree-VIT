import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { HELPLINE, NOT_EMERGENCY_TEXT, SITE_NAME } from '../lib/constants';

const navigation = [
  ['/', 'Home'], ['/checkin', 'Check-in'], ['/history', 'History'],
  ['/chat', 'Chat'], ['/resources', 'Resources'],
] as const;

export default function Layout() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = SITE_NAME;
    if (previousPath.current !== pathname) {
      main.current?.focus();
      window.scrollTo(0, 0);
      previousPath.current = pathname;
    }
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" onClick={(event) => { event.preventDefault(); main.current?.focus(); }} className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:p-3">Skip to content</a>
      <div aria-hidden="true" className="warm-rule" />
      <header className="border-b border-stone-300 bg-amber-50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-10 gap-y-2 px-5 pt-4 pb-2 sm:px-8 sm:py-5">
          <Link to="/" className="inline-flex min-h-11 items-center gap-3 text-base font-semibold tracking-tight text-stone-900"><span aria-hidden="true" className="editorial-heading text-3xl text-orange-800">sf.</span>{SITE_NAME}</Link>
          <nav aria-label="Main navigation" className="flex w-full flex-wrap gap-x-5 sm:w-auto">
            {navigation.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `inline-flex min-h-11 items-center border-b-2 text-sm transition-colors ${isActive ? 'border-orange-800 font-semibold text-orange-900' : 'border-transparent text-stone-600 hover:border-orange-300 hover:text-stone-900'}`}>{label}</NavLink>)}
          </nav>
        </div>
      </header>
      <main ref={main} id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 focus:outline-none sm:px-8 sm:py-14"><Outlet /></main>
      <footer className="border-t border-stone-300 bg-amber-50">
        <div className="mx-auto max-w-4xl space-y-3 px-5 py-7 text-sm leading-relaxed text-stone-600 sm:px-8">
          <p>Need help now? Call <a href={HELPLINE.tel} className="font-semibold text-red-800 underline underline-offset-4">{HELPLINE.name} {HELPLINE.number}</a> (free, {HELPLINE.hours}). {NOT_EMERGENCY_TEXT}</p>
          <p className="text-xs">© 2026 {SITE_NAME} · Multidisciplinary Project Team, VIT Vellore</p>
        </div>
      </footer>
    </div>
  );
}
