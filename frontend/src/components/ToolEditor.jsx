import React from 'react';

export const defaultTools = [
  { name: 'ChatGPT or AI assistant', monthlyCost: 2500, seats: 1, usage: 'high', category: 'AI assistant' },
  { name: 'Canva or content tool', monthlyCost: 1500, seats: 2, usage: 'medium', category: 'Creative' },
  { name: 'Automation or CRM tool', monthlyCost: 2200, seats: 3, usage: 'low', category: 'Automation' },
  { name: 'Website chatbot', monthlyCost: 3000, seats: 1, usage: 'unused', category: 'Chatbot' }
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
      { name: 'New AI tool', monthlyCost: 0, seats: 1, usage: 'medium', category: 'AI tool' }
    ]);
  };

  const removeTool = (index) => {
    setTools((prev) => prev.filter((_, toolIndex) => toolIndex !== index));
  };

  return (
    <div className="grid gap-3">
      {tools.map((tool, index) => (
        <article key={`${tool.name}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_130px_100px_130px_auto] lg:items-end">
            <label className="grid gap-2">
              <span className="label">Tool name</span>
              <input className="input" value={tool.name} onChange={(event) => updateTool(index, 'name', event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="label">Monthly Rs</span>
              <input className="input" type="number" min="0" value={tool.monthlyCost} onChange={(event) => updateTool(index, 'monthlyCost', event.target.value)} />
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
        Add Tool
      </button>
    </div>
  );
}
