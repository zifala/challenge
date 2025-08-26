import { haversineKm } from "./haversine";
import type { Country } from "./capitals";

export type Pair = { a: string; b: string; km: number };

export function generatePairs(
  countries: Country[],
  onPair?: (p: Pair) => void
): Pair[] {
  const n = countries.length;
  const pairs: Pair[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = countries[i];
      const B = countries[j];
      const km = haversineKm(
        { lat: A.lat, lon: A.lon },
        { lat: B.lat, lon: B.lon }
      );
      const p = { a: A.iso2, b: B.iso2, km };
      pairs.push(p);
      onPair?.(p);
    }
  }
  pairs.sort((x, y) => x.km - y.km);
  return pairs;
}
