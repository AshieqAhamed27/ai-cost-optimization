import React, { useEffect, useRef, useState } from 'react';
import LogoMark from './LogoMark';
import { apiRequest } from '../utils/api';

const starterQuestions = [
  'Explain SpendGuard simply',
  'How can I reduce my AI bill?',
  'Is my data safe here?',
  'Can I ask business questions?'
];

export default function SiteChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi, I am your SpendGuard guide. Ask me about the product, AI cost problems, business decisions, reports, security, early access, or anything you are unsure about. I will explain it clearly and keep it practical.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    });
  }, [messages, loading, open]);

  const sendMessage = async (text = input) => {
    const question = text.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/agent/site-chat', {
        method: 'POST',
        body: {
          message: question,
          history: messages.slice(-8)
        }
      });

      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setError(err.message);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'I could not reach the AI assistant right now. You can still start free early access, add real spend data, and create an audit report. Please try the chat again in a moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-3 right-3 z-[80] w-[calc(100%-1.5rem)] max-w-md print:hidden sm:bottom-4 sm:right-4 sm:w-[calc(100%-2rem)]">
      {open && (
        <section className="mb-3 flex max-h-[min(86vh,720px)] flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <LogoMark className="h-9 w-9 shrink-0 rounded-lg" />
              <div>
                <p className="text-sm font-black text-white">SpendGuard Assistant</p>
                <p className="text-[11px] font-bold text-zinc-500">Friendly answers and clear explanations</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-zinc-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pr-3">
            <div className="grid gap-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`whitespace-pre-line break-words rounded-lg border p-3 text-sm font-semibold leading-relaxed ${
                    message.role === 'assistant'
                      ? 'border-white/10 bg-white/[0.04] text-zinc-300'
                      : 'ml-8 border-yellow-300/20 bg-yellow-300/[0.12] text-yellow-50'
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {loading && (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-bold text-zinc-500">
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} aria-hidden="true" />
            </div>

            <div className="mt-4 grid gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-xs font-bold text-zinc-300 transition hover:border-yellow-300/30 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-300/20 bg-red-300/10 p-3 text-xs font-bold text-red-100">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                className="input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything about SpendGuard or AI costs"
              />
              <button type="submit" disabled={loading} className="btn-primary shrink-0 px-4">
                Send
              </button>
            </div>
            <p className="mt-2 text-[11px] font-bold leading-relaxed text-zinc-600">
              Do not send passwords, API keys, card details, or private customer data.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-lg border border-yellow-300/30 bg-yellow-300 p-0 text-xs font-black uppercase tracking-widest text-slate-950 shadow-2xl shadow-black/40 transition hover:-translate-y-0.5 hover:bg-yellow-200 sm:h-auto sm:w-auto sm:gap-3 sm:px-4 sm:py-3 sm:text-sm"
        aria-expanded={open}
        aria-label="Ask questions"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs text-yellow-200">AI</span>
        <span className="hidden sm:inline">Ask Questions</span>
      </button>
    </div>
  );
}
