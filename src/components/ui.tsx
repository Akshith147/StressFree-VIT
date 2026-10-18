import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'danger';
const base = 'inline-flex items-center justify-center gap-2 rounded-md px-5 min-h-11 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const variants: Record<Variant, string> = {
  primary: 'border border-orange-800 bg-orange-800 text-white hover:border-orange-900 hover:bg-orange-900',
  secondary: 'border border-stone-300 bg-white text-stone-800 hover:border-orange-800 hover:bg-orange-50',
  danger: 'border border-red-200 bg-white text-red-800 hover:bg-red-50',
};

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ to, variant = 'primary', children, className = '' }: PropsWithChildren<{ to: string; variant?: Variant; className?: string }>) {
  return <Link to={to} className={`${base} ${variants[variant]} ${className}`}>{children}</Link>;
}

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <div className={`surface-card ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header className="mb-8"><h1 className="editorial-heading text-4xl text-stone-900 sm:text-5xl">{title}</h1>{subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">{subtitle}</p>}</header>;
}
