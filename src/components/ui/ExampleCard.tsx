interface ExampleCardProps {
  englishText: string;
  banglaText: string;
  category?: string;
  order?: number;
}

export default function ExampleCard({ englishText, banglaText, category, order }: ExampleCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E8EAEE] p-4 hover:border-[#4F46E5]/30 transition-colors">
      <div className="flex items-start gap-3">
        {order !== undefined && (
          <span className="flex-shrink-0 w-6 h-6 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
            {order}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {category && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#76777D] mb-1.5">
              {category}
            </span>
          )}
          <p className="text-[#0B1C30] font-medium text-sm leading-relaxed">{englishText}</p>
          <p className="text-[#45464D] text-sm mt-1 font-normal">{banglaText}</p>
        </div>
      </div>
    </div>
  );
}
