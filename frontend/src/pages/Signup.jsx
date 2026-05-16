import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, setSession } from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    organizationName: '',
    department: '',
    region: '',
    accessRole: 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/auth/signup', { method: 'POST', body: form });
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
      <form onSubmit={submit} className="panel w-full max-w-lg">
        <p className="label text-yellow-300">Free enterprise pilot</p>
        <h1 className="mt-3 text-3xl font-black text-white">Start using SpendGuard</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-500">
          Early users can create governance reports for free while the enterprise product is being shaped. No card is required.
        </p>
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
            <span className="label">Organization</span>
            <input className="input" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} placeholder="Parent company or group" />
          </label>
          <label className="grid gap-2">
            <span className="label">Department</span>
            <input className="input" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="Finance, product, engineering" />
          </label>
          <label className="grid gap-2">
            <span className="label">Region</span>
            <input className="input" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} placeholder="Global, India, US, EMEA" />
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Access role</span>
            <select className="input" value={form.accessRole} onChange={(event) => setForm({ ...form, accessRole: event.target.value })}>
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="engineering">Engineering</option>
              <option value="leadership">Leadership</option>
              <option value="auditor">Auditor</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
          </label>
          <button className="btn-primary w-full sm:col-span-2" disabled={loading}>{loading ? 'Starting...' : 'Start Free Pilot'}</button>
          <p className="text-center text-sm font-semibold text-zinc-500 sm:col-span-2">
            Already have account? <Link className="text-yellow-200" to="/login">Login</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
