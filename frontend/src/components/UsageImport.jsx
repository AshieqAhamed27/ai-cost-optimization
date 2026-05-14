import React, { useRef, useState } from 'react';
import { csvRowsToTools, parseCsv } from '../utils/csvImport';

export default function UsageImport({ onImport }) {
  const fileRef = useRef(null);
  const [csvText, setCsvText] = useState('');
  const [message, setMessage] = useState('');

  const importText = (text) => {
    const imported = csvRowsToTools(parseCsv(text));

    if (!imported.length) {
      setMessage('No usable cost lines found. Include headers like provider, service, monthly cost, workflow, customer, requests, tokens, owner, or budget.');
      return;
    }

    onImport(imported);
    setCsvText('');
    setMessage(`${imported.length} cost lines imported.`);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    importText(text);
    event.target.value = '';
  };

  return (
    <section className="rounded-2xl border border-sky-300/20 bg-sky-300/[0.06] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="label text-sky-200">Usage import</p>
          <h3 className="mt-2 text-xl font-black text-white">Upload or paste billing rows.</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-zinc-400">
            Use CSV headers such as provider, service, monthly cost, workflow, customer, requests, tokens, owner, and budget.
          </p>
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary shrink-0">
          Upload CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
      </div>

      <textarea
        className="input mt-4 min-h-32 resize-y"
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        placeholder="Paste CSV rows with headers"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => importText(csvText)} className="btn-primary">
          Import Rows
        </button>
        {message && <p className="text-sm font-bold text-zinc-400">{message}</p>}
      </div>
    </section>
  );
}
