'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Dumbbell, ChevronRight, CheckCircle, Clock, Star, CheckCircle2
} from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import MasteryBadge from '@/components/ui/MasteryBadge';
import ExampleCard from '@/components/ui/ExampleCard';

interface Rule {
  title: string;
  structure: string;
  explanation: string;
  banglaExplanation?: string;
  examples: string[];
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  rules: Rule[];
  keyPoints: string[];
  whenToUse: string[];
}

interface Example {
  _id: string;
  englishText: string;
  banglaText: string;
  category?: string;
  order: number;
}

interface TestSet {
  _id: string;
  title: string;
  description?: string;
  questionCount: number;
  order: number;
}

interface Topic {
  _id: string;
  title: string;
  slug: string;
  description: string;
  color: string;
}

interface UserProgress {
  completion: number;
  mastery: number;
  masteryLevel: string;
  testsCompleted: number;
  averageScore: number;
  bestScore: number;
}

export default function TopicDetailClient({ slug }: { slug: string }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [examples, setExamples] = useState<Example[]>([]);
  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [attemptsByTestSet, setAttemptsByTestSet] = useState<Record<string, { percentage: number }>>({});
  const [activeTab, setActiveTab] = useState<'learn' | 'examples' | 'practice'>('learn');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicRes, userRes] = await Promise.all([
          fetch(`/api/topics/${slug}`),
          fetch('/api/guest'),
        ]);

        if (topicRes.ok) {
          const data = await topicRes.json();
          setTopic(data.topic);
          setLessons(data.lessons);
          setExamples(data.examples);
          setTestSets(data.testSets);

          if (userRes.ok) {
            const user = await userRes.json();
            setUserId(user.id);
            const progressRes = await fetch(`/api/progress?userId=${user.id}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              const topicProgress = progressData.find(
                (p: { topicId: { _id?: string }; completion: number; mastery: number; masteryLevel: string; testsCompleted: number; averageScore: number; bestScore: number }) =>
                  p.topicId?._id === data.topic?._id
              );
              if (topicProgress) setProgress(topicProgress);
            }
            
            const attemptsRes = await fetch(`/api/attempts?userId=${user.id}&limit=0`);
            if (attemptsRes.ok) {
              const attemptsData = await attemptsRes.json();
              const best: Record<string, { percentage: number }> = {};
              attemptsData.forEach((a: { testSetId: string | { _id: string }; percentage: number }) => {
                const tsId = typeof a.testSetId === 'object' ? a.testSetId._id : a.testSetId;
                if (!best[tsId] || best[tsId].percentage < a.percentage) {
                  best[tsId] = { percentage: a.percentage };
                }
              });
              setAttemptsByTestSet(best);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-lighter">Topic not found. Make sure the database is seeded.</p>
        <Link href="/api/seed" className="mt-4 btn-primary inline-flex" onClick={async (e) => {
          e.preventDefault();
          await fetch('/api/seed', {
            method: 'POST',
            headers: { Authorization: `Bearer grammarflow-super-secret-key-change-in-production` }
          });
          window.location.reload();
        }}>
          Seed Database
        </Link>
      </div>
    );
  }

  const lesson = lessons[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      {/* Back */}
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-lighter hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Grammar Journey
      </Link>

      {/* Topic header */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: topic.color }}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
              {progress && (
                <MasteryBadge level={progress.masteryLevel as 'beginner' | 'learning' | 'improving' | 'mastered'} />
              )}
            </div>
            <p className="text-sm text-lighter mt-1">Mastering the foundation of daily communication.</p>
            {progress && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-lighter mb-1">
                  <span>Progress</span>
                  <span>{progress.completion}%</span>
                </div>
                <ProgressBar value={progress.completion} color={topic.color} height="h-1.5" />
              </div>
            )}
          </div>
        </div>

        {/* Mini stats */}
        {progress && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="text-center">
              <p className="text-xs text-lighter">Tests Done</p>
              <p className="font-bold text-foreground">{progress.testsCompleted}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-lighter">Best Score</p>
              <p className="font-bold text-foreground">{progress.bestScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-lighter">Average</p>
              <p className="font-bold text-foreground">{progress.averageScore}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] mb-6">
        {[
          { key: 'learn', label: 'Lesson', icon: BookOpen },
          { key: 'examples', label: 'Examples', icon: Star },
          { key: 'practice', label: 'Practice Sets', icon: Dumbbell },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'learn' | 'examples' | 'practice')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-lighter hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Learn tab */}
      {activeTab === 'learn' && lesson && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">{lesson.title}</h2>
            <p className="text-lighter text-sm">{lesson.description}</p>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            {lesson.rules.map((rule, i) => (
              <div key={i} className="card">
                <h3 className="font-semibold text-foreground mb-2">{rule.title}</h3>
                <div className="bg-[var(--bg-color)] rounded-lg px-4 py-2 mb-3 border border-[var(--border-color)]">
                  <code className="text-sm text-primary font-mono">{rule.structure}</code>
                </div>
                <p className="text-sm text-muted mb-2">{rule.explanation}</p>
                {rule.banglaExplanation && (
                  <p className="text-sm text-lighter italic mb-3">{rule.banglaExplanation}</p>
                )}
                <div className="space-y-1.5">
                  {rule.examples.map((ex, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Points */}
          {lesson.keyPoints.length > 0 && (
            <div className="card border-l-4 border-l-primary">
              <h3 className="font-semibold text-foreground mb-3">Key Points to Remember</h3>
              <ul className="space-y-2">
                {lesson.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <span className="w-5 h-5 bg-[var(--nav-active-bg)] text-primary rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to use */}
          {lesson.whenToUse.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                When to Use
              </h3>
              <ul className="space-y-2">
                {lesson.whenToUse.map((use, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab('examples')}
              className="btn-primary"
            >
              Continue to Examples
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Examples tab */}
      {activeTab === 'examples' && (
        <div className="space-y-4">
          <p className="text-sm text-lighter">{examples.length} example sentences with Bangla translations</p>
          <div className="grid gap-3">
            {examples.map((ex, i) => (
              <ExampleCard
                key={ex._id}
                englishText={ex.englishText}
                banglaText={ex.banglaText}
                category={ex.category}
                order={i + 1}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab('practice')}
              className="btn-primary"
            >
              Start Practice
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Practice tab */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <p className="text-sm text-lighter">{testSets.length} practice sets available</p>
          <div className="space-y-3">
            {testSets.map((ts, i) => (
              <Link
                key={ts._id}
                href={`/practice/${ts._id}?userId=${userId}`}
                className="card block group hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: topic.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      {ts.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-lighter">
                      <span>{ts.questionCount} questions</span>
                      <span>•</span>
                      <span>{ts.description}</span>
                      {attemptsByTestSet[ts._id] && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Best: {attemptsByTestSet[ts._id].percentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-lighter bg-[var(--bg-color)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                      ~5 mins
                    </span>
                    {attemptsByTestSet[ts._id] ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--quiz-hover-bg)] text-primary text-xs font-semibold flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        Retake
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-lighter group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
