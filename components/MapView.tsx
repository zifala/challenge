'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DistancePair } from '@/lib/utils';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface MapViewProps {
  pairs: DistancePair[];
  maxPairs?: number;
}

export default function MapView({ pairs, maxPairs = 20 }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Fix Leaflet icon issue - only import when client-side
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      import('leaflet').then((L) => {
        const icon = new L.default.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        setCustomIcon(icon);
        setIsLeafletReady(true);
      }).catch((error) => {
        console.error('Failed to load Leaflet:', error);
        setIsLeafletReady(true); // Still set to true to show map without custom icons
      });
    }
  }, [isClient]);

  if (!isClient || !isLeafletReady) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  // Get top pairs for display
  const topPairs = pairs.slice(0, maxPairs);
  
  // Calculate center point for the map
  const allCountries = new Set<DistancePair['country1'] | DistancePair['country2']>();
  topPairs.forEach(pair => {
    allCountries.add(pair.country1);
    allCountries.add(pair.country2);
  });

  const countries = Array.from(allCountries);
  const centerLat = countries.reduce((sum, country) => sum + country.lat, 0) / countries.length;
  const centerLon = countries.reduce((sum, country) => sum + country.lon, 0) / countries.length;

  // Calculate max distance for color scaling
  const maxDistance = topPairs.length > 0 ? Math.max(...topPairs.map(p => p.distance)) : 1;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 text-white">
          Map View - Top {Math.min(topPairs.length, maxPairs)} Shortest Distances
        </h3>
        <p className="text-sm text-gray-300 mb-2">
          Click on markers to see country details. Lines show distances between countries.
        </p>
        <p className="text-sm text-blue-400 font-medium">
          Distance (km) - Interactive map with country markers and distance lines
        </p>
      </div>
      
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-600 shadow-2xl">
        {isLeafletReady && (
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Render country markers */}
            {countries.map((country, index) => (
              <Marker
                key={country.iso2}
                position={[country.lat, country.lon]}
                icon={customIcon}
              >
                <Popup>
                  <div className="text-center">
                    <h4 className="font-semibold text-white">{country.name}</h4>
                    <p className="text-sm text-gray-300">{country.capital}</p>
                    <p className="text-xs text-gray-400">({country.iso2})</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Render distance lines */}
            {topPairs.map((pair, index) => (
              <Polyline
                key={`${pair.country1.iso2}-${pair.country2.iso2}`}
                positions={[
                  [pair.country1.lat, pair.country1.lon],
                  [pair.country2.lat, pair.country2.lon]
                ]}
                color={getLineColor(pair.distance, maxDistance, topPairs.length)}
                weight={3}
                opacity={0.7}
              >
                <Popup>
                  <div className="text-center">
                    <h4 className="font-semibold text-white mb-2">Distance</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      {pair.country1.name} ↔ {pair.country2.name}
                    </p>
                    <p className="text-lg font-bold text-blue-400">
                      {pair.distance.toFixed(2)} km
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      {pair.country1.capital} to {pair.country2.capital}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            ))}
          </MapContainer>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-300">
        {topPairs.length <= 3 ? (
          <>
            <p className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-green-400"></span>
              Green lines: Short distances (≤1,000 km)
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-400"></span>
              Blue lines: Medium distances (1,001-3,000 km)
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-400"></span>
              Red lines: Long distances (&gt;3,000 km)
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-green-400"></span>
              Green lines: Shortest distances (0-33% of max)
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-400"></span>
              Blue lines: Medium distances (34-66% of max)
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-400"></span>
              Red lines: Longer distances (67-100% of max)
            </p>
          </>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Distance (km) - Click on markers or lines for details
        </p>
        {topPairs.length > 0 && (
          <p className="mt-1 text-xs text-blue-400">
            Max distance: {maxDistance.toFixed(0)} km
          </p>
        )}
      </div>
    </div>
  );
}

// Color gradient for distance lines based on actual distance values
function getLineColor(distance: number, maxDistance: number, totalPairs: number): string {
  // For small datasets (1-3 pairs), use absolute distance thresholds
  if (totalPairs <= 3) {
    if (distance <= 1000) return '#22c55e'; // Green for short distances
    if (distance <= 3000) return '#3b82f6'; // Blue for medium distances
    return '#ef4444'; // Red for long distances
  }
  
  // For larger datasets, use percentage-based thresholds
  const percentage = distance / maxDistance;
  
  if (percentage <= 0.33) return '#22c55e'; // Green for shortest (0-33%)
  if (percentage <= 0.66) return '#3b82f6'; // Blue for medium (34-66%)
  return '#ef4444'; // Red for longer (67-100%)
}
