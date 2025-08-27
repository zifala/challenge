import type { ProgressMessage } from '../types';

interface ProgressBarProps {
  progress: ProgressMessage | null;
  isCalculating: boolean;
}

export function ProgressBar({ progress, isCalculating }: ProgressBarProps) {
  if (!isCalculating && !progress) return null;

  const percentage = progress ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-700">
          {isCalculating ? 'Calculating distances...' : 'Complete!'}
        </span>
        {progress && (
          <span className="text-gray-600">
            {progress.done} / {progress.total} pairs ({percentage}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isCalculating ? 'bg-blue-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Latest Calculation */}
      {progress?.latest && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          Latest: {progress.latest.a} ↔ {progress.latest.b} = {progress.latest.km} km
        </div>
      )}
    </div>
  );
}