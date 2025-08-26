'use client';

import { useState } from 'react';
import { DistancePair } from '@/lib/utils';

interface ResultsTableProps {
  pairs: DistancePair[];
  onDownloadCSV: () => void;
}

type SortField = 'distance' | 'country1' | 'country2';
type SortDirection = 'asc' | 'desc';

export default function ResultsTable({ pairs, onDownloadCSV }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('distance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPairs = [...pairs].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'distance':
        aValue = a.distance;
        bValue = b.distance;
        break;
      case 'country1':
        aValue = a.country1.name;
        bValue = b.country1.name;
        break;
      case 'country2':
        aValue = a.country2.name;
        bValue = b.country2.name;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getSortText = (field: SortField) => {
    const baseText = field === 'distance' ? 'Distance (km)' : 
                    field === 'country1' ? 'Country 1' : 'Country 2';
    const icon = getSortIcon(field);
    return `${baseText} ${icon}`;
  };

  if (pairs.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={onDownloadCSV}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Download CSV
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-gray-600">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th 
                className="border-b border-gray-600 px-6 py-4 text-left cursor-pointer hover:bg-gray-700 transition-colors text-white font-semibold"
                onClick={() => handleSort('country1')}
              >
                {getSortText('country1')}
              </th>
              <th className="border-b border-gray-600 px-6 py-4 text-left text-gray-300 font-semibold">
                Capital 1
              </th>
              <th 
                className="border-b border-gray-600 px-6 py-4 text-left cursor-pointer hover:bg-gray-700 transition-colors text-white font-semibold"
                onClick={() => handleSort('country2')}
              >
                {getSortText('country2')}
              </th>
              <th className="border-b border-gray-600 px-6 py-4 text-left text-gray-300 font-semibold">
                Capital 2
              </th>
              <th 
                className="border-b border-gray-600 px-6 py-4 text-left cursor-pointer hover:bg-gray-700 transition-colors text-white font-semibold"
                onClick={() => handleSort('distance')}
              >
                {getSortText('distance')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPairs.map((pair, index) => (
              <tr key={index} className="hover:bg-gray-700/50 transition-colors border-b border-gray-600">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">{pair.country1.name}</div>
                    <div className="text-sm text-gray-400">{pair.country1.iso2}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {pair.country1.capital}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">{pair.country2.name}</div>
                    <div className="text-sm text-gray-400">{pair.country2.iso2}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {pair.country2.capital}
                </td>
                <td className="px-6 py-4 font-mono text-blue-400 font-semibold">
                  {pair.distance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
