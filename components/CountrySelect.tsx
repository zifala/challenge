'use client';

import { useState, useEffect, useRef } from 'react';
import { Country } from '@/lib/utils';

interface CountrySelectProps {
  selectedCountries: Country[];
  onSelectionChange: (countries: Country[]) => void;
  disabled?: boolean;
}

export default function CountrySelect({ 
  selectedCountries, 
  onSelectionChange, 
  disabled = false 
}: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.capital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.iso2.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCountry = (country: Country) => {
    const isSelected = selectedCountries.some(c => c.iso2 === country.iso2);
    if (isSelected) {
      onSelectionChange(selectedCountries.filter(c => c.iso2 !== country.iso2));
    } else {
      onSelectionChange([...selectedCountries, country]);
    }
  };

  const removeCountry = (iso2: string) => {
    onSelectionChange(selectedCountries.filter(c => c.iso2 !== iso2));
  };

  if (loading) {
    return (
      <div className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800">
        <div className="text-gray-400">Loading countries...</div>
      </div>
    );
  }

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div className="w-full">
        {/* Selected countries display */}
        <div className="min-h-[44px] p-2 border border-gray-600 rounded-lg bg-gray-800 flex flex-wrap gap-1">
          {selectedCountries.map(country => (
            <span
              key={country.iso2}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-600 text-white"
            >
              {country.name} ({country.iso2})
              <button
                type="button"
                onClick={() => removeCountry(country.iso2)}
                className="ml-1 text-blue-200 hover:text-white"
                disabled={disabled}
              >
                ×
              </button>
            </span>
          ))}
          
          {/* Search input */}
          <input
            type="text"
            placeholder={selectedCountries.length === 0 ? "Search countries..." : ""}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="flex-1 min-w-0 outline-none text-sm bg-transparent text-white placeholder-gray-400"
            disabled={disabled}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-gray-400 text-sm">No countries found</div>
            ) : (
              filteredCountries.map((country, index) => {
                const isSelected = selectedCountries.some(c => c.iso2 === country.iso2);
                return (
                  <button
                    key={`${country.iso2}-${index}`}
                    type="button"
                    onClick={() => toggleCountry(country)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 text-sm transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'text-gray-200'
                    }`}
                    disabled={disabled}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{country.name}</div>
                        <div className="text-xs text-gray-400">
                          {country.capital} • {country.iso2}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-white">✓</div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
