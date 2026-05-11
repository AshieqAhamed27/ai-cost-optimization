import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container-page grid min-h-[70vh] place-items-center py-10 text-center">
      <section className="panel max-w-lg">
        <p className="label text-yellow-300">404</p>
        <h1 className="mt-3 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-3 text-sm font-semibold text-zinc-500">The page you opened does not exist.</p>
        <Link to="/" className="btn-primary mt-6">Go Home</Link>
      </section>
    </main>
  );
}
