'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Trophy, Target, Flame, Zap, BookOpen, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topicName: string) => {
    setExpandedTopics(prev => ({ ...prev, [topicName]: !prev[topicName] }));
  };

  const groupedMistakes = mistakes.reduce((acc, mistake) => {
    const topicName = mistake.topicId?.title || 'Unknown Topic';
    if (!acc[topicName]) acc[topicName] = [];
    acc[topicName].push(mistake);
    return acc;
  }, {} as Record<string, MistakeItem[]>);

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
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Your Progress</h1>
        <p className="text-sm text-lighter">Track your grammar mastery journey</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Overall', value: `${overallCompletion}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-[var(--nav-active-bg)]' },
          { label: 'Mastered', value: `${masteredCount}/12`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Tests Done', value: totalTests, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: Zap, color: 'text-primary', bg: 'bg-[var(--nav-active-bg)]' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card py-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-lighter">{label}</p>
          </div>
        ))}
      </div>

      {/* Streak */}
      <div className="card mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--streak-bg)] flex items-center justify-center">
          <Flame className="w-6 h-6 text-[var(--streak-text)]" />
        </div>
        <div>
          <p className="font-bold text-foreground">
            {user?.currentStreak ?? 0} day streak
          </p>
          <p className="text-sm text-lighter">Best: {user?.longestStreak ?? 0} days</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-bold text-primary">{user?.xp ?? 0} XP</p>
          <p className="text-xs text-lighter">Total earned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] mb-6">
        {[
          { key: 'overview', label: 'Topic Progress' },
          { key: 'mistakes', label: `Mistakes (${mistakes.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'overview' | 'mistakes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-lighter hover:text-foreground'
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
              <BookOpen className="w-10 h-10 text-lighter mx-auto mb-3" />
              <p className="text-lighter">No progress yet. Start learning!</p>
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
                      <p className="font-semibold text-foreground text-sm">{p.topicId?.title}</p>
                      <MasteryBadge level={p.masteryLevel as 'beginner' | 'learning' | 'improving' | 'mastered'} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div>
                    <p className="text-sm font-bold text-foreground">{p.testsCompleted}</p>
                    <p className="text-[11px] text-lighter">Tests</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{p.bestScore}%</p>
                    <p className="text-[11px] text-lighter">Best</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{p.averageScore}%</p>
                    <p className="text-[11px] text-lighter">Average</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-lighter mb-1">
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
              <p className="font-semibold text-foreground">No mistakes to review!</p>
              <p className="text-sm text-lighter mt-1">Great job! Keep practicing to stay sharp.</p>
            </div>
          ) : (
            Object.entries(groupedMistakes).map(([topicName, topicMistakes]) => {
              const isExpanded = expandedTopics[topicName];
              return (
                <div key={topicName} className="card p-0 overflow-hidden">
                  <button 
                    onClick={() => toggleTopic(topicName)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[var(--nav-active-bg)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <h3 className="font-semibold text-foreground text-left">{topicName}</h3>
                      <span className="text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full">
                        {topicMistakes.length} mistakes
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-lighter" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-lighter" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[var(--border-color)] divide-y divide-[var(--border-color)]">
                      {topicMistakes.map((m, idx) => (
                        <div key={m._id} className="p-4 bg-[var(--bg-color)]">
                          <p className="text-sm font-medium text-foreground mb-3">
                            <span className="text-lighter mr-2">{idx + 1}.</span> 
                            {m.questionId?.questionText}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs ml-5">
                            <span className="text-red-600 dark:text-red-400">
                              Your answer: <strong>{m.userAnswer || '(Skipped)'}</strong>
                            </span>
                            <span className="text-green-700 dark:text-green-500">
                              Correct: <strong>{m.questionId?.correctAnswer}</strong>
                            </span>
                            <span className="text-lighter ml-auto bg-[var(--nav-active-bg)] px-2 py-1 rounded">
                              {m.attemptCount}x wrong
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
