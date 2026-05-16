import React from 'react';
import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';

const footerLinks = [
  ['Company', '/company'],
  ['Security', '/security'],
  ['Pilot and Plans', '/pricing'],
  ['Create Account', '/signup'],
  ['Login', '/login']
];

const legalLinks = [
  ['Privacy Policy', '/privacy'],
  ['Terms', '/terms'],
  ['Refund Policy', '/refunds']
];

const serviceLinks = [
  'AI spend governance',
  'Infrastructure cost review',
  'Model routing recommendations',
  'Executive savings report'
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.55fr)_minmax(220px,0.65fr)_minmax(220px,0.55fr)_minmax(220px,0.55fr)]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <LogoMark className="h-11 w-11 shrink-0 rounded-lg" />
              <span>
                <span className="block text-base font-black text-white">SpendGuard</span>
                <span className="block text-xs font-bold text-zinc-500">AI cost governance platform</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-zinc-500">
              We help serious teams review AI API and infrastructure costs, find waste, assign ownership, and deliver leadership-ready savings recommendations.
            </p>
          </div>

          <div>
            <p className="label text-zinc-400">Product</p>
            <nav className="mt-4 grid gap-3">
              {footerLinks.map(([label, to]) => (
                <Link key={label} to={to} className="text-sm font-bold text-zinc-400 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="label text-zinc-400">Services</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-zinc-400">
              {serviceLinks.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="label text-zinc-400">Business Model</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-zinc-400">
              <p>Free enterprise pilot now</p>
              <p>Razorpay checkout ready for paid rollout</p>
              <p>Built for monthly governance reviews</p>
            </div>
          </div>

          <div>
            <p className="label text-zinc-400">Trust</p>
            <nav className="mt-4 grid gap-3">
              {legalLinks.map(([label, to]) => (
                <Link key={label} to={to} className="text-sm font-bold text-zinc-400 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-widest text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 SpendGuard. All rights reserved.</p>
          <p>Built for companies that want controlled AI usage costs.</p>
        </div>
      </div>
    </footer>
  );
}
