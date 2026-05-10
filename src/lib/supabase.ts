import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Note = {
  id: string
  title: string
  content: string
  created_at: string
}

export type Question = {
  id: string
  note_id: string
  question: string
  answer: string
  created_at: string
}

export type NoteWithQuestions = Note & {
  questions: Question[]
}
