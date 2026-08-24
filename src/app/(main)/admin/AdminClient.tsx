'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, HelpCircle, TrendingUp, Database, RefreshCw } from 'lucide-react';

interface AdminStats {
  topicsCount: number;
  lessonsCount: number;
  questionsCount: number;
  usersCount: number;
}

export default function AdminClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SEED_KEY || 'grammarflow-super-secret-key-change-in-production'}` },
      });
      const data = await res.json();
      setSeedMsg(data.message || data.error);
      if (data.message) {
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (e) {
      setSeedMsg('Failed to seed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1C30] mb-1">Admin Dashboard</h1>
        <p className="text-sm text-[#76777D]">GrammarFlow Content Management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Topics', value: stats?.topicsCount ?? '—', icon: BookOpen, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
          { label: 'Lessons', value: stats?.lessonsCount ?? '—', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Questions', value: stats?.questionsCount ?? '—', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Users', value: stats?.usersCount ?? '—', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card py-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-[#0B1C30]">{value}</p>
            <p className="text-xs text-[#76777D]">{label}</p>
          </div>
        ))}
      </div>

      {/* Database Actions */}
      <div className="card mb-6">
        <h2 className="font-semibold text-[#0B1C30] mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#4F46E5]" />
          Database Management
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-primary"
          >
            {seeding ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {seeding ? 'Seeding...' : 'Seed Database'}
          </button>
          {seedMsg && (
            <p className={`text-sm ${seedMsg.includes('error') || seedMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {seedMsg}
            </p>
          )}
        </div>
        <p className="text-xs text-[#76777D] mt-2">
          Seeds: 1 Category, 12 Topics (Present Simple unlocked), 1 Lesson with 3 Rules, 15 Examples, 30 Questions, 3 Test Sets.
        </p>
      </div>

      {/* Content structure */}
      <div className="card">
        <h2 className="font-semibold text-[#0B1C30] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
          Content Architecture
        </h2>
        <div className="space-y-2 text-sm text-[#45464D]">
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#4F46E5] rounded-full" /> Category: Tenses</div>
          <div className="flex items-center gap-2 ml-4"><span className="w-2 h-2 bg-purple-400 rounded-full" /> Topic: Present Simple (unlocked) + 11 others (locked)</div>
          <div className="flex items-center gap-2 ml-8"><span className="w-2 h-2 bg-blue-400 rounded-full" /> Lesson: Understanding Present Simple (3 rules)</div>
          <div className="flex items-center gap-2 ml-8"><span className="w-2 h-2 bg-green-400 rounded-full" /> Examples: 15 EN/BN sentence pairs</div>
          <div className="flex items-center gap-2 ml-8"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Questions: 30 (MCQ + Fill Blank) across 3 practice sets</div>
        </div>
      </div>
    </div>
  );
}
