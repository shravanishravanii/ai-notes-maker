import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// POST /api/generate — generate questions from note content
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { note_id, content } = body

  if (!note_id || !content) {
    return NextResponse.json(
      { error: 'note_id and content are required' },
      { status: 400 }
    )
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a study assistant. Read the following study notes and generate exactly 5 question-answer pairs that test understanding of the key concepts.

Return ONLY a valid JSON array with no extra text, no markdown, no code blocks. Format:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]

Study notes:
${content}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    // Clean response in case Gemini wraps in markdown
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const qaPairs: { question: string; answer: string }[] = JSON.parse(cleaned)

    // Save each question to Supabase
    const questionsToInsert = qaPairs.map((pair) => ({
      note_id,
      question: pair.question,
      answer: pair.answer,
    }))

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json(
      { error: 'Failed to generate questions. Check your Gemini API key.' },
      { status: 500 }
    )
  }
}
