import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Create a practical dream goal roadmap. Format the response clearly with sections: Gujarati Goal Roadmap, Daily Tasks, Habit Tracker, Motivation. Keep the tone inspiring and actionable. Goal: ${prompt}`,
    });

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error('Dream API error:', error);
    return NextResponse.json({ error: 'Failed to generate dream plan.' }, { status: 500 });
  }
}
