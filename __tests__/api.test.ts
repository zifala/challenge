import { haversine, calculateDistances, generatePairs } from '@/lib/utils';
import { Country } from '@/lib/utils';

// Mock test data
const testCountries: Country[] = [
  { iso2: 'SO', name: 'Somalia', capital: 'Mogadishu', lat: 2.0469, lon: 45.3182 },
  { iso2: 'KE', name: 'Kenya', capital: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { iso2: 'ET', name: 'Ethiopia', capital: 'Addis Ababa', lat: 9.03, lon: 38.74 },
  { iso2: 'EG', name: 'Egypt', capital: 'Cairo', lat: 30.0444, lon: 31.2357 },
];

describe('API Logic Tests', () => {
  describe('Distance Calculations', () => {
    it('should calculate distances for 3 countries correctly', () => {
      const threeCountries = testCountries.slice(0, 3);
      const result = calculateDistances(threeCountries);
      
      expect(result).toHaveLength(3); // 3 countries = 3 pairs
      expect(result[0]).toHaveProperty('country1');
      expect(result[0]).toHaveProperty('country2');
      expect(result[0]).toHaveProperty('distance');
      
      // Check that pairs are sorted by distance
      for (let i = 1; i < result.length; i++) {
        expect(result[i].distance).toBeGreaterThanOrEqual(result[i-1].distance);
      }
    });

    it('should calculate distances for 4 countries correctly', () => {
      const result = calculateDistances(testCountries);
      
      expect(result).toHaveLength(6); // 4 countries = 6 pairs
      
      // Check that pairs are sorted by distance
      for (let i = 1; i < result.length; i++) {
        expect(result[i].distance).toBeGreaterThanOrEqual(result[i-1].distance);
      }
    });

    it('should generate correct number of pairs', () => {
      const pairs = generatePairs(testCountries);
      expect(pairs).toHaveLength(6); // 4 countries = 6 pairs
      
      // Check that all pairs are unique
      const pairStrings = pairs.map(([a, b]) => `${a.iso2}-${b.iso2}`).sort();
      const uniquePairs = [...new Set(pairStrings)];
      expect(uniquePairs).toHaveLength(6);
    });

    it('should validate country data structure', () => {
      testCountries.forEach(country => {
        expect(country).toHaveProperty('iso2');
        expect(country).toHaveProperty('name');
        expect(country).toHaveProperty('capital');
        expect(country).toHaveProperty('lat');
        expect(country).toHaveProperty('lon');
        expect(typeof country.lat).toBe('number');
        expect(typeof country.lon).toBe('number');
      });
    });
  });

  describe('Haversine Formula', () => {
    it('should calculate correct distance between Somalia and Kenya', () => {
      const somalia = testCountries[0];
      const kenya = testCountries[1];
      
      const distance = haversine(somalia.lat, somalia.lon, kenya.lat, kenya.lon);
      
      // Distance should be reasonable (between 100-2000 km)
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(2000);
    });

    it('should calculate correct distance between Egypt and Somalia', () => {
      const egypt = testCountries[3];
      const somalia = testCountries[0];
      
      const distance = haversine(egypt.lat, egypt.lon, somalia.lat, somalia.lon);
      
      // Distance should be reasonable (between 2000-5000 km)
      expect(distance).toBeGreaterThan(2000);
      expect(distance).toBeLessThan(5000);
    });
  });
});
