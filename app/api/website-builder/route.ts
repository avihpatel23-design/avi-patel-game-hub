import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
      return Response.json({ error: 'Idea is required.' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a senior product designer and web strategist. Create a premium website blueprint for this idea. Include layout, sections, color theme, content, features, CTA copy, and starter code idea. Keep it concise but useful. Idea: ${idea}`,
    });

    const output = typeof response.text === 'string' ? response.text : 'No blueprint generated.';
    return Response.json({ output });
  } catch (error) {
    console.error('Website Builder API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate website blueprint.';
    return Response.json({ error: message }, { status: 500 });
  }
}
