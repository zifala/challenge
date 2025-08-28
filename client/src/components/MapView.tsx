// src/components/MapView.tsx
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import type { Country, CountryPair } from "../types";

interface MapViewProps {
  selectedCountries: Country[];
  pairs?: CountryPair[];
}

export function MapView({ selectedCountries, pairs = [] }: MapViewProps) {
  if (selectedCountries.length === 0) return null;

  const center: [number, number] =
    selectedCountries.length === 1
      ? [parseFloat(selectedCountries[0].latitude), parseFloat(selectedCountries[0].longitude)]
      : [20, 0]; // fallback center

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 bg-white">
      <MapContainer 
        center={center}
        zoom={3} // 🔒 fixed zoom level
        style={{ height: "100%", width: "100%" }}
        attributionControl={true}
        zoomControl={false} // 🔒 hide zoom controls
        scrollWheelZoom={false} // 🔒 disable mouse scroll zoom
        doubleClickZoom={false} // 🔒 disable double-click zoom
        dragging={true} // still allow dragging around
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
        />

        {selectedCountries.map((c) => (
          <CircleMarker
            key={c.id}
            center={[parseFloat(c.latitude), parseFloat(c.longitude)]}
            radius={8}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.8 }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="font-bold text-lg text-gray-800 mb-1">{c.name}</div>
                <div className="text-sm text-gray-600 mb-2">Code: {c.iso2}</div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Capital:</span> {c.capital}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {pairs?.map((pair) => {
          const countryA = selectedCountries.find((c) => c.iso2 === pair.a);
          const countryB = selectedCountries.find((c) => c.iso2 === pair.b);
          if (!countryA || !countryB) return null;

          return (
            <Polyline
              key={`${pair.a}-${pair.b}`}
              positions={[
                [parseFloat(countryA.latitude), parseFloat(countryA.longitude)],
                [parseFloat(countryB.latitude), parseFloat(countryB.longitude)],
              ]}
              pathOptions={{ 
                color: "#3b82f6", 
                weight: 3, 
                opacity: 0.8,
                dashArray: "10, 5"
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
