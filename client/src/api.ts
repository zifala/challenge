import type { Country, DistanceResponse, ProgressMessage } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = {
  // Fetch all countries
  async getCountries(): Promise<Country[]> {
    const response = await fetch(`${API_BASE}/api/countries`);
    console.log(`${API_BASE}----${`${API_BASE}/api/countries`}`);
    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }
    return response.json();
  },
  // Calculate distances between countries
  async calculateDistances(
    countryCodes: string[]
  ): Promise<DistanceResponse[]> {
    const response = await fetch(`${API_BASE}/api/distances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ countries: countryCodes }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to calculate distances");
    }
    return response.json();
  },
  // Stream distance calculations with progress updates
  streamDistances(
    countryCodes: string[],
    onProgress: (message: ProgressMessage) => void,
    onComplete: (result: DistanceResponse) => void,
    onError: (error: string) => void
  ): () => void {
    const countries = countryCodes.join(",");
    const eventSource = new EventSource(`${API_BASE}/api/distances/stream?countries=${countries}`);

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressMessage = JSON.parse(event.data);

        if (data.error) {
          onError(data.error);
          eventSource.close();
          return;
        }

        if (data.final) {
          onComplete(data.final);
          eventSource.close();
          return;
        }

        onProgress(data);
      } catch (error) {
        onError("Failed to parse progress data");
        eventSource.close();
      }
    };

    eventSource.onerror = () => {[]
      onError("Connection to server lost");
      eventSource.close();
    };

    // Return cleanup function
    return () => eventSource.close();
  },
};
