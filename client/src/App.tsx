import { useState, useEffect } from 'react';
import { MainLayout } from './layouts';
import { LoadingView, ErrorView, DistanceCalculatorView } from './views';
import { useCountries } from './hooks';

function App() {
  const { countries, isLoading, error, refetch } = useCountries();
  const [appError, setAppError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(5); // cap retries (avoid infinite loop)

  const handleError = (errorMessage: string) => {
    setAppError(errorMessage);
  };

  const clearError = () => {
    setAppError(null);
  };

  // Retry automatically on error, but keep showing LoadingView until success or max retries
  useEffect(() => {
    if ((error || appError) && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        clearError();
        setRetryCount((c) => c + 1);
        refetch();
      }, 3000); // retry every 3s

      return () => clearTimeout(timer);
    }
  }, [error, appError, retryCount, refetch, maxRetries]);

  // Still loading OR retrying? -> show LoadingView
  if (isLoading || (retryCount > 0 && retryCount < maxRetries && (!countries.length))) {
    return <LoadingView />;
  }

  return (
    <MainLayout countriesCount={countries.length}>
      <div className="space-y-8">
        {/* Final error display (only after retries exhausted) */}
        {(error || appError) && retryCount >= maxRetries && (
          <ErrorView
            error={`${error || appError} (Retries exhausted)`} 
            onRetry={() => {
              clearError();
              setRetryCount(0);
              refetch();
            }}
          />
        )}

        {/* Main Calculator View */}
        {!error && !appError && countries.length > 0 && (
          <DistanceCalculatorView
            countries={countries}
            onError={handleError}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default App;
