import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GraduationCap } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-base tracking-tight">GrammarFlow</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <main className="main-content pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
