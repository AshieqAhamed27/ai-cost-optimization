import React from 'react';

export default function StatCard({ label, value, detail }) {
  return (
    <article className="panel transition hover:-translate-y-1 hover:border-white/20">
      <p className="label">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-500">{detail}</p>
    </article>
  );
}

