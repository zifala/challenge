import { NextResponse } from 'next/server';
import { distanceCache } from '@/lib/cache';

export async function GET() {
  try {
    const stats = distanceCache.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
}
