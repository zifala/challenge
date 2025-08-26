import { describe, it, expect } from "vitest";
import { haversineKilometers } from "../lib/haversine";

describe("API shape logic (unit-like)", () => {
  it("validates unique pairs and sorting", () => {
    const codes = ["SO", "KE", "ET", "DJ"]; // 6 pairs
    const coords: Record<string, { lat: number; lon: number }> = {
      SO: { lat: 2.0469, lon: 45.3182 },
      KE: { lat: -1.286389, lon: 36.817223 },
      ET: { lat: 8.9806, lon: 38.7578 },
      DJ: { lat: 11.5721, lon: 43.1456 },
    };
    const pairs: Array<{ a: string; b: string; km: number }> = [];
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const a = codes[i];
        const b = codes[j];
        const km = haversineKilometers(coords[a], coords[b]);
        pairs.push({ a, b, km });
      }
    }
    pairs.sort((x, y) => x.km - y.km);
    expect(pairs.length).toBe(6);
    for (let k = 1; k < pairs.length; k++) {
      expect(pairs[k].km).toBeGreaterThanOrEqual(pairs[k - 1].km);
    }
  });
});


