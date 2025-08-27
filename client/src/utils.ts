import type { CountryPair } from "./types";

export function downloadCSV(
  pairs: CountryPair[],
  filename: string = "country-distances.csv"
) {
  const headers = ["Country A", "Country B", "Distance (km)"];
  const csvContent = [
    headers.join(","),
    ...pairs.map((pair) => `${pair.a},${pair.b},${pair.km}`),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
