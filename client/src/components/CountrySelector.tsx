import { useState, useMemo } from 'react';
import { Search, X } from './Icons';
import type { Country } from '../types';
import { debounce } from '../utils';

interface CountrySelectorProps {
  countries: Country[];
  selectedCountries: Country[];
  onCountrySelect: (country: Country) => void;
  onCountryRemove: (country: Country) => void;
  disabled?: boolean;
}

export function CountrySelector({
  countries,
  selectedCountries,
  onCountrySelect,
  onCountryRemove,
  disabled = false
}: CountrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounced search to improve performance
  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countries;
    
    const term = searchTerm.toLowerCase();
    return countries.filter(country =>
      country.name.toLowerCase().includes(term) ||
      country.iso2.toLowerCase().includes(term) ||
      country.iso3.toLowerCase().includes(term) ||
      country.capital.toLowerCase().includes(term)
    );
  }, [countries, searchTerm]);

  // Available countries (not already selected)
  const availableCountries = useMemo(() => {
    const selectedIds = new Set(selectedCountries.map(c => c.id));
    return filteredCountries.filter(country => !selectedIds.has(country.id));
  }, [filteredCountries, selectedCountries]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
    setIsDropdownOpen(true);
  };

  const handleCountryClick = (country: Country) => {
    onCountrySelect(country);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search countries by name, code, or capital..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            disabled={disabled}
          />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && availableCountries.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableCountries.slice(0, 50).map((country) => (
              <button
                key={country.id}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleCountryClick(country)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{country.name}</span>
                  <span className="text-sm text-gray-500">{country.iso2}</span>
                </div>
                <div className="text-sm text-gray-600">{country.capital}</div>
              </button>
            ))}
            {availableCountries.length > 50 && (
              <div className="px-4 py-2 text-sm text-gray-500 border-t">
                Showing first 50 results. Refine your search for more specific results.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Countries */}
      {selectedCountries.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Countries ({selectedCountries.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((country) => (
              <div
                key={country.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{country.name} ({country.iso2})</span>
                <button
                  onClick={() => onCountryRemove(country)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        {selectedCountries.length === 0 && (
          <p>Search and select at least 2 countries to calculate distances.</p>
        )}
        {selectedCountries.length === 1 && (
          <p>Select at least one more country to calculate distances.</p>
        )}
        {selectedCountries.length >= 2 && (
          <p>
            Ready to calculate {selectedCountries.length * (selectedCountries.length - 1) / 2} distance pairs.
          </p>
        )}
      </div>
    </div>
  );
}