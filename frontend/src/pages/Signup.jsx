import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, setSession } from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/auth/signup', { method: 'POST', body: form });
      setSession(data);
      navigate('/pricing');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-page grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-lg">
        <p className="label text-yellow-300">Create account</p>
        <h1 className="mt-3 text-3xl font-black text-white">Create your business account</h1>
        {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">{error}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="label">Name</span>
            <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="grid gap-2">
            <span className="label">Company</span>
            <input className="input" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} />
          </label>
          <button className="btn-primary w-full sm:col-span-2" disabled={loading}>{loading ? 'Creating...' : 'Create Account and Choose Plan'}</button>
          <p className="text-center text-sm font-semibold text-zinc-500 sm:col-span-2">
            Already have account? <Link className="text-yellow-200" to="/login">Login</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
