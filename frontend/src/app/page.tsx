import Link from 'next/link';
import { ArrowRight, BookOpen, TrendingUp, Cpu, Edit3, GraduationCap, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--card-bg)] font-inter">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--card-bg)]/95 backdrop-blur-sm border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">GrammarFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted text-sm hover:text-primary transition-colors">Features</Link>
            <Link href="#curriculum" className="text-muted text-sm hover:text-primary transition-colors">Curriculum</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-muted text-sm font-medium hover:text-primary transition-colors hidden md:block">
              Log In
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--nav-active-bg)] text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
            <CheckCircle className="w-3.5 h-3.5" />
            No account required. Start as a guest.
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 text-balance">
            Master English Grammar,<br />
            <span className="text-primary">One Step at a Time.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A focused, distraction-free platform designed to elevate your writing and comprehension
            through structured interactive practice and intelligent progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary px-7 py-3 text-base">
              Start Learning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/learn" className="btn-ghost px-7 py-3 text-base font-medium text-muted">
              Explore Grammar
            </Link>
          </div>

          {/* Mini preview card */}
          <div className="mt-14 inline-flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl px-5 py-3 shadow-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-[11px] text-lighter">Lesson Completed</p>
              <p className="text-sm font-semibold text-foreground">Past Participles <span className="text-primary">+50 XP</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[var(--bg-color)] px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              A Systematic Approach to Fluency
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              We&apos;ve stripped away the noise. Experience a curriculum built on clarity,
              progressive difficulty, and immediate feedback.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Structured Grammar Roadmap',
                desc: 'Follow a meticulously designed path from foundational tenses to advanced syntax. Never wonder what you should learn next.',
                color: 'bg-[var(--nav-active-bg)] text-primary',
              },
              {
                icon: TrendingUp,
                title: 'Granular Tracking',
                desc: 'Monitor your accuracy across specific grammar rules to identify exactly where you need practice.',
                color: 'bg-[#ECFDF5] text-green-600',
              },
              {
                icon: Cpu,
                title: 'Instant Explanations',
                desc: 'Make a mistake? Receive immediate, context-aware explanations that clarify the why behind the rule.',
                color: 'bg-[#FFF7ED] text-orange-600',
              },
              {
                icon: Edit3,
                title: 'Tactile Exercises',
                desc: 'Engage with fill-in-the-blanks, sentence restructuring, and error identification tasks designed for deep retention.',
                color: 'bg-[#F0F9FF] text-blue-600',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-lighter text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Complete Tenses Curriculum
          </h2>
          <p className="text-muted text-lg mb-12 max-w-xl mx-auto">
            12 tense topics, each with structured lessons, examples, and practice sets.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Present Simple', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous',
              'Past Simple', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous',
              'Future Simple', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous',
            ].map((tense, i) => (
              <div key={tense} className={`card py-3 px-4 text-sm font-medium text-left ${i === 0 ? 'text-primary border-primary/30' : 'text-muted'}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${i === 0 ? 'bg-primary' : 'bg-[#C6C6CD]'}`} />
                {tense}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0F172A] px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to refine your grammar?
          </h2>
          <p className="text-[#94A3B8] text-lg mb-8">
            Join thousands of learners who are improving their English confidence daily.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#4338CA] transition-colors">
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">GrammarFlow</span>
          </div>
          <div className="flex items-center gap-6 text-[#64748B] text-sm">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-[#475569] text-sm">© 2024 GrammarFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
