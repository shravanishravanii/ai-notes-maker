'use client'

import { useState } from 'react'
import { Question } from '@/lib/supabase'

type Props = {
  question: Question
  index: number
}

export default function QuestionCard({ question, index }: Props) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-sm font-medium flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-gray-800 font-medium text-sm leading-relaxed">
            {question.question}
          </p>

          {showAnswer && (
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-green-800 text-sm leading-relaxed">
                {question.answer}
              </p>
            </div>
          )}

          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showAnswer ? 'Hide answer' : 'Show answer'}
          </button>
        </div>
      </div>
    </div>
  )
}
