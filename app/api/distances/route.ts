import { NextResponse } from "next/server";
import { z } from "zod";
import countries from "../../../data/countries.json";
import { haversineKilometers } from "../../../lib/haversine";
import type { DistancePair } from "../../../lib/types";

const schema = z.object({ countries: z.array(z.string().length(2)).min(2) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const codes = parsed.data.countries.map((c) => c.toUpperCase());
  const codeToCountry = new Map(countries.map((c) => [c.iso2.toUpperCase(), c] as const));
  for (const code of codes) {
    if (!codeToCountry.has(code)) {
      return NextResponse.json({ error: `Unknown country code: ${code}` }, { status: 400 });
    }
  }
  const uniqueCodes = Array.from(new Set(codes));
  const pairs: DistancePair[] = [];
  for (let i = 0; i < uniqueCodes.length; i++) {
    for (let j = i + 1; j < uniqueCodes.length; j++) {
      const a = uniqueCodes[i];
      const b = uniqueCodes[j];
      const ca = codeToCountry.get(a)!;
      const cb = codeToCountry.get(b)!;
      const km = haversineKilometers({ lat: ca.lat, lon: ca.lon }, { lat: cb.lat, lon: cb.lon });
      pairs.push({ a, b, km });
    }
  }
  pairs.sort((x, y) => x.km - y.km);
  return NextResponse.json({ pairs, count: pairs.length, unit: "km" });
}


