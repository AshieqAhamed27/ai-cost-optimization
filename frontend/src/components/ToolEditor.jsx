import React from 'react';

export const createBlankTool = () => ({
  name: '',
  monthlyCost: '',
  seats: 1,
  usage: 'medium',
  category: 'Model API',
  monthlyRequests: '',
  avgTokens: '',
  modelTier: 'unknown',
  caching: 'unknown',
  owner: ''
});

const categories = [
  'Model API',
  'Embeddings',
  'Vector database',
  'Cloud inference',
  'Observability',
  'Background jobs',
  'Other infrastructure'
];

export default function ToolEditor({ tools, setTools }) {
  const updateTool = (index, field, value) => {
    setTools((prev) => prev.map((tool, toolIndex) => (
      toolIndex === index ? { ...tool, [field]: value } : tool
    )));
  };

  const addTool = () => {
    setTools((prev) => [
      ...prev,
      createBlankTool()
    ]);
  };

  const removeTool = (index) => {
    setTools((prev) => prev.filter((_, toolIndex) => toolIndex !== index));
  };

  return (
    <div className="grid gap-3">
      {tools.map((tool, index) => (
        <article key={`${tool.name}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 xl:items-end">
            <label className="grid gap-2">
              <span className="label">Cost line</span>
              <input className="input" value={tool.name} onChange={(event) => updateTool(index, 'name', event.target.value)} placeholder="Provider, service, or workflow name" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Category</span>
              <select className="input" value={tool.category} onChange={(event) => updateTool(index, 'category', event.target.value)}>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Monthly Rs</span>
              <input className="input" type="number" min="0" value={tool.monthlyCost} onChange={(event) => updateTool(index, 'monthlyCost', event.target.value)} placeholder="0" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Seats</span>
              <input className="input" type="number" min="1" value={tool.seats} onChange={(event) => updateTool(index, 'seats', event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="label">Usage</span>
              <select className="input" value={tool.usage} onChange={(event) => updateTool(index, 'usage', event.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="unused">Unused</option>
              </select>
            </label>
            <button type="button" onClick={() => removeTool(index)} className="btn-secondary h-12 px-4 py-3 md:self-end">
              Remove
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2">
              <span className="label">Monthly requests</span>
              <input className="input" type="number" min="0" value={tool.monthlyRequests} onChange={(event) => updateTool(index, 'monthlyRequests', event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="label">Avg tokens</span>
              <input className="input" type="number" min="0" value={tool.avgTokens} onChange={(event) => updateTool(index, 'avgTokens', event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="label">Model tier</span>
              <select className="input" value={tool.modelTier} onChange={(event) => updateTool(index, 'modelTier', event.target.value)}>
                <option value="unknown">Unknown</option>
                <option value="premium">Premium</option>
                <option value="balanced">Balanced</option>
                <option value="economy">Economy</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Caching</span>
              <select className="input" value={tool.caching} onChange={(event) => updateTool(index, 'caching', event.target.value)}>
                <option value="unknown">Unknown</option>
                <option value="none">None</option>
                <option value="partial">Partial</option>
                <option value="good">Good</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="label">Owner</span>
              <input className="input" value={tool.owner} onChange={(event) => updateTool(index, 'owner', event.target.value)} placeholder="Team or person" />
            </label>
          </div>
        </article>
      ))}
      <button type="button" onClick={addTool} className="btn-secondary w-full">
        Add Cost Line
      </button>
    </div>
  );
}
