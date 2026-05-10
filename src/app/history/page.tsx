'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NoteWithQuestions } from '@/lib/supabase'
import QuestionCard from '@/components/QuestionCard'

export default function HistoryPage() {
  const [notes, setNotes] = useState<NoteWithQuestions[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes')
        const data = await res.json()
        setNotes(data)
        if (data.length > 0) setExpanded(data[0].id)
      } catch (err) {
        console.error('Failed to fetch notes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="font-semibold text-gray-800">StudyNotes AI</span>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          ← New notes
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">History</h1>
          <p className="text-gray-500 text-sm">All your past notes and generated questions.</p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading your notes...</p>
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-400 text-sm mb-4">No notes yet.</p>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Generate your first set of questions →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              {/* Note header */}
              <button
                onClick={() =>
                  setExpanded(expanded === note.id ? null : note.id)
                }
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h2 className="font-semibold text-gray-800 text-sm">
                    {note.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(note.created_at)} · {note.questions.length} questions
                  </p>
                </div>
                <span className="text-gray-400 text-lg">
                  {expanded === note.id ? '−' : '+'}
                </span>
              </button>

              {/* Expanded: note content + questions */}
              {expanded === note.id && (
                <div className="border-t border-gray-100 px-6 py-5">
                  {/* Original note preview */}
                  <div className="mb-5 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                      Original notes
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                      {note.content}
                    </p>
                  </div>

                  {/* Questions */}
                  {note.questions.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">
                        Generated questions
                      </p>
                      <div className="flex flex-col gap-3">
                        {note.questions.map((q, i) => (
                          <QuestionCard key={q.id} question={q} index={i} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No questions saved for this note.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
