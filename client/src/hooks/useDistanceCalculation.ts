import { useState } from 'react';
import type { Country, DistanceResponse, ProgressMessage } from '../types';
import { api } from '../api';

export const useDistanceCalculation = () => {
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [results, setResults] = useState<DistanceResponse | null>(null);
  const [progress, setProgress] = useState<ProgressMessage | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);

  const handleCountrySelect = (country: Country) => {
    if (!selectedCountries.find(c => c.id === country.id)) {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleCountryRemove = (country: Country) => {
    setSelectedCountries(selectedCountries.filter(c => c.id !== country.id));
  };

  const calculateDistances = async () => {
    if (selectedCountries.length < 2) return;

    const countryCodes = selectedCountries.map(c => c.iso2);
    setIsCalculating(true);
    setError(null);
    setResults(null);
    setProgress(null);

    try {
      if (useStreaming) {
        const cleanup = api.streamDistances(
          countryCodes,
          (progressData) => {
            setProgress(progressData);
          },
          (finalResult) => {
            setResults(finalResult);
            setIsCalculating(false);
          },
          (errorMessage) => {
            setError(errorMessage);
            setIsCalculating(false);
          }
        );
        return cleanup;
      } else {
        const result = await api.calculateDistances(countryCodes);
        setResults(result);
        setIsCalculating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate distances');
      setIsCalculating(false);
    }
  };

  const resetCalculation = () => {
    setResults(null);
    setProgress(null);
    setError(null);
  };

  const canCalculate = selectedCountries.length >= 2 && !isCalculating;

  return {
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
  };
};