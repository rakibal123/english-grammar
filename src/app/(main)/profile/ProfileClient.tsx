'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Flame, Zap, Trophy, ArrowRight, LogIn, BookOpen } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  isGuest: boolean;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export default function ProfileClient() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch('/api/guest').then(r => r.json()).then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const level = Math.floor(user.xp / 100) + 1;
  const xpInLevel = user.xp % 100;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      <h1 className="text-2xl font-bold text-[#0B1C30] mb-6">Profile</h1>

      {/* Avatar & name */}
      <div className="card mb-6 text-center py-8">
        <div className="w-20 h-20 bg-[#EEF2FF] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-[#4F46E5]" />
        </div>
        <h2 className="text-xl font-bold text-[#0B1C30]">{user.username}</h2>
        {user.isGuest ? (
          <span className="inline-block text-xs bg-[#F1F5F9] text-[#76777D] px-3 py-1 rounded-full mt-1">
            Guest Account
          </span>
        ) : (
          <span className="inline-block text-xs bg-[#EEF2FF] text-[#4F46E5] px-3 py-1 rounded-full mt-1 font-medium">
            Registered Learner
          </span>
        )}
        <div className="mt-4">
          <p className="text-xs text-[#76777D] mb-1">Level {level} — {xpInLevel}/100 XP to next level</p>
          <div className="h-2 bg-[#E5EEFF] rounded-full overflow-hidden mx-auto max-w-xs">
            <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-500" style={{ width: `${xpInLevel}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Current Streak', value: `${user.currentStreak}d`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Best Streak', value: `${user.longestStreak}d`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Total XP', value: user.xp, icon: Zap, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card py-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="font-bold text-[#0B1C30] text-lg">{value}</p>
            <p className="text-[10px] text-[#76777D]">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/progress" className="card block flex items-center gap-3 py-4 hover:border-[#4F46E5]/30 transition-colors group">
          <BookOpen className="w-5 h-5 text-[#4F46E5]" />
          <span className="font-medium text-sm text-[#0B1C30] group-hover:text-[#4F46E5]">View Full Progress</span>
          <ArrowRight className="w-4 h-4 ml-auto text-[#C6C6CD] group-hover:text-[#4F46E5]" />
        </Link>

        {user.isGuest && (
          <>
            <Link href="/register" className="card block flex items-center gap-3 py-4 hover:border-[#4F46E5]/30 transition-colors group">
              <LogIn className="w-5 h-5 text-[#4F46E5]" />
              <div>
                <p className="font-medium text-sm text-[#0B1C30] group-hover:text-[#4F46E5]">Create Account</p>
                <p className="text-xs text-[#76777D]">Save your progress permanently</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-[#C6C6CD] group-hover:text-[#4F46E5]" />
            </Link>
            <Link href="/login" className="card block flex items-center gap-3 py-4 hover:border-[#4F46E5]/30 transition-colors group">
              <LogIn className="w-5 h-5 text-[#76777D]" />
              <span className="font-medium text-sm text-[#0B1C30] group-hover:text-[#4F46E5]">Sign in to existing account</span>
              <ArrowRight className="w-4 h-4 ml-auto text-[#C6C6CD] group-hover:text-[#4F46E5]" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
