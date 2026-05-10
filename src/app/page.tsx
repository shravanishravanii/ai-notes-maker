'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Question } from '@/lib/supabase'
import QuestionCard from '@/components/QuestionCard'

export default function Home() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both a title and some notes.')
      return
    }

    setLoading(true)
    setError('')
    setQuestions([])
    setSavedNoteId(null)

    try {
      // Step 1: Save the note
      const noteRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (!noteRes.ok) {
        const err = await noteRes.json()
        throw new Error(err.error || 'Failed to save note')
      }

      const note = await noteRes.json()
      setSavedNoteId(note.id)

      // Step 2: Generate questions from saved note
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, content }),
      })

      if (!genRes.ok) {
        const err = await genRes.json()
        throw new Error(err.error || 'Failed to generate questions')
      }

      const generated = await genRes.json()
      setQuestions(generated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setContent('')
    setQuestions([])
    setError('')
    setSavedNoteId(null)
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
          href="/history"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          View history →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Generate questions from your notes
          </h1>
          <p className="text-gray-500 text-sm">
            Paste your study notes below. AI will generate 5 Q&A pairs to help you revise.
          </p>
        </div>

        {/* Input form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Topic title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems — Process Scheduling"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your notes
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your study notes here..."
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Generating...' : 'Generate questions'}
            </button>
            {(questions.length > 0 || title || content) && (
              <button
                onClick={handleReset}
                className="px-4 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-lg text-sm transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Saving note and generating questions...</p>
          </div>
        )}

        {/* Results */}
        {questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                {questions.length} questions generated
              </h2>
              {savedNoteId && (
                <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  Saved to history
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <QuestionCard key={q.id} question={q} index={i} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/history"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all past notes →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
