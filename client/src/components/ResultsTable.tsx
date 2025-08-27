import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from './Icons';
import type { CountryPair } from '../types';
import { downloadCSV, formatNumber } from '../utils';

interface ResultsTableProps {
  pairs: CountryPair[];
  totalCount: number;
  unit: string;
}

type SortField = 'a' | 'b' | 'km';
type SortDirection = 'asc' | 'desc';

export function ResultsTable({ pairs, totalCount, unit }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('km');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort the pairs based on current sort settings
  const sortedPairs = useMemo(() => {
    return [...pairs].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'a':
          aValue = a.a;
          bValue = b.a;
          break;
        case 'b':
          aValue = a.b;
          bValue = b.b;
          break;
        case 'km':
          aValue = a.km;
          bValue = b.km;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }, [pairs, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const handleDownloadCSV = () => {
    downloadCSV(sortedPairs, `country-distances-${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (pairs.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header with download button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Distance Results</h2>
          <p className="text-sm text-gray-600">
            {formatNumber(totalCount)} pairs calculated, sorted by distance
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('a')}
              >
                <div className="flex items-center gap-1">
                  Country A
                  {getSortIcon('a')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('b')}
              >
                <div className="flex items-center gap-1">
                  Country B
                  {getSortIcon('b')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('km')}
              >
                <div className="flex items-center gap-1">
                  Distance ({unit})
                  {getSortIcon('km')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPairs.map((pair, index) => (
              <tr key={`${pair.a}-${pair.b}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pair.a}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pair.b}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(pair.km)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Shortest Distance:</span> {formatNumber(sortedPairs[0]?.km || 0)} {unit}
          </div>
          <div>
            <span className="font-medium">Longest Distance:</span> {formatNumber(sortedPairs[sortedPairs.length - 1]?.km || 0)} {unit}
          </div>
          <div>
            <span className="font-medium">Average Distance:</span> {formatNumber(Math.round(pairs.reduce((sum, pair) => sum + pair.km, 0) / pairs.length))} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}