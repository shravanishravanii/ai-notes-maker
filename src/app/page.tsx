'use client'

import { useState } from 'react'
import Link from 'next/link'

type QuestionType = 'short' | 'long' | 'mcq' | 'flashcard'

type QAItem = {
  id: string
  type: string
  question: string
  answer: string
  options?: string
}

const MODES: { id: QuestionType; label: string; desc: string; emoji: string }[] = [
  { id: 'short', label: 'Short Answer', desc: '5 concise Q&As', emoji: '✏️' },
  { id: 'long',  label: 'Long Answer',  desc: '3 detailed explanations', emoji: '📝' },
  { id: 'mcq',   label: 'MCQs',         desc: '5 multiple choice', emoji: '🔘' },
  { id: 'flashcard', label: 'Flashcards', desc: '6 term & definition cards', emoji: '🃏' },
]

function ShortCard({ item, index }: { item: QAItem; index: number }) {
  const [show, setShow] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-sm font-medium flex items-center justify-center">{index + 1}</span>
        <div className="flex-1">
          <p className="text-gray-800 font-medium text-sm leading-relaxed">{item.question}</p>
          {show && <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg"><p className="text-green-800 text-sm leading-relaxed">{item.answer}</p></div>}
          <button onClick={() => setShow(!show)} className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800">{show ? 'Hide answer' : 'Show answer'}</button>
        </div>
      </div>
    </div>
  )
}

function LongCard({ item, index }: { item: QAItem; index: number }) {
  const [show, setShow] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-50 text-purple-600 text-sm font-medium flex items-center justify-center">{index + 1}</span>
        <div className="flex-1">
          <p className="text-gray-800 font-medium text-sm leading-relaxed">{item.question}</p>
          {show && <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg"><p className="text-purple-900 text-sm leading-relaxed">{item.answer}</p></div>}
          <button onClick={() => setShow(!show)} className="mt-3 text-xs font-medium text-purple-600 hover:text-purple-800">{show ? 'Hide answer' : 'Show answer'}</button>
        </div>
      </div>
    </div>
  )
}

function MCQCard({ item, index }: { item: QAItem; index: number }) {
  const [selected, setSelected] = useState<string | null>(null)
  const options = item.options ? JSON.parse(item.options) : {}
  const correct = item.answer
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-50 text-orange-600 text-sm font-medium flex items-center justify-center">{index + 1}</span>
        <div className="flex-1">
          <p className="text-gray-800 font-medium text-sm leading-relaxed mb-3">{item.question}</p>
          <div className="flex flex-col gap-2">
            {Object.entries(options).map(([key, val]) => {
              let bg = 'border-gray-200 hover:border-gray-300 bg-white'
              if (selected) {
                if (key === correct) bg = 'border-green-400 bg-green-50'
                else if (key === selected) bg = 'border-red-400 bg-red-50'
              }
              return (
                <button key={key} onClick={() => !selected && setSelected(key)}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${bg}`}>
                  <span className="font-medium uppercase mr-2">{key}.</span>{val as string}
                </button>
              )
            })}
          </div>
          {selected && <p className="mt-2 text-xs text-gray-500">Correct answer: <span className="font-semibold uppercase">{correct}</span></p>}
        </div>
      </div>
    </div>
  )
}

function FlashCard({ item }: { item: QAItem }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div onClick={() => setFlipped(!flipped)} className="cursor-pointer rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors min-h-[120px] flex items-center justify-center p-5 bg-white">
      {!flipped
        ? <div className="text-center"><p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Term</p><p className="text-gray-800 font-semibold text-sm">{item.question}</p></div>
        : <div className="text-center"><p className="text-xs text-blue-400 mb-2 uppercase tracking-wide">Definition</p><p className="text-blue-900 text-sm leading-relaxed">{item.answer}</p></div>
      }
    </div>
  )
}

export default function Home() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<QuestionType>('short')
  const [results, setResults] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!title.trim() || !content.trim()) { setError('Please enter both a title and some notes.'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const noteRes = await fetch('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (!noteRes.ok) throw new Error((await noteRes.json()).error || 'Failed to save note')
      const note = await noteRes.json()

      const genRes = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, content, mode }),
      })
      if (!genRes.ok) throw new Error((await genRes.json()).error || 'Failed to generate')
      setResults(await genRes.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">AI</span></div>
          <span className="font-semibold text-gray-800">StudyNotes AI</span>
        </div>
        <Link href="/history" className="text-sm text-gray-500 hover:text-gray-800 font-medium">View history →</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate questions from your notes</h1>
          <p className="text-gray-500 text-sm">Choose a question type, paste your notes, and let AI do the rest.</p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-colors ${mode === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <span className="text-xl">{m.emoji}</span>
              <span className={`text-xs font-semibold ${mode === m.id ? 'text-blue-700' : 'text-gray-700'}`}>{m.label}</span>
              <span className="text-xs text-gray-400 leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems — Process Scheduling"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your notes</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Paste or type your study notes here..." rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg"><p className="text-red-600 text-sm">{error}</p></div>}
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'Generating...' : `Generate ${MODES.find(m => m.id === mode)?.label}`}
            </button>
            {(results.length > 0 || title || content) && (
              <button onClick={() => { setTitle(''); setContent(''); setResults([]); setError('') }}
                className="px-4 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-lg text-sm">Reset</button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Generating {MODES.find(m => m.id === mode)?.label.toLowerCase()}...</p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">{results.length} {MODES.find(m => m.id === mode)?.label} generated</h2>
              <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">Saved to history</span>
            </div>
            {mode === 'flashcard'
              ? <div className="grid grid-cols-2 gap-3">{results.map(r => <FlashCard key={r.id} item={r} />)}</div>
              : <div className="flex flex-col gap-3">
                  {results.map((r, i) =>
                    mode === 'mcq' ? <MCQCard key={r.id} item={r} index={i} /> :
                    mode === 'long' ? <LongCard key={r.id} item={r} index={i} /> :
                    <ShortCard key={r.id} item={r} index={i} />
                  )}
                </div>
            }
            <div className="mt-6 text-center">
              <Link href="/history" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all past notes →</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}