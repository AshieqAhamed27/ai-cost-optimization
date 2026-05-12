import React, { useState } from 'react';
import { apiRequest, formatCurrency } from '../utils/api';

const impactClass = {
  High: 'border-red-300/20 bg-red-300/[0.07] text-red-100',
  Medium: 'border-yellow-300/20 bg-yellow-300/[0.07] text-yellow-100',
  Low: 'border-sky-300/20 bg-sky-300/[0.07] text-sky-100'
};

export default function AuditAgent({ form, tools, preview }) {
  const [agent, setAgent] = useState(null);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filledTools = tools.filter((tool) => tool.name.trim());
  const disabled = loading || filledTools.length === 0;

  const askAgent = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/agent/audit-advice', {
        method: 'POST',
        body: {
          ...form,
          tools: filledTools
        }
      });

      setAgent(data.agent);
      setProvider(data.provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel border-sky-300/20 bg-sky-300/[0.06]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="label text-sky-200">AI Audit Agent</p>
          <h2 className="mt-2 text-2xl font-black text-white">Find cost risks before creating the report.</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">
            The agent reviews your cost lines and returns quick wins, risks, questions, and next steps.
          </p>
        </div>
        {provider && (
          <span className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300">
            {provider === 'openai' ? 'OpenAI' : 'Rules'} agent
          </span>
        )}
      </div>

      <button type="button" onClick={askAgent} disabled={disabled} className="btn-primary mt-5 w-full">
        {loading ? 'Thinking...' : 'Ask Audit Agent'}
      </button>

      {filledTools.length === 0 && (
        <p className="mt-3 text-xs font-bold text-zinc-500">
          Add at least one AI cost line to use the agent.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">
          {error}
        </p>
      )}

      {agent && (
        <div className="mt-5 grid gap-4">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="label">Agent summary</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-300">{agent.summary}</p>
            <p className="mt-3 text-xs font-bold text-zinc-500">
              Current estimate: {formatCurrency(preview.monthlySpend)} monthly spend, {formatCurrency(preview.savings)} possible monthly savings.
            </p>
          </div>

          <div>
            <p className="label text-emerald-200">Quick wins</p>
            <div className="mt-3 grid gap-3">
              {(agent.quickWins || []).map((item) => (
                <article key={item.title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-black text-white">{item.title}</h3>
                    <span className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${impactClass[item.impact] || impactClass.Medium}`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label text-yellow-200">Questions to ask</p>
              <div className="mt-3 grid gap-2">
                {(agent.questions || []).map((item) => (
                  <p key={item} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold text-zinc-300">{item}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="label text-red-100">Risks</p>
              <div className="mt-3 grid gap-2">
                {(agent.risks || []).map((item) => (
                  <p key={item} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold text-zinc-300">{item}</p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="label text-sky-200">Next steps</p>
            <div className="mt-3 grid gap-2">
              {(agent.nextSteps || []).map((item) => (
                <p key={item} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold text-zinc-300">{item}</p>
              ))}
            </div>
          </div>

          <p className="text-xs font-bold leading-relaxed text-zinc-500">{agent.disclaimer}</p>
        </div>
      )}
    </section>
  );
}
