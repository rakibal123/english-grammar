interface ExampleCardProps {
  englishText: string;
  banglaText: string;
  category?: string;
  order?: number;
}

export default function ExampleCard({ englishText, banglaText, category, order }: ExampleCardProps) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        {order !== undefined && (
          <span className="flex-shrink-0 w-6 h-6 bg-[var(--nav-active-bg)] text-primary rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
            {order}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-lighter mb-1.5">
              {category}
            </span>
          )}
          <p className="text-foreground font-medium text-sm leading-relaxed">{englishText}</p>
          <p className="text-muted text-sm mt-1 font-normal">{banglaText}</p>
        </div>
      </div>
    </div>
  );
}
