'use client';

import { useState, useEffect } from 'react';
import CountrySelect from '@/components/CountrySelect';
import ProgressBar from '@/components/ProgressBar';
import ResultsTable from '@/components/ResultsTable';
import MapView from '@/components/MapView';
import CacheInfo from '@/components/CacheInfo';
import ClientOnly from '@/components/ClientOnly';
import { Country, DistancePair, StreamUpdate, pairsToCSV, downloadCSV } from '@/lib/utils';

export default function Home() {
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [pairs, setPairs] = useState<DistancePair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StreamUpdate>({ done: 0, total: 0 });
  const [showProgress, setShowProgress] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [performanceInfo, setPerformanceInfo] = useState<string>('');

  const handleCalculateDistances = async () => {
    if (selectedCountries.length < 2) {
      setError('Please select at least 2 countries');
      return;
    }

    setLoading(true);
    setError(null);
    setPairs([]);
    setShowProgress(true);
    setProgress({ done: 0, total: 0 });
    setPerformanceInfo('');

    const startTime = Date.now();

    try {
      const isoCodes = selectedCountries.map(c => c.iso2);
      
      // Use the streaming endpoint for real-time progress
      const response = await fetch('/api/distances/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countries: isoCodes }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate distances');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.pairs) {
                // Final result
                setPairs(data.pairs);
                setShowProgress(false);
              } else if (data.done !== undefined) {
                // Progress update
                setProgress(data);
                
                // Calculate performance metrics
                if (data.total > 0 && data.done > 0) {
                  const elapsed = Date.now() - startTime;
                  const pairsPerSecond = data.done / (elapsed / 1000);
                  const remaining = data.total - data.done;
                  const eta = remaining / pairsPerSecond;
                  
                  setPerformanceInfo(
                    `Speed: ${Math.round(pairsPerSecond)} pairs/sec | ETA: ${eta.toFixed(1)}s`
                  );
                }
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShowProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (pairs.length > 0) {
      const csvContent = pairsToCSV(pairs);
      const filename = `country-distances-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-400 mb-3">
            Country Distance Calculator
          </h1>
          <p className="text-lg text-gray-300">
            Calculate distances between countries using the Haversine formula
          </p>
        </div>

        {/* Cache Info */}
        <ClientOnly>
          <CacheInfo />
        </ClientOnly>

        {/* Main Content */}
        <div className="bg-[#1a1a2e] rounded-xl shadow-2xl border border-[#2d2d44] p-6 mb-6">
          {/* Country Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Countries (minimum 2)
            </label>
            <CountrySelect
              selectedCountries={selectedCountries}
              onSelectionChange={setSelectedCountries}
              disabled={loading}
            />
            <p className="text-sm text-gray-400 mt-1">
              Selected: {selectedCountries.length} countries
            </p>
          </div>

          {/* Calculate Button */}
          <div className="mb-6">
            <button
              onClick={handleCalculateDistances}
              disabled={selectedCountries.length < 2 || loading}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                selectedCountries.length < 2 || loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? 'Calculating...' : 'Calculate Distances'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Progress Bar */}
          <ProgressBar
            done={progress.done}
            total={progress.total}
            isVisible={showProgress}
            performanceInfo={performanceInfo}
          />
        </div>

        {/* Results */}
        {pairs.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-xl shadow-2xl border border-[#2d2d44] p-6">
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Results ({pairs.length} pairs)
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  }`}
                >
                  Map View
                </button>
              </div>
            </div>

            {/* View Content */}
            {viewMode === 'table' ? (
              <ResultsTable pairs={pairs} onDownloadCSV={handleDownloadCSV} />
            ) : (
              <ClientOnly fallback={
                <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
                  <div className="text-gray-400">Loading map...</div>
                </div>
              }>
                <MapView pairs={pairs} maxPairs={20} />
              </ClientOnly>
            )}
          </div>
        )}

        {/* Performance Info */}
        <div className="mt-6 bg-gray-800/50 rounded-xl p-4 border border-gray-600">
          <h4 className="text-lg font-semibold text-white mb-3">Performance</h4>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>• <strong>Target:</strong> Up to 250 countries (31,125 pairs)</p>
            <p>• <strong>Complexity:</strong> O(n²) - grows quadratically with country count</p>
            <p>• <strong>Optimization:</strong> Batching and streaming for large datasets</p>
            <p>• <strong>Caching:</strong> Intelligent caching for repeated calculations</p>
            <p>• <strong>Real-time:</strong> Live progress updates with performance metrics</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">
            How it works
          </h3>
          <div className="text-gray-300 space-y-3">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Select 2 or more countries from the dropdown
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              The system generates all unique pairs of countries
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Distances are calculated using the Haversine formula
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Results are sorted by distance (shortest first)
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              View results in table or interactive map format
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Download results as a CSV file
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Intelligent caching improves performance for repeated calculations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
