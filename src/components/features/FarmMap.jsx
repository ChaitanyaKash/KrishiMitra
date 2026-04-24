import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

const satelliteStyle = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Tiles © Esri',
    },
    'esri-reference': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 22 },
    { id: 'reference-layer', type: 'raster', source: 'esri-reference', minzoom: 0, maxzoom: 22 },
  ],
};

export default function FarmMap({ onLocationSelect, initialLocation }) {
  const [marker, setMarker] = useState(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lon } : null,
  );
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.lon ?? 80.9,
    latitude: initialLocation?.lat ?? 22.5,
    zoom: initialLocation ? 14 : 5,
  });

  useEffect(() => {
    if (!initialLocation) {
      return;
    }

    setMarker({ lat: initialLocation.lat, lng: initialLocation.lon });
    setViewState({
      latitude: initialLocation.lat,
      longitude: initialLocation.lon,
      zoom: 14,
    });
  }, [initialLocation]);

  const onMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    setMarker({ lat, lng });
    onLocationSelect?.(lat, lng);
  };

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border-4 border-green-800/20 shadow-lg">
      <Map
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        onClick={onMapClick}
        mapLib={maplibregl}
        mapStyle={satelliteStyle}
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" />

        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MapPin size={40} className="fill-km-red text-km-red drop-shadow-[0_8px_14px_rgba(163,45,45,0.35)]" />
              <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-800 shadow">
                Your Farm
              </span>
            </motion.div>
          </Marker>
        )}
      </Map>

      {!marker && (
        <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-center">
          <div className="animate-pulse rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
            Click on the map to select your farm
          </div>
        </div>
      )}
    </div>
  );
}
