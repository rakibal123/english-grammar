'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, Clock, Zap
} from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

interface Question {
  _id: string;
  type: string;
  questionText: string;
  banglaText?: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string;
  banglaExplanation?: string;
  difficulty: string;
}

interface TestSet {
  _id: string;
  title: string;
  topicId: string;
}

interface UserAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  correctAnswer?: string;
  explanation?: string;
  banglaExplanation?: string;
}

type QuizPhase = 'loading' | 'quiz' | 'review' | 'result';

export default function QuizClient({ testSetId }: { testSetId: string }) {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [testSet, setTestSet] = useState<TestSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [fillInput, setFillInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [result, setResult] = useState<{ percentage: number; correctCount: number; incorrectCount: number; xpEarned: number; attemptId: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [effectiveUserId, setEffectiveUserId] = useState(userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          const userRes = await fetch('/api/guest');
          if (userRes.ok) {
            const user = await userRes.json();
            setEffectiveUserId(user.id);
          }
        }

        const res = await fetch(`/api/testsets/${testSetId}`);
        if (res.ok) {
          const data = await res.json();
          setTestSet(data.testSet);
          setQuestions(data.questions);
          setStartTime(Date.now());
          setPhase('quiz');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [testSetId, userId]);

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const isFillBlank = currentQuestion?.type === 'FILL_BLANK';

  const handleAnswer = useCallback((answer: string) => {
    if (revealed) return;
    setSelectedOption(answer);
  }, [revealed]);

  const handleReveal = useCallback(() => {
    const answer = isFillBlank ? fillInput : selectedOption;
    if (!answer.trim()) return;

    const question = currentQuestion;
    const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])];
    const isCorrect = accepted.some(
      (a: string) => a.trim().toLowerCase() === answer.trim().toLowerCase()
    );

    setAnswers(prev => ({
      ...prev,
      [question._id]: {
        questionId: question._id,
        userAnswer: answer,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        banglaExplanation: question.banglaExplanation,
      },
    }));
    setRevealed(true);
  }, [currentQuestion, fillInput, isFillBlank, selectedOption]);

  const handleNext = useCallback(() => {
    setSelectedOption('');
    setFillInput('');
    setRevealed(false);

    if (isLastQuestion) {
      setPhase('review');
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  }, [isLastQuestion]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const submitAnswers = Object.values(answers).map(a => ({
      questionId: a.questionId,
      userAnswer: a.userAnswer,
    }));

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          testSetId,
          topicId: testSet?.topicId,
          answers: submitAnswers,
          timeTaken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setPhase('result');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 'result' && result) {
    const score = result.percentage;
    const scoreColor = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626';
    const scoreBg = score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2';

    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: scoreBg, color: scoreColor }}>
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[#0B1C30] mb-2">Test Complete!</h1>
          <p className="text-[#76777D]">{testSet?.title}</p>
        </div>

        <div className="card mb-6 text-center">
          <p className="text-6xl font-bold mb-2" style={{ color: scoreColor }}>{score}%</p>
          <ProgressBar value={score} color={scoreColor} height="h-3" className="mb-4" />
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8EAEE]">
            <div>
              <p className="text-2xl font-bold text-green-600">{result.correctCount}</p>
              <p className="text-xs text-[#76777D]">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{result.incorrectCount}</p>
              <p className="text-xs text-[#76777D]">Incorrect</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#4F46E5] flex items-center justify-center gap-1">
                <Zap className="w-5 h-5" />{result.xpEarned}
              </p>
              <p className="text-xs text-[#76777D]">XP Earned</p>
            </div>
          </div>
        </div>

        {/* Review mistakes */}
        {result.incorrectCount > 0 && (
          <div className="card mb-4 border-red-100">
            <h3 className="font-semibold text-[#0B1C30] mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Review Your Mistakes ({result.incorrectCount})
            </h3>
            <div className="space-y-4">
              {Object.values(answers).filter(a => !a.isCorrect).map((a, i) => {
                const q = questions.find(q => q._id === a.questionId);
                if (!q) return null;
                return (
                  <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-[#0B1C30] mb-2">{q.questionText}</p>
                    <p className="text-xs text-red-600">Your answer: <strong>{a.userAnswer}</strong></p>
                    <p className="text-xs text-green-700">Correct: <strong>{a.correctAnswer}</strong></p>
                    <p className="text-xs text-[#76777D] mt-1.5 italic">{a.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setCurrentIdx(0);
              setAnswers({});
              setSelectedOption('');
              setFillInput('');
              setRevealed(false);
              setStartTime(Date.now());
              setResult(null);
              setPhase('quiz');
            }}
            className="btn-secondary flex-1"
          >
            Try Again
          </button>
          <Link href="/learn" className="btn-primary flex-1 text-center">
            Continue Learning
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'review') {
    const answeredCount = Object.keys(answers).length;
    const unanswered = questions.length - answeredCount;

    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[#0B1C30] mb-2">Review Answers</h2>
        <p className="text-sm text-[#76777D] mb-6">
          {answeredCount} of {questions.length} answered
          {unanswered > 0 && ` • ${unanswered} skipped`}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, i) => {
            const a = answers[q._id];
            return (
              <button
                key={q._id}
                onClick={() => { setCurrentIdx(i); setPhase('quiz'); setRevealed(!!a); setSelectedOption(a?.userAnswer || ''); }}
                className={`w-9 h-9 rounded-lg text-xs font-bold border-2 transition-colors ${
                  !a ? 'border-[#E8EAEE] text-[#76777D]' :
                  a.isCorrect ? 'border-green-500 bg-green-50 text-green-700' :
                  'border-red-400 bg-red-50 text-red-700'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-3 text-base"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  // Quiz phase
  if (!currentQuestion) return null;
  const answered = answers[currentQuestion._id];
  const isRevealed = revealed || !!answered;
  const userAnswer = answered?.userAnswer || selectedOption;
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/learn" className="text-[#76777D] hover:text-[#0B1C30] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-[#76777D] mb-1">
            <span>{testSet?.title}</span>
            <span>{currentIdx + 1}/{questions.length}</span>
          </div>
          <ProgressBar value={progress} height="h-1.5" />
        </div>
        <div className="flex items-center gap-1 text-[#76777D] text-xs">
          <Clock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Question card */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            currentQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
            'bg-amber-100 text-amber-700'
          }`}>
            {currentQuestion.difficulty}
          </span>
          <span className="text-[10px] text-[#76777D] uppercase tracking-wider">{currentQuestion.type.replace('_', ' ')}</span>
        </div>

        <h2 className="text-[#0B1C30] font-semibold text-lg leading-relaxed mb-1">
          {currentQuestion.questionText}
        </h2>
        {currentQuestion.banglaText && (
          <p className="text-sm text-[#76777D] mb-4">{currentQuestion.banglaText}</p>
        )}

        {/* MCQ */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-2 mt-4">
            {currentQuestion.options.map((opt: string, i: number) => {
              const label = String.fromCharCode(65 + i);
              let optClass = 'quiz-option';
              if (isRevealed) {
                if (opt === currentQuestion.correctAnswer) optClass += ' correct';
                else if (opt === userAnswer && opt !== currentQuestion.correctAnswer) optClass += ' incorrect';
                else optClass += ' opacity-60';
              } else if (opt === selectedOption) {
                optClass += ' selected';
              }

              return (
                <button
                  key={opt}
                  onClick={() => !isRevealed && handleAnswer(opt)}
                  disabled={isRevealed}
                  className={optClass}
                >
                  <span className="w-6 h-6 rounded-md bg-[#F8F9FF] border border-[#E8EAEE] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {label}
                  </span>
                  {opt}
                  {isRevealed && opt === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                  {isRevealed && opt === userAnswer && opt !== currentQuestion.correctAnswer && (
                    <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill blank */}
        {isFillBlank && (
          <div className="mt-4">
            <input
              type="text"
              value={isRevealed ? (answered?.userAnswer || fillInput) : fillInput}
              onChange={e => !isRevealed && setFillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isRevealed && handleReveal()}
              disabled={isRevealed}
              placeholder="Type your answer..."
              className={`input-field ${isRevealed ? (answered?.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : ''}`}
            />
            {isRevealed && (
              <p className="text-sm text-[#76777D] mt-1">
                Correct: <strong className="text-green-700">{currentQuestion.correctAnswer}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {isRevealed && (
        <div className={`card mb-4 border-l-4 ${answered?.isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-400 bg-red-50'}`}>
          <div className="flex items-start gap-2">
            {answered?.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm mb-1">
                {answered?.isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-sm text-[#45464D]">{currentQuestion.explanation}</p>
              {currentQuestion.banglaExplanation && (
                <p className="text-sm text-[#76777D] mt-1">{currentQuestion.banglaExplanation}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isRevealed ? (
          <button
            onClick={handleReveal}
            disabled={!selectedOption && !fillInput.trim()}
            className="btn-primary flex-1 py-3"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary flex-1 py-3"
          >
            {isLastQuestion ? 'Review Answers' : 'Next Question'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {!isRevealed && (
          <button onClick={handleNext} className="btn-ghost px-4 py-3">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
