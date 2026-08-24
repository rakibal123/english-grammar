'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import MasteryBadge from '@/components/ui/MasteryBadge';

interface Topic {
  _id: string;
  title: string;
  slug: string;
  description: string;
  isLocked: boolean;
  color: string;
  order: number;
}

interface ProgressMap {
  [topicId: string]: { completion: number; mastery: number; masteryLevel: string };
}

// Skeleton card for instant perceived load
function TopicSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="h-2 bg-slate-100 rounded w-full" />
        </div>
        <div className="w-4 h-4 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function LearnClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [topicsLoading, setTopicsLoading] = useState(true);

  useEffect(() => {
    // Fetch topics immediately — don't block on guest/progress
    fetch('/api/topics')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTopics(data))
      .catch(() => {})
      .finally(() => setTopicsLoading(false));

    // Fetch guest + progress in the background — non-blocking
    fetch('/api/guest')
      .then((r) => r.ok ? r.json() : null)
      .then(async (user) => {
        if (!user?.id) return;
        const progressRes = await fetch(`/api/progress?userId=${user.id}`);
        if (!progressRes.ok) return;
        const progressData = await progressRes.json();
        const map: ProgressMap = {};
        for (const p of progressData) {
          map[p.topicId?._id || p.topicId] = {
            completion: p.completion,
            mastery: p.mastery,
            masteryLevel: p.masteryLevel,
          };
        }
        setProgressMap(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1C30] mb-2">Grammar Journey</h1>
        <p className="text-[#76777D] text-sm">
          Master all 12 English tenses in order. Complete each topic to unlock the next.
        </p>
      </div>

      <div className="space-y-3">
        {topicsLoading
          ? Array.from({ length: 6 }).map((_, i) => <TopicSkeleton key={i} />)
          : topics.map((topic) => {
              const progress = progressMap[topic._id];
              const completion = progress?.completion ?? 0;
              const isCompleted = completion >= 100;

              if (topic.isLocked) {
                return (
                  <div key={topic._id} className="card opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0B1C30] text-sm">{topic.title}</p>
                        <p className="text-xs text-[#76777D]">Complete previous topic to unlock</p>
                      </div>
                      <span className="text-xs text-[#76777D] bg-slate-100 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={topic._id}
                  href={`/learn/${topic.slug}`}
                  className="card block group hover:shadow-md hover:border-[#4F46E5]/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: topic.color }}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : topic.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-[#0B1C30] text-sm group-hover:text-[#4F46E5] transition-colors">
                          {topic.title}
                        </p>
                        <MasteryBadge level={(progress?.masteryLevel || 'beginner') as 'beginner' | 'learning' | 'improving' | 'mastered'} />
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <ProgressBar value={completion} className="flex-1" height="h-1.5" color={topic.color} />
                        <span className="text-xs text-[#76777D] flex-shrink-0">{completion}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C6C6CD] group-hover:text-[#4F46E5] transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
