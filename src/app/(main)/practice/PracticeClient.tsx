'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Lock, ChevronRight, Clock } from 'lucide-react';

interface Topic {
  _id: string;
  title: string;
  slug: string;
  color: string;
  isLocked: boolean;
  order: number;
}

interface TestSetItem {
  _id: string;
  title: string;
  description?: string;
  questionCount: number;
  topicId: string;
  order: number;
}

export default function PracticeClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, userRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/guest'),
        ]);
        if (topicsRes.ok) setTopics(await topicsRes.json());
        if (userRes.ok) {
          const u = await userRes.json();
          setUserId(u.id);
        }
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

  const unlockedTopics = topics.filter(t => !t.isLocked);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1C30] mb-2">Practice</h1>
        <p className="text-sm text-[#76777D]">Test your knowledge with our practice sets</p>
      </div>

      <div className="space-y-4">
        {unlockedTopics.map(topic => (
          <TopicPracticeSection key={topic._id} topic={topic} userId={userId} />
        ))}

        {topics.filter(t => t.isLocked).length > 0 && (
          <div className="card opacity-60">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#76777D]" />
              <p className="text-sm text-[#76777D]">
                {topics.filter(t => t.isLocked).length} more topics unlock as you progress
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicPracticeSection({ topic, userId }: { topic: Topic; userId: string }) {
  const [testSets, setTestSets] = useState<TestSetItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/topics/${topic.slug}`)
      .then(r => r.json())
      .then(data => {
        setTestSets(data.testSets || []);
        setLoaded(true);
      });
  }, [topic.slug]);

  if (!loaded) return null;
  if (testSets.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
          style={{ backgroundColor: topic.color }}>
          {topic.order}
        </div>
        <h2 className="font-semibold text-[#0B1C30] text-sm">{topic.title}</h2>
      </div>
      <div className="space-y-2">
        {testSets.map(ts => (
          <Link
            key={ts._id}
            href={`/practice/${ts._id}?userId=${userId}`}
            className="card block group hover:shadow-md hover:border-[#4F46E5]/30 transition-all duration-200 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${topic.color}20` }}>
                <Dumbbell className="w-5 h-5" style={{ color: topic.color }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#0B1C30] group-hover:text-[#4F46E5] transition-colors">
                  {ts.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[#76777D]">
                  <span>{ts.questionCount} questions</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~5 mins</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#C6C6CD] group-hover:text-[#4F46E5] flex-shrink-0 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
