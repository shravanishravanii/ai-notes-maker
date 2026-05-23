import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PROMPTS: Record<string, string> = {
  short: `Read the following study notes and generate exactly 5 short-answer questions.
Rules: Each answer must be MAXIMUM 5 sentences. Be concise and direct. No long explanations.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"type":"short","question":"...","answer":"..."}]
Study notes:\n`,

  long: `Read the following study notes and generate exactly 3 long-answer questions.
Rules: Each answer must be MINIMUM 5-6 sentences with detailed explanation, examples, and context. Do not give short answers under any circumstance.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"type":"long","question":"...","answer":"..."}]
Study notes:\n`,

  mcq: `Read the following study notes and generate exactly 5 multiple choice questions. Each must have 4 options (a, b, c, d) and one correct answer.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"type":"mcq","question":"...","options":{"a":"...","b":"...","c":"...","d":"..."},"answer":"a"}]
Study notes:\n`,

  flashcard: `Read the following study notes and generate exactly 6 flashcards — short term on the front, concise definition or fact on the back.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"type":"flashcard","question":"Term or concept","answer":"Definition or key fact"}]
Study notes:\n`,
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { note_id, content, mode = 'short' } = body

  if (!note_id || !content) {
    return NextResponse.json({ error: 'note_id and content are required' }, { status: 400 })
  }

  try {
    const prompt = PROMPTS[mode] + content

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text.trim()
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const questionsToInsert = parsed.map((item: Record<string, unknown>) => ({
      note_id,
      question: item.question,
      answer: typeof item.answer === 'string' ? item.answer : JSON.stringify(item.answer),
      type: mode,
      options: item.options ? JSON.stringify(item.options) : null,
    }))

    const { data: saved, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Failed to generate. Try again.' }, { status: 500 })
  }
}