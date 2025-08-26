import { NextResponse } from 'next/server';
import { Country } from '@/lib/utils';
import countriesData from '@/data/countries.json';
import { distanceCache, COUNTRIES_CACHE_KEY, COUNTRIES_CACHE_TTL } from '@/lib/cache';

// Validate countries data for duplicates
function validateCountriesData(countries: Country[]): Country[] {
  const seen = new Set<string>();
  const uniqueCountries: Country[] = [];
  
  for (const country of countries) {
    if (!seen.has(country.iso2)) {
      seen.add(country.iso2);
      uniqueCountries.push(country);
    } else {
      console.warn(`Duplicate ISO2 code found: ${country.iso2} for ${country.name}`);
    }
  }
  
  return uniqueCountries;
}

export async function GET() {
  try {
    // Check cache first
    const cachedCountries = distanceCache.get<Country[]>(COUNTRIES_CACHE_KEY);
    if (cachedCountries) {
      return NextResponse.json(cachedCountries);
    }

    const countries: Country[] = validateCountriesData(countriesData);
    
    // Cache the countries data
    distanceCache.set(COUNTRIES_CACHE_KEY, countries, COUNTRIES_CACHE_TTL);
    
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
