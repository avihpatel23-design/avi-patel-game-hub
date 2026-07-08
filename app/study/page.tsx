'use client';

import { useState } from 'react';

export default function StudyPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setOutput(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">AI Study Helper</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Turn chaos into clear study material</h1>
          <p className="mt-3 max-w-2xl text-slate-300">Paste your topic, chapter notes, or any rough ideas and the studio will return a Gujarati summary, highlights, quiz, and flashcards.</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
            <label className="mb-3 block text-sm font-medium text-slate-200" htmlFor="study-input">
              What would you like to study?
            </label>
            <textarea
              id="study-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: Explain photosynthesis in simple Gujarati with key points and practice questions."
              className="min-h-[220px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Generate Notes'}
            </button>
          </form>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Output preview</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              {loading && <p>Crafting your study pack...</p>}
              {error && <p className="text-rose-300">{error}</p>}
              {output && <pre className="whitespace-pre-wrap text-sm text-slate-200">{output}</pre>}
              {!loading && !error && !output && <p className="text-slate-500">Your generated study notes will appear here.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
