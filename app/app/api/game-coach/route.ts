import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey: process.env.MESH_API_KEY,
      baseURL: 'https://api.meshapi.ai/v1',
    });

    const response = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI Game Coach for Avi Patel Game Hub. Give short useful gaming tips in Gujarati-English mix.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0]?.message?.content || 'No answer generated.',
    });
  } catch (error) {
    console.error('Mesh Game Coach error:', error);
    return NextResponse.json({ error: 'Mesh AI Game Coach failed.' }, { status: 500 });
  }
}