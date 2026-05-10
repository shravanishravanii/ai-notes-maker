import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/notes — fetch all notes with their questions
export async function GET() {
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (notesError) {
    return NextResponse.json({ error: notesError.message }, { status: 500 })
  }

  // Fetch questions for each note
  const notesWithQuestions = await Promise.all(
    notes.map(async (note) => {
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('note_id', note.id)
        .order('created_at', { ascending: true })

      return { ...note, questions: questions || [] }
    })
  )

  return NextResponse.json(notesWithQuestions)
}

// POST /api/notes — save a new note
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, content } = body

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({ title, content })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
