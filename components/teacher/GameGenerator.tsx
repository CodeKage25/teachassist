'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { generateQuiz, type QuizData, type QuizQuestion } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Sparkles,
  Play,
  ChevronRight,
  Trophy,
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

type Phase = 'setup' | 'ready' | 'playing' | 'results'

interface AnswerState {
  selected: number | null
  revealed: boolean
}

// ─── Option label helpers ─────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

function getOptionStyle(
  idx: number,
  answer: AnswerState,
  correctIndex: number
): string {
  const base =
    'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 '

  if (!answer.revealed) {
    return base + 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
  }

  if (idx === correctIndex) {
    return base + 'border-emerald-500 bg-emerald-50 text-emerald-800 cursor-default'
  }
  if (idx === answer.selected) {
    return base + 'border-red-400 bg-red-50 text-red-800 cursor-default'
  }
  return base + 'border-slate-100 bg-slate-50 text-slate-400 cursor-default'
}

// ─── Sub-components ───────────────────────────────────────────

function SetupForm({
  onGenerate,
}: {
  onGenerate: (quiz: QuizData) => void
}) {
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [questionCount, setQuestionCount] = useState('5')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim() || !subject.trim() || !gradeLevel) {
      toast.error('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const result = await generateQuiz({
        topic: topic.trim(),
        subject: subject.trim(),
        gradeLevel,
        questionCount: Number(questionCount),
      })
      if (result.error || !result.quiz) {
        toast.error(result.error ?? 'Failed to generate quiz.')
        return
      }
      onGenerate(result.quiz)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-xl mx-auto shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-800">Create a Quiz</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Fill in the details and let AI do the work</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-slate-700 font-medium">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. Mathematics, Biology, History"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              className="border-slate-200 focus:border-blue-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-slate-700 font-medium">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. Photosynthesis, World War II, Fractions"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="border-slate-200 focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium">Grade Level</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={loading}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="K-2">K-2 (Ages 5-8)</SelectItem>
                  <SelectItem value="3-5">3-5 (Ages 8-11)</SelectItem>
                  <SelectItem value="6-8">6-8 (Ages 11-14)</SelectItem>
                  <SelectItem value="9-12">9-12 (Ages 14-18)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-medium">Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount} disabled={loading}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="7">7 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function ReadyScreen({
  quiz,
  onStart,
  onReset,
}: {
  quiz: QuizData
  onStart: () => void
  onReset: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-blue-100 text-sm mb-5">Your quiz is ready to play!</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-3 py-1">
              {quiz.questions.length} Questions
            </Badge>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onStart}
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 shadow-md"
            >
              <Play className="w-4 h-4 mr-2 fill-blue-700" />
              Start Quiz
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10 bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Quiz
            </Button>
          </div>
        </div>
      </Card>

      {/* Question preview */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            Question Preview
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-2">
          {quiz.questions.map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Badge
                variant="outline"
                className="text-xs min-w-[2rem] justify-center text-slate-500 border-slate-200 shrink-0 mt-0.5"
              >
                {i + 1}
              </Badge>
              <p className="text-sm text-slate-700 leading-snug">{q.question}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  isLast,
  score,
}: {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (correct: boolean) => void
  onNext: () => void
  isLast: boolean
  score: number
}) {
  const [answer, setAnswer] = useState<AnswerState>({ selected: null, revealed: false })

  function handleSelect(idx: number) {
    if (answer.revealed) return
    const correct = idx === question.correctIndex
    setAnswer({ selected: idx, revealed: true })
    onAnswer(correct)
  }

  const progress = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress header */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
        <span className="font-medium text-slate-700">Question {questionNumber} of {totalQuestions}</span>
        <span className="font-semibold text-blue-600">{score} correct</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-7 text-white">
          <p className="text-lg font-semibold leading-relaxed">{question.question}</p>
        </div>
        <CardContent className="p-5 space-y-3 bg-slate-50">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={getOptionStyle(idx, answer, question.correctIndex)}
              disabled={answer.revealed}
            >
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {OPTION_LABELS[idx]}
              </span>
              <span className="flex-1 text-left">{option}</span>
              {answer.revealed && idx === question.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {answer.revealed && idx === answer.selected && idx !== question.correctIndex && (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Explanation */}
      {answer.revealed && (
        <Card className="border-0 bg-amber-50 shadow-sm">
          <CardContent className="py-4 px-5 flex gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold">Explanation: </span>
              {question.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {answer.revealed && (
        <div className="flex justify-end">
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 shadow-md"
          >
            {isLast ? 'See Results' : 'Next Question'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

function ResultsScreen({
  score,
  total,
  onPlayAgain,
  onNewQuiz,
}: {
  score: number
  total: number
  onPlayAgain: () => void
  onNewQuiz: () => void
}) {
  const pct = Math.round((score / total) * 100)

  const { emoji, label, colorClass } =
    pct >= 90
      ? { emoji: '🏆', label: 'Outstanding!', colorClass: 'from-yellow-400 to-amber-500' }
      : pct >= 70
      ? { emoji: '🌟', label: 'Great job!', colorClass: 'from-emerald-400 to-teal-500' }
      : pct >= 50
      ? { emoji: '👍', label: 'Good effort!', colorClass: 'from-blue-400 to-indigo-500' }
      : { emoji: '💪', label: 'Keep practicing!', colorClass: 'from-slate-400 to-slate-500' }

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className={`bg-gradient-to-br ${colorClass} p-10 text-white`}>
          <div className="text-6xl mb-3">{emoji}</div>
          <h2 className="text-3xl font-bold mb-1">{label}</h2>
          <p className="text-white/80 text-sm mb-6">Quiz complete</p>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 space-y-2">
            <p className="text-5xl font-black">{pct}%</p>
            <p className="text-white/90 text-sm font-medium">
              {score} correct out of {total} questions
            </p>
          </div>
        </div>
        <CardContent className="p-6 bg-white space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Correct</span>
              </div>
              <p className="text-3xl font-bold text-emerald-700">{score}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Wrong</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{total - score}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onPlayAgain}
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button
              onClick={onNewQuiz}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span>Share this quiz with your class!</span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────

export function GameGenerator() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  // key forces QuestionCard to remount (reset local answer state) between questions
  const [questionKey, setQuestionKey] = useState(0)

  function handleGenerated(generatedQuiz: QuizData) {
    setQuiz(generatedQuiz)
    setPhase('ready')
  }

  function handleStart() {
    setCurrentIndex(0)
    setScore(0)
    setQuestionKey((k) => k + 1)
    setPhase('playing')
  }

  function handleAnswer(correct: boolean) {
    if (correct) setScore((s) => s + 1)
  }

  function handleNext() {
    const nextIndex = currentIndex + 1
    if (nextIndex >= (quiz?.questions.length ?? 0)) {
      setPhase('results')
    } else {
      setCurrentIndex(nextIndex)
      setQuestionKey((k) => k + 1)
    }
  }

  function handlePlayAgain() {
    handleStart()
  }

  function handleNewQuiz() {
    setQuiz(null)
    setPhase('setup')
  }

  return (
    <div className="py-2">
      {phase === 'setup' && <SetupForm onGenerate={handleGenerated} />}

      {phase === 'ready' && quiz && (
        <ReadyScreen quiz={quiz} onStart={handleStart} onReset={handleNewQuiz} />
      )}

      {phase === 'playing' && quiz && (
        <QuestionCard
          key={questionKey}
          question={quiz.questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={quiz.questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLast={currentIndex === quiz.questions.length - 1}
          score={score}
        />
      )}

      {phase === 'results' && (
        <ResultsScreen
          score={score}
          total={quiz?.questions.length ?? 0}
          onPlayAgain={handlePlayAgain}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  )
}
