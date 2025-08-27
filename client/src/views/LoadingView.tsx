import { Globe } from '../components/Icons';

export const LoadingView = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading countries...</p>
      </div>
    </div>
  );
};