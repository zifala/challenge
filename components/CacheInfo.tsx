'use client';

import { useState, useEffect } from 'react';

interface CacheStats {
  size: number;
  maxSize: number;
  keys: string[];
}

export default function CacheInfo() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache/clear', { method: 'POST' });
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) {
    return null;
  }

  const cacheUsage = (stats.size / stats.maxSize) * 100;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-white">Cache Status</h4>
        <button
          onClick={clearCache}
          disabled={loading}
          className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Clearing...' : 'Clear Cache'}
        </button>
      </div>
      
      <div className="text-xs text-gray-300 space-y-2">
        <div className="flex justify-between">
          <span>Usage:</span>
          <span>{stats.size} / {stats.maxSize} entries</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${cacheUsage}%` }}
          />
        </div>
        
        <div className="text-xs text-blue-400">
          {cacheUsage.toFixed(1)}% used
        </div>
        
        {stats.keys.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-300 hover:text-blue-200 transition-colors">
              Cached items ({stats.keys.length})
            </summary>
            <div className="mt-2 text-xs text-gray-400 max-h-20 overflow-y-auto bg-gray-800/50 rounded p-2">
              {stats.keys.slice(0, 10).map((key, index) => (
                <div key={index} className="truncate">
                  {key}
                </div>
              ))}
              {stats.keys.length > 10 && (
                <div className="text-blue-400">
                  ... and {stats.keys.length - 10} more
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
