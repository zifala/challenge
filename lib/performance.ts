import { Country, DistancePair } from './utils';

export interface BatchConfig {
  batchSize: number;
  delayMs: number;
  maxConcurrent: number;
}

export interface PerformanceMetrics {
  totalPairs: number;
  processedPairs: number;
  startTime: number;
  currentTime: number;
  estimatedTimeRemaining: number;
  pairsPerSecond: number;
}

export class PerformanceOptimizer {
  private static readonly DEFAULT_BATCH_SIZE = 1000;
  private static readonly DEFAULT_DELAY_MS = 10;
  private static readonly DEFAULT_MAX_CONCURRENT = 4;

  /**
   * Calculate total pairs for n countries
   * Formula: n * (n-1) / 2
   */
  static calculateTotalPairs(count: number): number {
    return (count * (count - 1)) / 2;
  }

  /**
   * Estimate processing time based on pairs count
   */
  static estimateProcessingTime(pairsCount: number): number {
    // Rough estimate: 1ms per 100 pairs
    return Math.max(1000, pairsCount * 0.01);
  }

  /**
   * Generate batches of pairs for processing
   */
  static generateBatches(
    countries: Country[],
    batchSize: number = this.DEFAULT_BATCH_SIZE
  ): [Country, Country][][] {
    const pairs: [Country, Country][] = [];
    
    // Generate all pairs
    for (let i = 0; i < countries.length; i++) {
      for (let j = i + 1; j < countries.length; j++) {
        pairs.push([countries[i], countries[j]]);
      }
    }

    // Split into batches
    const batches: [Country, Country][][] = [];
    for (let i = 0; i < pairs.length; i += batchSize) {
      batches.push(pairs.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Process batches with streaming updates
   */
  static async processBatchesWithStreaming(
    countries: Country[],
    onProgress: (metrics: PerformanceMetrics) => void,
    onBatchComplete: (batch: DistancePair[]) => void,
    config: Partial<BatchConfig> = {}
  ): Promise<DistancePair[]> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      delayMs = this.DEFAULT_DELAY_MS,
      maxConcurrent = this.DEFAULT_MAX_CONCURRENT
    } = config;

    const startTime = Date.now();
    const totalPairs = this.calculateTotalPairs(countries.length);
    const batches = this.generateBatches(countries, batchSize);
    const allResults: DistancePair[] = [];
    let processedPairs = 0;

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += maxConcurrent) {
      const currentBatches = batches.slice(i, i + maxConcurrent);
      
      // Process current batch group concurrently
      const batchPromises = currentBatches.map(async (batch, batchIndex) => {
        const batchResults = this.processBatch(batch);
        
        // Add delay to prevent overwhelming the system
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        return batchResults;
      });

      const batchResults = await Promise.all(batchPromises);
      
      // Update progress
      for (const batchResult of batchResults) {
        processedPairs += batchResult.length;
        allResults.push(...batchResult);
        
        // Calculate metrics
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const pairsPerSecond = processedPairs / (elapsed / 1000);
        const remainingPairs = totalPairs - processedPairs;
        const estimatedTimeRemaining = remainingPairs / pairsPerSecond * 1000;

        const metrics: PerformanceMetrics = {
          totalPairs,
          processedPairs,
          startTime,
          currentTime,
          estimatedTimeRemaining,
          pairsPerSecond
        };

        onProgress(metrics);
        onBatchComplete(batchResult);
      }
    }

    // Sort final results by distance
    return allResults.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Process a single batch of pairs
   */
  private static processBatch(batch: [Country, Country][]): DistancePair[] {
    return batch.map(([country1, country2]) => ({
      country1,
      country2,
      distance: this.calculateDistance(country1, country2)
    }));
  }

  /**
   * Calculate distance between two countries
   */
  private static calculateDistance(country1: Country, country2: Country): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (country2.lat - country1.lat) * Math.PI / 180;
    const dLon = (country2.lon - country1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(country1.lat * Math.PI / 180) * Math.cos(country2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Get optimal batch configuration based on country count
   */
  static getOptimalConfig(countryCount: number): BatchConfig {
    const totalPairs = this.calculateTotalPairs(countryCount);
    
    if (totalPairs <= 1000) {
      return { batchSize: 100, delayMs: 5, maxConcurrent: 2 };
    } else if (totalPairs <= 10000) {
      return { batchSize: 500, delayMs: 10, maxConcurrent: 3 };
    } else if (totalPairs <= 50000) {
      return { batchSize: 1000, delayMs: 15, maxConcurrent: 4 };
    } else {
      return { batchSize: 2000, delayMs: 20, maxConcurrent: 6 };
    }
  }

  /**
   * Format performance metrics for display
   */
  static formatMetrics(metrics: PerformanceMetrics): string {
    const elapsed = (metrics.currentTime - metrics.startTime) / 1000;
    const progress = ((metrics.processedPairs / metrics.totalPairs) * 100).toFixed(1);
    const eta = (metrics.estimatedTimeRemaining / 1000).toFixed(1);
    const pps = Math.round(metrics.pairsPerSecond);

    return `Progress: ${progress}% (${metrics.processedPairs}/${metrics.totalPairs}) | Speed: ${pps} pairs/sec | ETA: ${eta}s`;
  }
}
