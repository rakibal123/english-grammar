import { HelpCircle, BookOpen, Dumbbell, TrendingUp } from 'lucide-react';

export default function HelpPage() {
  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-6 h-6 text-[#4F46E5]" />
          <h1 className="text-2xl font-bold text-[#0B1C30]">Help & Guide</h1>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: BookOpen,
              title: 'How to Learn',
              desc: 'Go to the Learn tab, choose a topic, and read through the lesson. Each lesson explains grammar rules with examples in English and Bangla.',
              color: '#4F46E5',
            },
            {
              icon: Dumbbell,
              title: 'How to Practice',
              desc: 'After reading a lesson, go to Practice Sets and start a quiz. Answer MCQ or fill-in-the-blank questions. You get immediate feedback with explanations.',
              color: '#7C3AED',
            },
            {
              icon: TrendingUp,
              title: 'Tracking Progress',
              desc: 'Visit the Progress tab to see your completion percentage, mastery level, and mistakes. Complete topics to unlock the next tense.',
              color: '#059669',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20`, color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1C30] mb-1">{title}</h3>
                <p className="text-sm text-[#76777D]">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-6 bg-[#F8F9FF]">
          <h3 className="font-semibold text-[#0B1C30] mb-2">Quick Tips</h3>
          <ul className="space-y-1.5 text-sm text-[#45464D]">
            <li>✅ Complete 3 practice sets to achieve 100% progress on a topic</li>
            <li>🔥 Practice daily to build your streak and earn XP</li>
            <li>📚 Review your mistakes to improve faster</li>
            <li>🏆 Score 80%+ consistently to reach Mastered level</li>
          </ul>
        </div>
      </div>
    </>
  );
}
