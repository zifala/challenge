import dataset from "@/data/countries.json" assert { type: "json" };

export type Country = {
  iso2: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
};

export const countries: Country[] = dataset as Country[];

export const byCode = new Map(countries.map((c) => [c.iso2.toUpperCase(), c]));

export function validateCodes(
  codes: string[]
): { ok: true; list: Country[] } | { ok: false; invalid: string[] } {
  const upper = codes.map((c) => c.toUpperCase());
  const invalid = upper.filter((c) => !byCode.has(c));
  if (invalid.length) return { ok: false, invalid } as const;
  const list = upper.map((c) => byCode.get(c)!);
  return { ok: true, list } as const;
}
