import React from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in leaflet if needed
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

function MapCenter({ polygon }) {
  const map = useMap();
  React.useEffect(() => {
    if (polygon && polygon.length > 0) {
      const bounds = L.latLngBounds(polygon);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polygon, map]);
  return null;
}

export function NDVIMap({ polygon, status = 'healthy', showOverlay = true }) {
  const colorMap = {
    healthy: '#1D9E75', // km-green
    stressed: '#BA7517', // km-amber
    critical: '#A32D2D' // km-red
  };

  const fillColor = colorMap[status] || colorMap.healthy;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={polygon[0]} 
        zoom={16} 
        scrollWheelZoom={false}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
        />
        {showOverlay && (
          <Polygon 
            positions={polygon} 
            pathOptions={{ 
              color: '#ffffff', 
              weight: 2, 
              fillColor, 
              fillOpacity: 0.6 
            }} 
          />
        )}
        <MapCenter polygon={polygon} />
      </MapContainer>
    </div>
  );
}
