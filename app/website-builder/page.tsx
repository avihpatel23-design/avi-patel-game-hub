'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt: string;
  badge: string;
};

const categories = ['All', 'Business', 'Portfolio', 'E-commerce', 'Education', 'Gym', 'Restaurant', 'SaaS', 'Repair Service', 'Landing Page'];

const templates: Template[] = [
  {
    id: 'nova',
    name: 'Nova Studio',
    category: 'Portfolio',
    description: 'A cinematic portfolio for creators with an editorial feel.',
    prompt: 'Create a premium portfolio website for a motion designer with a dark editorial aesthetic, immersive hero, reel showcase, testimonials, and a booking CTA.',
    badge: 'Preview',
  },
  {
    id: 'atlas',
    name: 'Atlas Commerce',
    category: 'E-commerce',
    description: 'High-converting storefront with strong product storytelling.',
    prompt: 'Build a premium e-commerce website for a luxury skincare brand with a bold hero, featured products, testimonials, shipping highlights, and a seamless checkout experience.',
    badge: 'Preview',
  },
  {
    id: 'pulse',
    name: 'Pulse Labs',
    category: 'SaaS',
    description: 'Modern SaaS landing page with product-led storytelling.',
    prompt: 'Design a high-end SaaS landing page for an AI productivity app with product demo, usage metrics, pricing, and a strong free-trial CTA.',
    badge: 'Preview',
  },
  {
    id: 'horizon',
    name: 'Horizon Academy',
    category: 'Education',
    description: 'Bright, trustworthy learning experience for online courses.',
    prompt: 'Create a polished education website for an online learning platform with course cards, tutor profiles, outcomes, reviews, and an enrollment CTA.',
    badge: 'Preview',
  },
  {
    id: 'ignite',
    name: 'Ignite Gym',
    category: 'Gym',
    description: 'Energetic fitness brand experience with a strong conversion flow.',
    prompt: 'Create a high-energy gym website for a modern fitness studio with class schedules, trainer highlights, membership tiers, and a book-now CTA.',
    badge: 'Preview',
  },
  {
    id: 'atelier',
    name: 'Atelier Bistro',
    category: 'Restaurant',
    description: 'Warm, delicious restaurant experience with instant reservations.',
    prompt: 'Make a premium restaurant website for a contemporary bistro with a hero menu, chef story, gallery, reservation flow, and a brunch specials section.',
    badge: 'Preview',
  },
];

function cleanMarkdownText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*---+\s*$/gm, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function parseBlueprintSections(text: string) {
  const cleaned = cleanMarkdownText(text);
  const sectionTitles = ['Core Concept', 'Layout & User Experience', 'Suggested Sections', 'Color Palette', 'Key Features', 'CTA Copy', 'Starter Code Idea'];
  const lines = cleaned.split('\n');
  const sections: Array<{ title: string; content: string[] }> = [];
  let currentTitle = 'Core Concept';
  let currentLines: string[] = [];

  const pushSection = () => {
    const content = currentLines.filter(Boolean);
    if (content.length > 0) {
      sections.push({ title: currentTitle, content });
    }
  };

  lines.forEach((line) => {
    const normalized = line.trim();
    const matchedTitle = sectionTitles.find((title) => normalized.toLowerCase() === title.toLowerCase() || normalized.toLowerCase().startsWith(`${title.toLowerCase()}:`) || normalized.toLowerCase().startsWith(`${title.toLowerCase()} -`));

    if (matchedTitle) {
      pushSection();
      currentTitle = matchedTitle;
      currentLines = [];
      return;
    }

    currentLines.push(normalized);
  });

  pushSection();

  if (sections.length === 0) {
    return [{ title: 'Core Concept', content: [cleaned] }];
  }

  return sections;
}

