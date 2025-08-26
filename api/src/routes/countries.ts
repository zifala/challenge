import { Router } from "express";
import {
  getAllCountries,
  getCountryByCode,
  calculateDistancePairs,
  calculateDistancePairsWithProgress,
  validateCountryCodes,
} from "../services/countryService";
import { DistanceRequest, DistanceResponse, ProgressMessage } from "../types";

const router = Router();

// GET /api/countries - Return all countries
router.get("/countries", (req, res) => {
  try {
    const countries = getAllCountries();
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/distances - Calculate distances between countries

router.post("/distances", (req, res) => {
  try {
    const { countries }: DistanceRequest = req.body

    if(!countries || !Array.isArray(countries) || countries.length < 2){
        return res.status(400).json({
        error: "Please provide at least 2 country codes in the countries array",
      });
    }

    const uniqueCountries = [...new Set(countries)];
    const {valid, invalid } = validateCountryCodes(uniqueCountries)

    if (invalid.length > 0) {
      return res.status(400).json({
        error: "Invalid country codes",
        invalid,
      });
    }

    const pairs = calculateDistancePairs(valid);

    const response: DistanceResponse = {
      pairs,
      count: pairs.length,
      unit: "km",
    };

    res.json(response);
  } catch (error) {
    console.error("Error calculating distances:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/distances/stream - SSE endpoint for streaming distance calculations
router.get("/distances/stream", async (req, res) => {
  const countryCodes = req.query.countries as string;

  if (!countryCodes) {
    return res.status(400).json({ error: "Missing countries query parameter" });
  }

  try {
    const countries = countryCodes.split(",");
    const uniqueCountries = [...new Set(countries)];

    if (uniqueCountries.length < 2) {
      return res.status(400).json({
        error: "Please provide at least 2 country codes",
      });
    }

    const { valid, invalid } = validateCountryCodes(uniqueCountries);

    if (invalid.length > 0) {
      return res.status(400).json({
        error: "Invalid country codes",
        invalid,
      });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const allPairs: any[] = [];

    await calculateDistancePairsWithProgress(valid, (done, total, latest) => {
      if (latest) allPairs.push(latest);

      const message: ProgressMessage = { done, total, latest };
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    });

    const sortedPairs = allPairs.sort((a, b) => a.km - b.km);
    const finalResponse: DistanceResponse = {
      pairs: sortedPairs,
      count: sortedPairs.length,
      unit: "km",
    };

    res.write(`data: ${JSON.stringify({ final: finalResponse })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error in SSE stream:", error);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
});

export default router;
