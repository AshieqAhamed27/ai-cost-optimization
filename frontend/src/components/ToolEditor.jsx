import React from 'react';

export const createBlankTool = () => ({
  name: '',
  monthlyCost: '',
  seats: 1,
  usage: 'medium',
  category: 'Model API'
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
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_150px_130px_100px_130px_auto] lg:items-end">
            <label className="grid gap-2">
              <span className="label">Cost line</span>
              <input className="input" value={tool.name} onChange={(event) => updateTool(index, 'name', event.target.value)} placeholder="Example: OpenAI API" required />
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
            <button type="button" onClick={() => removeTool(index)} className="btn-secondary px-4 py-3">
              Remove
            </button>
          </div>
        </article>
      ))}
      <button type="button" onClick={addTool} className="btn-secondary w-full">
        Add Cost Line
      </button>
    </div>
  );
}
