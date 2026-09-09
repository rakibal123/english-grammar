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
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const level = Math.floor(user.xp / 100) + 1;
  const xpInLevel = user.xp % 100;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

      {/* Avatar & name */}
      <div className="card mb-6 text-center py-8">
        <div className="w-20 h-20 bg-[var(--nav-active-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{user.username}</h2>
        {user.isGuest ? (
          <span className="inline-block text-xs bg-[#F1F5F9] text-lighter px-3 py-1 rounded-full mt-1">
            Guest Account
          </span>
        ) : (
          <span className="inline-block text-xs bg-[var(--nav-active-bg)] text-primary px-3 py-1 rounded-full mt-1 font-medium">
            Registered Learner
          </span>
        )}
        <div className="mt-4">
          <p className="text-xs text-lighter mb-1">Level {level} — {xpInLevel}/100 XP to next level</p>
          <div className="h-2 bg-[#E5EEFF] rounded-full overflow-hidden mx-auto max-w-xs">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${xpInLevel}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Current Streak', value: `${user.currentStreak}d`, icon: Flame, color: 'text-[var(--streak-text)]', bg: 'bg-[var(--streak-bg)]' },
          { label: 'Best Streak', value: `${user.longestStreak}d`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Total XP', value: user.xp, icon: Zap, color: 'text-primary', bg: 'bg-[var(--nav-active-bg)]' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card py-4 text-center">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="font-bold text-foreground text-lg">{value}</p>
            <p className="text-[10px] text-lighter">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/progress" className="card block flex items-center gap-3 py-4 hover:border-primary/30 transition-colors group">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-medium text-sm text-foreground group-hover:text-primary">View Full Progress</span>
          <ArrowRight className="w-4 h-4 ml-auto text-lighter group-hover:text-primary" />
        </Link>

        {user.isGuest && (
          <>
            <Link href="/register" className="card block flex items-center gap-3 py-4 hover:border-primary/30 transition-colors group">
              <LogIn className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm text-foreground group-hover:text-primary">Create Account</p>
                <p className="text-xs text-lighter">Save your progress permanently</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-lighter group-hover:text-primary" />
            </Link>
            <Link href="/login" className="card block flex items-center gap-3 py-4 hover:border-primary/30 transition-colors group">
              <LogIn className="w-5 h-5 text-lighter" />
              <span className="font-medium text-sm text-foreground group-hover:text-primary">Sign in to existing account</span>
              <ArrowRight className="w-4 h-4 ml-auto text-lighter group-hover:text-primary" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
