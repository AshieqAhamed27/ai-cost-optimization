import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, setSession } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: form });
      setSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-page grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md">
        <p className="label text-yellow-300">Welcome back</p>
        <h1 className="mt-3 text-3xl font-black text-white">Login</h1>
        {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">{error}</p>}
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="grid gap-2">
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          <p className="text-center text-sm font-semibold text-zinc-500">
            No account? <Link className="text-yellow-200" to="/signup">Create one</Link>
          </p>
        </div>
      </form>
    </main>
  );
}

