interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
  height?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  className = '',
  color = '#4F46E5',
  showLabel = false,
  height = 'h-2',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${height} bg-[#E5EEFF] rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[#76777D] mt-1">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
