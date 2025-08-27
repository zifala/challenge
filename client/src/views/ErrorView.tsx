import { AlertCircle } from '../components/Icons';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

export const ErrorView = ({ error, onRetry }: ErrorViewProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-medium text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
};