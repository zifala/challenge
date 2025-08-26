'use client';

interface ProgressBarProps {
  done: number;
  total: number;
  isVisible: boolean;
  performanceInfo?: string;
}

export default function ProgressBar({ done, total, isVisible, performanceInfo }: ProgressBarProps) {
  if (!isVisible) return null;

  const percentage = total > 0 ? (done / total) * 100 : 0;
  const estimatedPairs = total > 0 ? Math.round((total * (total - 1)) / 2) : 0;

  return (
    <div className="w-full">
      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-sm text-gray-300 space-y-1">
        <div>
          Processing: {done.toLocaleString()} of {total.toLocaleString()} pairs ({percentage.toFixed(1)}%)
        </div>
        
        {total > 20 && (
          <div className="text-xs text-gray-400">
            Estimated total pairs: {estimatedPairs.toLocaleString()} (O(n²) complexity)
          </div>
        )}
        
        {performanceInfo && (
          <div className="text-xs text-blue-400 font-mono">
            {performanceInfo}
          </div>
        )}
      </div>
    </div>
  );
}
