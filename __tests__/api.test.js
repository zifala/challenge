const request = require('supertest');
const app = require('../api/src/app');

describe('API Tests', () => {
  describe('GET /api/countries', () => {
    test('should return list of countries', async () => {
      const response = await request(app)
        .get('/api/countries')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('iso2');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('capital');
      expect(response.body[0]).toHaveProperty('lat');
      expect(response.body[0]).toHaveProperty('lon');
    });
  });

  describe('POST /api/distances', () => {
    test('should validate input and return sorted distances', async () => {
      const testCountries = ['US', 'GB', 'FR', 'DE'];
      
      const response = await request(app)
        .post('/api/distances')
        .send({ countries: testCountries })
        .expect(200);
      
      expect(response.body).toHaveProperty('pairs');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('unit', 'km');
      expect(Array.isArray(response.body.pairs)).toBe(true);
      
      // Should have 6 pairs for 4 countries: n*(n-1)/2 = 4*3/2 = 6
      expect(response.body.count).toBe(6);
      expect(response.body.pairs).toHaveLength(6);
    }); 
   test('should return pairs sorted by distance (ascending)', async () => {
      const testCountries = ['US', 'CA', 'MX'];
      
      const response = await request(app)
        .post('/api/distances')
        .send({ countries: testCountries })
        .expect(200);
      
      const distances = response.body.pairs.map(pair => pair.km);
      
      // Check if distances are sorted in ascending order
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });

    test('should reject invalid country codes', async () => {
      const invalidCountries = ['XX', 'YY', 'ZZ'];
      
      const response = await request(app)
        .post('/api/distances')
        .send({ countries: invalidCountries })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    test('should reject empty country list', async () => {
      const response = await request(app)
        .post('/api/distances')
        .send({ countries: [] })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});