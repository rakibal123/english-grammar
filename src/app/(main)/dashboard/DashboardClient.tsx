'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Zap, BookOpen, ArrowRight, Trophy, Target, TrendingUp } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import MasteryBadge from '@/components/ui/MasteryBadge';

interface UserData {
  id: string;
  username: string;
  isGuest: boolean;
  xp: number;
  level: number;
  currentStreak: number;
}

interface TopicProgress {
  topicId: { _id: string; title: string; slug: string; color: string };
  completion: number;
  mastery: number;
  masteryLevel: string;
  testsCompleted: number;
}

interface RecentAttempt {
  _id: string;
  topicId: { title: string; slug: string };
  testSetId: { title: string };
  percentage: number;
  createdAt: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardClient() {
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<TopicProgress[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/guest');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          const [progressRes, attemptsRes] = await Promise.all([
            fetch(`/api/progress?userId=${userData.id}`),
            fetch(`/api/attempts?userId=${userData.id}`),
          ]);

          if (progressRes.ok) setProgress(await progressRes.json());
          if (attemptsRes.ok) setRecentAttempts(await attemptsRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overallCompletion = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.completion, 0) / 12)
    : 0;

  const masteredCount = progress.filter(p => p.masteryLevel === 'mastered').length;
  const continueTopic = progress.find(p => p.completion > 0 && p.completion < 100);
  const firstTopic = { slug: 'present-simple', title: 'Present Simple', color: '#4F46E5' };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-[#76777D] mb-1">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-[#0B1C30]">
            {user?.username || 'Learner'}
            {user?.isGuest && (
              <span className="ml-2 text-xs font-normal text-[#76777D] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                Guest
              </span>
            )}
          </h1>
          {user?.isGuest && (
            <p className="text-sm text-[#76777D] mt-1">
              <Link href="/register" className="text-[#4F46E5] font-medium hover:underline">
                Create an account
              </Link>
              {' '}to save your progress permanently.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-bold">{user?.currentStreak ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#4F46E5] px-3 py-1.5 rounded-xl">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">{user?.xp ?? 0} XP</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card py-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-xs text-[#76777D] font-medium">Overall Progress</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C30]">{overallCompletion}%</p>
          <ProgressBar value={overallCompletion} className="mt-2" height="h-1.5" />
        </div>
        <div className="card py-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-[#76777D] font-medium">Mastered</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C30]">{masteredCount}/12</p>
          <p className="text-xs text-[#76777D] mt-1">Topics</p>
        </div>
        <div className="card py-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs text-[#76777D] font-medium">Tests Done</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C30]">
            {progress.reduce((sum, p) => sum + p.testsCompleted, 0)}
          </p>
          <p className="text-xs text-[#76777D] mt-1">Practice sets</p>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-[#0B1C30] mb-4">Continue Learning</h2>
        <Link
          href={`/learn/${continueTopic?.topicId?.slug || firstTopic.slug}`}
          className="card block group hover:shadow-md hover:border-[#4F46E5]/30 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${continueTopic?.topicId?.color || firstTopic.color}20` }}>
              <BookOpen className="w-6 h-6" style={{ color: continueTopic?.topicId?.color || firstTopic.color }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#76777D] mb-0.5">Next Up</p>
              <h3 className="font-semibold text-[#0B1C30]">
                {continueTopic?.topicId?.title || firstTopic.title}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <ProgressBar value={continueTopic?.completion || 0} className="flex-1" height="h-1.5" />
                <span className="text-xs text-[#76777D] flex-shrink-0">
                  {continueTopic?.completion || 0}%
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#4F46E5] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Quick Practice */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#0B1C30]">Quick Practice</h2>
          <Link href="/practice" className="text-xs text-[#4F46E5] font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Present Simple Quiz', meta: '10 questions • 5 mins', slug: 'present-simple', color: '#4F46E5' },
            { label: 'Article Usage', meta: 'Fill in the blanks • A, An, The', slug: 'present-continuous', color: '#7C3AED', locked: true },
            { label: 'Pronunciation', meta: 'Speaking exercise • Plurals', slug: 'past-simple', color: '#0EA5E9', locked: true },
          ].map(({ label, meta, slug, color, locked }) => (
            <Link
              key={label}
              href={locked ? '#' : `/learn/${slug}`}
              className={`card py-4 group transition-all duration-200 ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:border-[#4F46E5]/30'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}>
                  <BookOpen className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B1C30] group-hover:text-[#4F46E5] transition-colors">{label}</p>
                  <p className="text-xs text-[#76777D] mt-0.5">{meta}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Attempts */}
      {recentAttempts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0B1C30]">Recent Tests</h2>
            <Link href="/progress" className="text-xs text-[#4F46E5] font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentAttempts.slice(0, 5).map((attempt) => (
              <div key={attempt._id} className="card py-3 px-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  attempt.percentage >= 80 ? 'bg-green-100 text-green-700' :
                  attempt.percentage >= 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {attempt.percentage}%
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0B1C30]">{attempt.topicId?.title}</p>
                  <p className="text-xs text-[#76777D]">{attempt.testSetId?.title}</p>
                </div>
                <MasteryBadge level={
                  attempt.percentage >= 80 ? 'mastered' :
                  attempt.percentage >= 60 ? 'improving' :
                  attempt.percentage >= 40 ? 'learning' : 'beginner'
                } />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Register CTA for guests */}
      {user?.isGuest && (
        <div className="mt-8 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Save your progress!</h3>
          <p className="text-indigo-100 text-sm mb-4">
            Create a free account to keep your progress, streaks, and XP forever.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-[#4F46E5] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Create Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