export default function WebsiteBuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'All') return templates;
    return templates.filter((template) => template.category === selectedCategory);
  }, [selectedCategory]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const response = await fetch('/api/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setOutput(data.output || data.result || 'No blueprint returned.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  function handleTemplateSelect(template: Template) {
    setInput(template.prompt);
    setSelectedCategory(template.category);
    setError(null);
    setOutput(null);
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-cyan-400/20 bg-white/10 p-6 shadow-[0_0_80px_rgba(34,211,238,0.14)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">AI Website Builder</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Launch a stunning website in minutes.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Pick a category, use a premium template, and let the studio design a refined website blueprint with sections, palette, features, and a launch-ready CTA.
              </p>
            </div>
            <div className="rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-cyan-500/15 to-violet-500/15 px-5 py-4 text-sm text-slate-100 shadow-lg shadow-cyan-950/30">
              <div className="font-semibold text-white">Hackathon-ready product feel</div>
              <div className="mt-1 text-slate-300">Premium UI • Smart prompts • Live preview</div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-3 py-2 text-sm transition ${selectedCategory === category ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:text-white'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="group rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/80 p-4 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-cyan-200">
                        {template.badge}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                        {template.category}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{template.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{template.description}</p>
                    <button
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-lg font-semibold text-white" htmlFor="website-input">
                  Describe your website vision
                </label>
                <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-fuchsia-200">
                  AI prompt studio
                </span>
              </div>
              <textarea
                id="website-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: A premium dark website for a modern AI consultancy with clear hero messaging, pricing, testimonials, and a book-a-call CTA."
                className="mt-4 min-h-[230px] w-full rounded-[24px] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              />
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'AI is building your website...' : 'Generate Website'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    setOutput(null);
                    setError(null);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Live Preview</h2>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-200">
                  Live
                </span>
              </div>
              <div className="mt-5 rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 shadow-inner shadow-cyan-950/30">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                    <span>{selectedCategory === 'All' ? 'Launchpad' : selectedCategory}</span>
                    <span>Preview</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-3 w-2/3 rounded-full bg-cyan-400/80" />
                    <div className="h-3 w-1/2 rounded-full bg-violet-500/80" />
                    <div className="h-3 w-3/4 rounded-full bg-white/25" />
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {['Hero', 'Features', 'CTA'].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                        <div className="text-sm font-medium text-white">{item}</div>
                        <div className="mt-2 text-xs leading-6 text-slate-400">Premium section block</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-[20px] border border-white/10 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 p-4">
                    <div className="text-sm font-medium text-cyan-200">Hero Copy</div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {input.trim() ? `${input.slice(0, 80)}${input.length > 80 ? '…' : ''}` : 'Your future landing page begins here.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Website Blueprint Output</h2>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-cyan-200">
                  Generated
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                {loading && <p className="text-cyan-200">AI is building your website...</p>}
                {error && <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-4 text-rose-200">{error}</div>}
                {!loading && !error && !output && <p className="text-slate-500">Your polished blueprint will appear here once you generate it.</p>}
                {output && (() => {
                  const sections = parseBlueprintSections(output);
                  return (
                    <div className="space-y-4">
                      {sections.map((section) => {
                        const items = section.content.filter((entry) => entry.startsWith('•'));
                        const body = section.content.filter((entry) => !entry.startsWith('•'));
                        const isColorPalette = section.title === 'Color Palette';
                        const isList = items.length > 0 || section.title === 'Suggested Sections' || section.title === 'Key Features';

                        return (
                          <div key={section.title} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">{section.title}</h3>
                            {isColorPalette ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {section.content.map((entry) => (
                                  <span key={entry} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                                    {entry.replace(/^•\s*/, '')}
                                  </span>
                                ))}
                              </div>
                            ) : isList ? (
                              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                {(items.length > 0 ? items : section.content).map((entry) => (
                                  <li key={entry} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                    {entry.replace(/^•\s*/, '')}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                {body.map((entry) => (
                                  <p key={entry}>{entry}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
