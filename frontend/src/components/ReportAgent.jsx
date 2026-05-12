import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

export default function ReportAgent({ audit }) {
  const [pack, setPack] = useState(null);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePack = async () => {
    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const data = await apiRequest(`/agent/report-pack/${audit._id}`, {
        method: 'POST'
      });

      setPack(data.pack);
      setProvider(data.provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async () => {
    if (!pack?.clientEmail) return;

    try {
      await navigator.clipboard.writeText(pack.clientEmail);
      setError('');
      setCopied(true);
    } catch {
      setError('Could not copy the email. Select the text manually and copy it.');
    }
  };

  return (
    <section className="panel border-sky-300/20 bg-sky-300/[0.06]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-sky-200">AI Action Pack</p>
          <h2 className="mt-2 text-3xl font-black text-white">Turn this audit into work the client can approve.</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-zinc-400">
            Generate an executive summary, savings narrative, 30-day plan, implementation checklist, and follow-up email from this audit.
          </p>
        </div>
        {provider && (
          <span className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">
            {provider === 'openai' ? 'OpenAI' : 'Rules'} pack
          </span>
        )}
      </div>

      <button type="button" onClick={generatePack} disabled={loading} className="btn-primary mt-5">
        {loading ? 'Generating...' : 'Generate AI Action Pack'}
      </button>

      {error && (
        <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">
          {error}
        </p>
      )}

      {pack && (
        <div className="mt-6 grid gap-5">
          <article className="rounded-lg border border-white/10 bg-black/20 p-5">
            <p className="label text-emerald-200">Executive summary</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-300">{pack.executiveSummary}</p>
          </article>

          <article className="rounded-lg border border-white/10 bg-black/20 p-5">
            <p className="label text-yellow-200">Savings narrative</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-zinc-300">{pack.savingsNarrative}</p>
          </article>

          <div>
            <p className="label text-sky-200">30-day action plan</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {(pack.actionPlan || []).map((item) => (
                <article key={`${item.week}-${item.title}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-200">{item.week}</p>
                  <h3 className="mt-2 font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,1fr)]">
            <article className="rounded-lg border border-white/10 bg-black/20 p-5">
              <p className="label text-emerald-200">Implementation checklist</p>
              <div className="mt-3 grid gap-2">
                {(pack.implementationChecklist || []).map((item) => (
                  <p key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-bold leading-relaxed text-zinc-300">
                    {item}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="label text-yellow-200">Client email</p>
                <button type="button" onClick={copyEmail} className="btn-secondary py-2 text-[10px]">
                  {copied ? 'Copied' : 'Copy Email'}
                </button>
              </div>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/80 p-4 text-xs font-semibold leading-relaxed text-zinc-300">{pack.clientEmail}</pre>
            </article>
          </div>

          <p className="text-xs font-bold leading-relaxed text-zinc-500">{pack.disclaimer}</p>
        </div>
      )}
    </section>
  );
}
