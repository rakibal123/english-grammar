type MasteryLevel = 'beginner' | 'learning' | 'improving' | 'mastered';

const configs: Record<MasteryLevel, { label: string; className: string }> = {
  beginner: { label: 'Beginner', className: 'bg-slate-100 text-slate-600' },
  learning: { label: 'Learning', className: 'bg-blue-100 text-blue-700' },
  improving: { label: 'Improving', className: 'bg-amber-100 text-amber-700' },
  mastered: { label: 'Mastered', className: 'bg-green-100 text-green-700' },
};

export function getMasteryLevel(score: number): MasteryLevel {
  if (score >= 80) return 'mastered';
  if (score >= 60) return 'improving';
  if (score >= 40) return 'learning';
  return 'beginner';
}

export default function MasteryBadge({ level }: { level: MasteryLevel }) {
  const config = configs[level] || configs.beginner;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
