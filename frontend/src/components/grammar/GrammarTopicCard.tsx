import Link from 'next/link';
import { Lock, CheckCircle2, Circle } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import MasteryBadge, { getMasteryLevel } from '@/components/ui/MasteryBadge';

interface GrammarTopicCardProps {
  topic: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    isLocked: boolean;
    color: string;
    order: number;
  };
  progress?: {
    completion: number;
    mastery: number;
    masteryLevel: string;
    testsCompleted: number;
  } | null;
}

export default function GrammarTopicCard({ topic, progress }: GrammarTopicCardProps) {
  const isLocked = topic.isLocked;
  const completion = progress?.completion ?? 0;
  const mastery = progress?.mastery ?? 0;
  const masteryLevel = progress?.masteryLevel ?? getMasteryLevel(mastery);
  const isCompleted = completion >= 100;

  const card = (
    <div
      className={`card group transition-all duration-200 ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-md hover:border-primary/30 cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon / Number */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
          style={{ backgroundColor: topic.color }}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : topic.order}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm">{topic.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {!isLocked && <MasteryBadge level={masteryLevel as 'beginner' | 'learning' | 'improving' | 'mastered'} />}
            </div>
          </div>
          <p className="text-xs text-lighter mb-3 line-clamp-1">{topic.description}</p>
          {!isLocked && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-lighter">Progress</span>
                <span className="text-[11px] font-medium text-primary">{completion}%</span>
              </div>
              <ProgressBar value={completion} color={topic.color} height="h-1.5" />
            </div>
          )}
          {isLocked && (
            <p className="text-xs text-lighter">Complete previous topic to unlock</p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) return <div>{card}</div>;

  return <Link href={`/learn/${topic.slug}`}>{card}</Link>;
}
