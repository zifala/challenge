"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Table, THead, TBody, TR, TH, TD } from "./ui/table";
import type { Country } from "../lib/types";
import { toCsv } from "../lib/csv";

type Pair = { a: string; b: string; km: number };

export default function DistancePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [sortKey, setSortKey] = useState<"a" | "b" | "km">("km");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.iso2.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q)
    );
  }, [countries, query]);

  function toggle(code: string) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function compute() {
    setPairs([]);
    setProgress({
      done: 0,
      total: (selected.length * (selected.length - 1)) / 2,
    });
    // SSE progress via GET query param
    const qp = new URLSearchParams({
      countries: selected.join(","),
    }).toString();
    const sse = new EventSource(`/api/stream-distances?${qp}`);
    sse.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setProgress({ done: data.done, total: data.total });
      } catch {}
    };
    sse.onerror = () => {
      sse.close();
    };

    // Use fetch POST for final sorted results
    const res = await fetch("/api/distances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countries: selected }),
    });
    if (!res.ok) {
      setProgress(null);
      return;
    }
    const json = await res.json();
    setPairs(json.pairs);
    setProgress({ done: json.count, total: json.count });
    sse.close();
  }

  const sorted = useMemo(() => {
    const arr = [...pairs];
    arr.sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (x < y) return sortAsc ? -1 : 1;
      if (x > y) return sortAsc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [pairs, sortKey, sortAsc]);

  function downloadCsv() {
    const csv = toCsv(sorted.map((p) => ({ a: p.a, b: p.b, km: p.km })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "distances.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function sortBy(k: "a" | "b" | "km") {
    if (sortKey === k) setSortAsc((v) => !v);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">Select countries</div>
        <div className="card-body space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search name, capital, or code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-3/5"
            />
            <Button
              className="w-1/5"
              onClick={compute}
              disabled={selected.length < 2}
            >
              Compute
            </Button>
            <Button
              className="w-1/5"
              onClick={downloadCsv}
              disabled={pairs.length === 0}
            >
              Download CSV
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-auto">
            {filtered.map((c) => {
              const active = selected.includes(c.iso2);
              return (
                <button
                  key={c.iso2}
                  onClick={() => toggle(c.iso2)}
                  className={
                    "border rounded px-3 py-2 text-left " +
                    (active ? "bg-black text-white" : "bg-white")
                  }
                >
                  <div className="font-medium">
                    {c.name} ({c.iso2})
                  </div>
                  <div className="text-xs opacity-70">{c.capital}</div>
                </button>
              );
            })}
          </div>
          {progress && (
            <div className="space-y-1">
              <Progress value={progress.done} max={progress.total || 1} />
              <div className="text-xs text-gray-600">
                {progress.done} / {progress.total} pairs
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">Distances</div>
        <div className="card-body">
          <Table>
            <THead>
              <TR>
                <TH role="button" onClick={() => sortBy("a")}>
                  A
                </TH>
                <TH role="button" onClick={() => sortBy("b")}>
                  B
                </TH>
                <TH role="button" onClick={() => sortBy("km")}>
                  km
                </TH>
              </TR>
            </THead>
            <TBody>
              {sorted.map((p, i) => (
                <TR key={i}>
                  <TD>{p.a}</TD>
                  <TD>{p.b}</TD>
                  <TD>{p.km}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
