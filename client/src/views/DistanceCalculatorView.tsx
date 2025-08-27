import { CheckCircle, Calculator } from '../components/Icons';
import { CountrySelector } from '../components/CountrySelector';
import { ProgressBar } from '../components/ProgressBar';
import { ResultsTable } from '../components/ResultsTable';
import { useDistanceCalculation } from '../hooks/useDistanceCalculation';
import type { Country } from '../types';

interface DistanceCalculatorViewProps {
  countries: Country[];
  onError: (error: string) => void;
}

export const DistanceCalculatorView = ({ countries, onError }: DistanceCalculatorViewProps) => {
  const {
    selectedCountries,
    results,
    progress,
    isCalculating,
    error,
    useStreaming,
    canCalculate,
    handleCountrySelect,
    handleCountryRemove,
    calculateDistances,
    resetCalculation,
    setUseStreaming,
    setError
  } = useDistanceCalculation();

  // Propagate errors to parent
  if (error && error !== onError.toString()) {
    onError(error);
    setError(null);
  }

  return (
    <div className="space-y-8">
      {/* Country Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Countries</h2>
        <CountrySelector
          countries={countries}
          selectedCountries={selectedCountries}
          onCountrySelect={handleCountrySelect}
          onCountryRemove={handleCountryRemove}
          disabled={isCalculating}
        />
      </div>

      {/* Calculation Controls */}
      {selectedCountries.length >= 2 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Calculate Distances</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  disabled={isCalculating}
                  className="rounded"
                />
                Real-time progress
              </label>
              <button
                onClick={calculateDistances}
                disabled={!canCalculate}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Calculator className="w-4 h-4" />
                {isCalculating ? 'Calculating...' : 'Calculate Distances'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar progress={progress} isCalculating={isCalculating} />
        </div>
      )}

      {/* Success Message */}
      {results && !isCalculating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="font-medium text-green-800">Calculation Complete!</h3>
            <p className="text-green-700">
              Successfully calculated {results.count} distance pairs.
            </p>
          </div>
          <button
            onClick={resetCalculation}
            className="ml-auto text-sm text-green-600 hover:text-green-800 underline"
          >
            Calculate Again
          </button>
        </div>
      )}

      {/* Results Table */}
      {results && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ResultsTable
            pairs={results.pairs}
            totalCount={results.count}
            unit={results.unit}
          />
        </div>
      )}

      {/* Instructions */}
      {selectedCountries.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Search and select at least 2 countries from the dropdown</li>
            <li>Click "Calculate Distances" to compute great-circle distances</li>
            <li>View results in the sortable table below</li>
            <li>Download results as CSV for further analysis</li>
          </ol>
          <p className="mt-3 text-sm text-blue-600">
            💡 Tip: Enable "Real-time progress" to see calculations as they happen!
          </p>
        </div>
      )}
    </div>
  );
};