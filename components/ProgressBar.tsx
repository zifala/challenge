"use client";
export default function ProgressBar({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="h-3 bg-gray-200 rounded-xl overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #60a5fa, #22c55e)",
          }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {done} / {total} ({pct}%)
      </div>
    </div>
  );
}
