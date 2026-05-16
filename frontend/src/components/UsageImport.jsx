import React, { useRef, useState } from 'react';
import { parseUsageImport } from '../utils/csvImport';
import { formatCurrency } from '../utils/api';

export default function UsageImport({ onImport }) {
  const fileRef = useRef(null);
  const [csvText, setCsvText] = useState('');
  const [provider, setProvider] = useState('csv');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState(null);

  const importText = (text, fileName = '') => {
    const result = parseUsageImport(text, provider);
    const imported = result.tools;

    if (!imported.length) {
      setSummary(null);
      setMessage('No usable cost lines found. Include provider export columns for spend, service/model, requests, tokens, owner, or budget.');
      return;
    }

    onImport(imported, { ...result, fileName });
    setCsvText('');
    setSummary(result);
    setMessage(`${imported.length} cost lines imported from ${result.rowCount} rows.`);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    importText(text, file.name);
    event.target.value = '';
  };

  return (
    <section className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.06] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="label text-sky-200">Usage import</p>
          <h3 className="mt-2 text-xl font-black text-white">Upload real billing or usage exports.</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">
            Supports OpenAI, Anthropic, AWS, Azure, GCP, invoice CSVs, and generic spend rows.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[180px_auto]">
          <label className="grid gap-2">
            <span className="label">Source</span>
            <select className="input" value={provider} onChange={(event) => setProvider(event.target.value)}>
              <option value="csv">Auto / CSV</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
              <option value="invoice">Invoice</option>
            </select>
          </label>
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary shrink-0 self-end">
            Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        </div>
      </div>

      <textarea
        className="input mt-4 min-h-32 resize-y"
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        placeholder="Paste provider export rows with headers"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => importText(csvText)} className="btn-primary">
          Import Rows
        </button>
        {message && <p className="text-sm font-bold text-zinc-400">{message}</p>}
      </div>

      {summary && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Detected source', summary.provider.toUpperCase()],
            ['Imported spend', formatCurrency(summary.totalSpend)],
            ['Usage rows', summary.rowCount]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="label">{label}</p>
              <p className="mt-1 font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
