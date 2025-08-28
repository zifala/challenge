const { calculateDistance } = require('../api/src/utils/haversine');

describe('Utilities Tests', () => {
  test('should calculate distance between two African countries correctly', () => {
    // Test case: Distance between Egypt and Morocco
    const lat1 = 30.0444; // Cairo, Egypt
    const lon1 = 31.2357;
    const lat2 = 34.0209; // Rabat, Morocco
    const lon2 = -6.8416;
    
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    
    // Expected distance is approximately 3800 km
    expect(distance).toBeCloseTo(3800, 0);
  });

  test('should return 0 for same country coordinates', () => {
    // Same country (Nigeria - Abuja)
    const lat = 9.0765;
    const lon = 7.3986;
    
    const distance = calculateDistance(lat, lon, lat, lon);
    
    expect(distance).toBe(0);
  });

  test('should handle neighboring African countries', () => {
    // Test neighboring countries (Kenya and Tanzania)
    const lat1 = -1.2921; // Nairobi, Kenya
    const lon1 = 36.8219;
    const lat2 = -6.7924; // Dodoma, Tanzania
    const lon2 = 39.2083;
    
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    
    // Should be approximately 600-700 km
    expect(distance).toBeCloseTo(650, 50);
  });

  test('should handle distant Muslim countries', () => {
    // Saudi Arabia to Indonesia
    const distance = calculateDistance(24.7136, 46.6753, -6.2088, 106.8456);
    
    // Should be approximately 8000+ km
    expect(distance).toBeGreaterThan(8000);
  });
});