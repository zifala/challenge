import { useState } from 'react';
import { MainLayout } from './layouts';
import { LoadingView, ErrorView, DistanceCalculatorView } from './views';
import { useCountries } from './hooks';

function App() {
  const { countries, isLoading, error, refetch } = useCountries();
  const [appError, setAppError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setAppError(errorMessage);
  };

  const clearError = () => {
    setAppError(null);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <MainLayout countriesCount={countries.length}>
      <div className="space-y-8">
        {/* Error Display */}
        {(error || appError) && (
          <ErrorView 
            error={error || appError || ''} 
            onRetry={() => {
              clearError();
              refetch();
            }} 
          />
        )}

        {/* Main Calculator View */}
        {!error && (
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