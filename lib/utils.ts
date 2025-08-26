export interface Country {
  iso2: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
}

export interface DistancePair {
  country1: Country;
  country2: Country;
  distance: number;
}

export interface DistanceResult {
  pairs: DistancePair[];
  count: number;
  unit: string;
}

export interface StreamUpdate {
  done: number;
  total: number;
  latest?: DistancePair;
}

/**
 * Calculate the Haversine distance between two points on Earth
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Generate all unique pairs from an array of countries
 * @param countries Array of countries
 * @returns Array of unique country pairs
 */
export function generatePairs(countries: Country[]): [Country, Country][] {
  const pairs: [Country, Country][] = [];
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      pairs.push([countries[i], countries[j]]);
    }
  }
  return pairs;
}

/**
 * Calculate distances for all pairs and sort by distance
 * @param countries Array of countries
 * @returns Sorted array of distance pairs
 */
export function calculateDistances(countries: Country[]): DistancePair[] {
  const pairs = generatePairs(countries);
  const distancePairs: DistancePair[] = pairs.map(([country1, country2]) => ({
    country1,
    country2,
    distance: haversine(country1.lat, country1.lon, country2.lat, country2.lon)
  }));
  
  return distancePairs.sort((a, b) => a.distance - b.distance);
}

/**
 * Convert distance pairs to CSV format
 * @param pairs Array of distance pairs
 * @returns CSV string
 */
export function pairsToCSV(pairs: DistancePair[]): string {
  const headers = ['Country 1', 'Capital 1', 'Country 2', 'Capital 2', 'Distance (km)'];
  const rows = pairs.map(pair => [
    pair.country1.name,
    pair.country1.capital,
    pair.country2.name,
    pair.country2.capital,
    pair.distance.toFixed(2)
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

/**
 * Download CSV data as a file
 * @param csvContent CSV string content
 * @param filename Filename for download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
