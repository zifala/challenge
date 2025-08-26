import { describe, it, expect } from "vitest";
import { haversineKilometers } from "../lib/haversine";

describe("haversineKilometers", () => {
  it("returns ~0 for identical points", () => {
    const km = haversineKilometers({ lat: 0, lon: 0 }, { lat: 0, lon: 0 });
    expect(km).toBe(0);
  });
  it("computes known distance roughly (Nairobi to Addis Ababa ~1162km)", () => {
    const km = haversineKilometers({ lat: -1.286389, lon: 36.817223 }, { lat: 8.9806, lon: 38.7578 });
    expect(Math.abs(km - 1162)).toBeLessThan(50);
  });
});


