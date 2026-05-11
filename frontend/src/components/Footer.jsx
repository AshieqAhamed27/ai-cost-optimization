import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = [
  ['Pricing', '/pricing'],
  ['Create Account', '/signup'],
  ['Login', '/login'],
  ['Dashboard', '/dashboard']
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-black/20">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.6fr)_minmax(220px,0.6fr)]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-yellow-300 text-sm font-black text-slate-950">
                AI
              </span>
              <span>
                <span className="block text-base font-black text-white">AI Cost Audit</span>
                <span className="block text-xs font-bold text-zinc-500">AI spend audits and savings reports</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-zinc-500">
              We help businesses review AI software spend, find waste, and turn the findings into clear savings recommendations.
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
            <p className="label text-zinc-400">Service</p>
            <div className="mt-4 grid gap-3 text-sm font-bold text-zinc-400">
              <p>AI tool spend review</p>
              <p>Unused seat analysis</p>
              <p>Client-ready reports</p>
              <p>Monthly cost monitoring</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-widest text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 AI Cost Audit. All rights reserved.</p>
          <p>Built for businesses that want controlled AI spend.</p>
        </div>
      </div>
    </footer>
  );
}
