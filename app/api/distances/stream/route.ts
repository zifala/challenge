import { NextRequest } from 'next/server';
import { Country, StreamUpdate } from '@/lib/utils';
import { PerformanceOptimizer, PerformanceMetrics } from '@/lib/performance';
import countriesData from '@/data/countries.json';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { countries: isoCodes } = body;

        if (!isoCodes || !Array.isArray(isoCodes) || isoCodes.length < 2) {
          const error = { error: 'Please provide at least 2 country ISO codes' };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(error)}\n\n`));
          controller.close();
          return;
        }

        // Validate ISO codes
        const allCountries: Country[] = countriesData;
        const countryMap = new Map(allCountries.map(country => [country.iso2, country]));
        
        const selectedCountries: Country[] = [];
        const invalidCodes: string[] = [];

        for (const isoCode of isoCodes) {
          const country = countryMap.get(isoCode);
          if (country) {
            selectedCountries.push(country);
          } else {
            invalidCodes.push(isoCode);
          }
        }

        if (invalidCodes.length > 0) {
          const error = { 
            error: 'Invalid ISO codes provided',
            invalidCodes 
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(error)}\n\n`));
          controller.close();
          return;
        }

        // Get optimal configuration based on country count
        const config = PerformanceOptimizer.getOptimalConfig(selectedCountries.length);
        const totalPairs = PerformanceOptimizer.calculateTotalPairs(selectedCountries.length);

        // Send initial progress
        const initialUpdate: StreamUpdate = { done: 0, total: totalPairs };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialUpdate)}\n\n`));

        // Process with performance optimization
        const allResults: any[] = [];
        let processedCount = 0;

        await PerformanceOptimizer.processBatchesWithStreaming(
          selectedCountries,
          (metrics: PerformanceMetrics) => {
            // Send progress update
            const update: StreamUpdate = {
              done: metrics.processedPairs,
              total: metrics.totalPairs,
              latest: allResults[allResults.length - 1]
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
          },
          (batch: any[]) => {
            allResults.push(...batch);
            processedCount += batch.length;
          },
          config
        );

        // Send final result
        const finalResult = {
          pairs: allResults,
          count: allResults.length,
          unit: 'km'
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalResult)}\n\n`));
        controller.close();
      } catch (error) {
        console.error('Error in stream:', error);
        const errorResponse = { error: 'Failed to process distances' };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
