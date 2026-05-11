import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolEditor, { createBlankTool } from '../components/ToolEditor';
import { apiRequest, formatCurrency } from '../utils/api';

export default function NewAudit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    businessType: '',
    teamSize: 1,
    notes: ''
  });
  const [tools, setTools] = useState([createBlankTool()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => {
    const monthlySpend = tools.reduce((sum, tool) => sum + Number(tool.monthlyCost || 0), 0);
    const lowUsage = tools.filter((tool) => ['low', 'unused'].includes(tool.usage)).reduce((sum, tool) => sum + Number(tool.monthlyCost || 0), 0);
    const savings = Math.min(monthlySpend * 0.42, lowUsage + monthlySpend * 0.18 + Math.max(0, Number(form.teamSize || 1) - 1) * 350);
    return {
      monthlySpend,
      savings,
      afterCleanup: Math.max(0, monthlySpend - savings),
      yearlySavings: savings * 12
    };
  }, [tools, form.teamSize]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const filledTools = tools.filter((tool) => tool.name.trim());
    if (!filledTools.length) {
      setError('Add at least one AI tool before creating a report.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/audits', {
        method: 'POST',
        body: { ...form, tools: filledTools }
      });
      navigate(`/audits/${data.audit._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-page py-10">
      <section className="mb-8">
        <p className="label text-yellow-300">New audit</p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Create AI cost report</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-500">
          Enter the client's real AI tools, seats, usage level, and monthly spend to generate a report.
        </p>
      </section>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.5fr)]">
        <section className="panel">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Company name</span>
              <input className="input" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Business type</span>
              <input className="input" value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Team size</span>
              <input className="input" type="number" min="1" value={form.teamSize} onChange={(event) => setForm({ ...form, teamSize: event.target.value })} />
            </label>
            <label className="grid gap-2">
              <span className="label">Notes</span>
              <input className="input" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Example: using too many content tools" />
            </label>
          </div>

          <div className="mt-6">
            <p className="label text-sky-300">Tools and spend</p>
            <div className="mt-4">
              <ToolEditor tools={tools} setTools={setTools} />
            </div>
          </div>
        </section>

        <aside className="panel h-fit border-emerald-300/20 bg-emerald-300/[0.07]">
          <p className="label text-emerald-200">Live preview</p>
          <div className="mt-5 grid gap-3">
            {[
              ['Monthly AI spend', preview.monthlySpend],
              ['Possible monthly savings', preview.savings],
              ['Spend after cleanup', preview.afterCleanup],
              ['Possible yearly savings', preview.yearlySavings]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="label">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
          {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-5 w-full">
            {loading ? 'Creating...' : 'Create Audit Report'}
          </button>
        </aside>
      </form>
    </main>
  );
}
