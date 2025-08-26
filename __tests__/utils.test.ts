import { haversine, generatePairs, calculateDistances, pairsToCSV } from '@/lib/utils';
import { Country, DistancePair } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('haversine', () => {
    it('should calculate correct distance between two points', () => {
      // Test case: New York to London
      const lat1 = 40.7128; // New York
      const lon1 = -74.0060;
      const lat2 = 51.5074; // London
      const lon2 = -0.1278;
      
      const distance = haversine(lat1, lon1, lat2, lon2);
      
      // Expected distance is approximately 5570 km
      expect(distance).toBeCloseTo(5570, -2);
    });

    it('should return 0 for same coordinates', () => {
      const lat = 40.7128;
      const lon = -74.0060;
      
      const distance = haversine(lat, lon, lat, lon);
      
      expect(distance).toBe(0);
    });

    it('should handle antipodal points', () => {
      // Test case: opposite sides of the Earth
      const lat1 = 0;
      const lon1 = 0;
      const lat2 = 0;
      const lon2 = 180;
      
      const distance = haversine(lat1, lon1, lat2, lon2);
      
      // Should be approximately half the Earth's circumference
      expect(distance).toBeCloseTo(20015, -2);
    });
  });

  describe('generatePairs', () => {
    it('should generate correct number of pairs', () => {
      const countries: Country[] = [
        { iso2: 'A', name: 'Country A', capital: 'Capital A', lat: 0, lon: 0 },
        { iso2: 'B', name: 'Country B', capital: 'Capital B', lat: 1, lon: 1 },
        { iso2: 'C', name: 'Country C', capital: 'Capital C', lat: 2, lon: 2 },
      ];
      
      const pairs = generatePairs(countries);
      
      // For 3 countries, we should have 3 pairs: A-B, A-C, B-C
      expect(pairs).toHaveLength(3);
    });

    it('should generate unique pairs only', () => {
      const countries: Country[] = [
        { iso2: 'A', name: 'Country A', capital: 'Capital A', lat: 0, lon: 0 },
        { iso2: 'B', name: 'Country B', capital: 'Capital B', lat: 1, lon: 1 },
      ];
      
      const pairs = generatePairs(countries);
      
      expect(pairs).toHaveLength(1);
      expect(pairs[0][0].iso2).toBe('A');
      expect(pairs[0][1].iso2).toBe('B');
    });
  });

  describe('calculateDistances', () => {
    it('should calculate and sort distances correctly', () => {
      const countries: Country[] = [
        { iso2: 'A', name: 'Country A', capital: 'Capital A', lat: 0, lon: 0 },
        { iso2: 'B', name: 'Country B', capital: 'Capital B', lat: 1, lon: 1 },
        { iso2: 'C', name: 'Country C', capital: 'Capital C', lat: 10, lon: 10 },
      ];
      
      const result = calculateDistances(countries);
      
      expect(result).toHaveLength(3);
      
      // Distances should be sorted in ascending order
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
      expect(result[1].distance).toBeLessThanOrEqual(result[2].distance);
    });
  });

  describe('pairsToCSV', () => {
    it('should generate correct CSV format', () => {
      const pairs: DistancePair[] = [
        {
          country1: { iso2: 'A', name: 'Country A', capital: 'Capital A', lat: 0, lon: 0 },
          country2: { iso2: 'B', name: 'Country B', capital: 'Capital B', lat: 1, lon: 1 },
          distance: 157.2
        }
      ];
      
      const csv = pairsToCSV(pairs);
      
      expect(csv).toContain('"Country 1","Capital 1","Country 2","Capital 2","Distance (km)"');
      expect(csv).toContain('"Country A","Capital A","Country B","Capital B","157.20"');
    });
  });
});
