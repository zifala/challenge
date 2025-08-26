import { NextRequest, NextResponse } from 'next/server';
import { Country, calculateDistances } from '@/lib/utils';
import countriesData from '@/data/countries.json';
import { distanceCache, generateCacheKey } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countries: isoCodes } = body;

    if (!isoCodes || !Array.isArray(isoCodes) || isoCodes.length < 2) {
      return NextResponse.json(
        { error: 'Please provide at least 2 country ISO codes' },
        { status: 400 }
      );
    }

    // Validate ISO codes against our dataset
    const allCountries: Country[] = countriesData;
    const countryMap = new Map(allCountries.map(country => [country.iso2, country]));
    
    const selectedCountries: Country[] = [];
    const invalidCodes: string[] = [];

    for (const isoCode of isoCodes) {
      const country = countryMap.get(isoCode);
      if (country) {
        selectedCountries.push(country);
      } else {
        invalidCodes.push(isoCode);
      }
    }

    if (invalidCodes.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid ISO codes provided',
          invalidCodes 
        },
        { status: 400 }
      );
    }

    if (selectedCountries.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid countries are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = generateCacheKey(isoCodes);
    console.log('Cache key:', cacheKey);
    const cachedResult = distanceCache.get(cacheKey);
    if (cachedResult) {
      console.log('Cache hit for:', cacheKey);
      return NextResponse.json(cachedResult);
    }
    console.log('Cache miss for:', cacheKey);

    // Calculate distances for all unique pairs
    const distancePairs = calculateDistances(selectedCountries);

    const result = {
      pairs: distancePairs,
      count: distancePairs.length,
      unit: 'km'
    };

    // Cache the result for 10 minutes
    distanceCache.set(cacheKey, result, 10 * 60 * 1000);
    console.log('Cached result for:', cacheKey);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating distances:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distances' },
      { status: 500 }
    );
  }
}
