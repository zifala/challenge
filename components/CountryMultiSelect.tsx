"use client";
import React, { useMemo, useState } from "react";

export type CountryOption = { iso2: string; name: string; capital: string };

export default function CountryMultiSelect({
  options,
  onChange,
}: {
  options: CountryOption[];
  onChange: (codes: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.capital.toLowerCase().includes(q) ||
        o.iso2.toLowerCase().includes(q)
    );
  }, [options, query]);

  function toggle(code: string) {
    setSelected((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      onChange(next);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <input
        className="w-full border rounded-xl p-2"
        placeholder="Search by country, capital, or code…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="max-h-64 overflow-auto border rounded-xl divide-y">
        {filtered.map((o) => (
          <label
            key={o.iso2}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(o.iso2)}
              onChange={() => toggle(o.iso2)}
            />
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
              {o.iso2}
            </span>
            <span className="font-medium">{o.name}</span>
            <span className="text-gray-500 ml-auto">{o.capital}</span>
          </label>
        ))}
      </div>
      <div className="text-sm text-gray-600">
        Selected: {selected.join(", ") || "none"}
      </div>
    </div>
  );
}
