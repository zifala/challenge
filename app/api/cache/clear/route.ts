import { NextResponse } from 'next/server';
import { distanceCache } from '@/lib/cache';

export async function POST() {
  try {
    distanceCache.clear();
    return NextResponse.json({ 
      message: 'Cache cleared successfully',
      stats: distanceCache.getStats()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
