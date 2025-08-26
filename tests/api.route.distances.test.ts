import { describe, it, expect } from "vitest";
import { POST as postDistances } from "../app/api/distances/route";

describe("/api/distances route", () => {
  it("rejects unknown code", async () => {
    const req = new Request("http://localhost/api/distances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countries: ["XX", "KE"] }),
    });
    const res = await postDistances(req as any);
    expect(res.status).toBe(400);
  });

  it("returns sorted pairs for 4 countries", async () => {
    const req = new Request("http://localhost/api/distances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countries: ["SO", "KE", "ET", "DJ"] }),
    });
    const res = await postDistances(req as any);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.count).toBe(6);
    for (let i = 1; i < json.pairs.length; i++) {
      expect(json.pairs[i].km).toBeGreaterThanOrEqual(json.pairs[i - 1].km);
    }
  });
});


