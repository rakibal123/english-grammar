'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Trophy, Target, Flame, Zap, BookOpen, AlertCircle } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import MasteryBadge from '@/components/ui/MasteryBadge';

interface ProgressItem {
  topicId: { _id: string; title: string; slug: string; color: string; order: number };
  completion: number;
  mastery: number;
  masteryLevel: string;
  testsCompleted: number;
  averageScore: number;
  bestScore: number;
  mistakeCount: number;
}

interface MistakeItem {
  _id: string;
  topicId: { title: string };
  questionId: { questionText: string; correctAnswer: string };
  userAnswer: string;
  attemptCount: number;
}

interface UserData {
  id: string;
  username: string;
  xp: number;
  currentStreak: number;
  longestStreak: number;
}

export default function ProgressClient() {
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/guest');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          const [progressRes, mistakesRes] = await Promise.all([
            fetch(`/api/progress?userId=${userData.id}`),
            fetch(`/api/mistakes?userId=${userData.id}`),
          ]);

          if (progressRes.ok) setProgress(await progressRes.json());
          if (mistakesRes.ok) setMistakes(await mistakesRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const masteredCount = progress.filter(p => p.masteryLevel === 'mastered').length;
  const overallCompletion = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.completion, 0) / 12)
    : 0;
  const totalTests = progress.reduce((s, p) => s + p.testsCompleted, 0);
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + p.averageScore, 0) / progress.filter(p => p.testsCompleted > 0).length || 0)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1C30] mb-1">Your Progress</h1>
        <p className="text-sm text-[#76777D]">Track your grammar mastery journey</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Overall', value: `${overallCompletion}%`, icon: TrendingUp, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
          { label: 'Mastered', value: `${masteredCount}/12`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Tests Done', value: totalTests, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: Zap, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card py-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-[#0B1C30]">{value}</p>
            <p className="text-xs text-[#76777D]">{label}</p>
          </div>
        ))}
      </div>

      {/* Streak */}
      <div className="card mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <p className="font-bold text-[#0B1C30]">
            {user?.currentStreak ?? 0} day streak
          </p>
          <p className="text-sm text-[#76777D]">Best: {user?.longestStreak ?? 0} days</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-bold text-[#4F46E5]">{user?.xp ?? 0} XP</p>
          <p className="text-xs text-[#76777D]">Total earned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8EAEE] mb-6">
        {[
          { key: 'overview', label: 'Topic Progress' },
          { key: 'mistakes', label: `Mistakes (${mistakes.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'overview' | 'mistakes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-[#76777D] hover:text-[#0B1C30]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {progress.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-[#C6C6CD] mx-auto mb-3" />
              <p className="text-[#76777D]">No progress yet. Start learning!</p>
              <Link href="/learn" className="btn-primary mt-4 inline-flex">Go to Learn</Link>
            </div>
          ) : (
            progress.sort((a, b) => (a.topicId?.order ?? 0) - (b.topicId?.order ?? 0)).map(p => (
              <div key={p.topicId?._id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: p.topicId?.color || '#4F46E5' }}>
                    {p.topicId?.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#0B1C30] text-sm">{p.topicId?.title}</p>
                      <MasteryBadge level={p.masteryLevel as 'beginner' | 'learning' | 'improving' | 'mastered'} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div>
                    <p className="text-sm font-bold text-[#0B1C30]">{p.testsCompleted}</p>
                    <p className="text-[11px] text-[#76777D]">Tests</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0B1C30]">{p.bestScore}%</p>
                    <p className="text-[11px] text-[#76777D]">Best</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0B1C30]">{p.averageScore}%</p>
                    <p className="text-[11px] text-[#76777D]">Average</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#76777D] mb-1">
                    <span>Mastery</span>
                    <span>{p.mastery}%</span>
                  </div>
                  <ProgressBar value={p.mastery} color={p.topicId?.color || '#4F46E5'} height="h-1.5" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mistakes tab */}
      {activeTab === 'mistakes' && (
        <div className="space-y-3">
          {mistakes.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="font-semibold text-[#0B1C30]">No mistakes to review!</p>
              <p className="text-sm text-[#76777D] mt-1">Great job! Keep practicing to stay sharp.</p>
            </div>
          ) : (
            mistakes.map(m => (
              <div key={m._id} className="card border-l-4 border-l-red-400">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#76777D] mb-1">{m.topicId?.title}</p>
                    <p className="text-sm font-medium text-[#0B1C30]">
                      {m.questionId?.questionText}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-red-600">Your answer: <strong>{m.userAnswer}</strong></span>
                  <span className="text-green-700">Correct: <strong>{m.questionId?.correctAnswer}</strong></span>
                  <span className="text-[#76777D] ml-auto">{m.attemptCount}x wrong</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
