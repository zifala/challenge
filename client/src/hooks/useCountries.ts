import { useState, useEffect } from 'react';
import type { Country } from '../types';
import { api } from '../api';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const countriesData = await api.getCountries();
      setCountries(countriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load countries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  return {
    countries,
    isLoading,
    error,
    refetch: loadCountries
  };
};