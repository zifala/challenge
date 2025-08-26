import { NextResponse } from "next/server";
import { z } from "zod";
import countries from "../../../data/countries.json";
import { haversineKilometers } from "../../../lib/haversine";

const schema = z.object({ countries: z.array(z.string().length(2)).min(2) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  return streamForCodes(parsed.data.countries.map((c) => c.toUpperCase()));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("countries") || "";
  const codes = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const parsed = schema.safeParse({ countries: codes });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  return streamForCodes(parsed.data.countries);
}

function streamForCodes(codesInput: string[]) {
  const codes = Array.from(new Set(codesInput));
  const codeToCountry = new Map(countries.map((c) => [c.iso2.toUpperCase(), c] as const));
  for (const code of codes) {
    if (!codeToCountry.has(code)) {
      return NextResponse.json({ error: `Unknown country code: ${code}` }, { status: 400 });
    }
  }
  const total = (codes.length * (codes.length - 1)) / 2;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let done = 0;
      for (let i = 0; i < codes.length; i++) {
        for (let j = i + 1; j < codes.length; j++) {
          const a = codes[i];
          const b = codes[j];
          const ca = codeToCountry.get(a)!;
          const cb = codeToCountry.get(b)!;
          const km = haversineKilometers({ lat: ca.lat, lon: ca.lon }, { lat: cb.lat, lon: cb.lon });
          done++;
          const ev = { done, total, latest: { a, b, km } };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


