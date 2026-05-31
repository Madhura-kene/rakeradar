import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { STATIONS, ROUTE_PATH } from '../data/routeData';
import './MapView.css';
import { useEffect } from 'react';

// Custom station marker dot
const stationIcon = L.divIcon({
  className: 'station-marker',
  html: '<div class="station-dot"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Returns custom L.divIcon based on direction to color code rakes
const getTrainIcon = (trainId) => {
  const emoji = trainId === '99812' ? '🚆' : '🚇';
  const colorClass = trainId === '99812' ? 'train-up' : 'train-down';
  
  return L.divIcon({
    className: `train-marker ${colorClass}`,
    html: `<div class="train-icon">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

// Component to dynamically pan map coordinates to the focused train
const MapController = ({ selectedTrainId, trains }) => {
  const map = useMap();
  
  useEffect(() => {
    if (trains && trains[selectedTrainId]) {
      const activeTrain = trains[selectedTrainId];
      if (activeTrain.position) {
        map.panTo([activeTrain.position.lat, activeTrain.position.lng], {
          animate: true,
          duration: 1.0 // Smooth 1-second pan animation
        });
      }
    }
  }, [selectedTrainId, trains, map]);
  
  return null;
};

export const MapView = ({ trains, selectedTrainId, onTrainClick, onStationClick }) => {
  // Midpoint center for Leaflet container
  const mapCenter = [18.636, 73.784];

  // Retrieve only the active train that matches the selected option
  const activeTrain = trains ? trains[selectedTrainId] : null;

  return (
    <div className="map-container">
      <MapContainer 
        center={mapCenter} 
        zoom={11} 
        zoomControl={false} 
        className="leaflet-map"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Railway Route Line */}
        <Polyline 
          positions={ROUTE_PATH} 
          color="var(--accent-blue)" 
          weight={4} 
          opacity={0.8} 
        />

        {/* Station Markers */}
        {STATIONS.map((station, idx) => (
          <Marker 
            key={idx} 
            position={[station.lat, station.lng]} 
            icon={stationIcon}
            eventHandlers={{
              click: () => onStationClick(station)
            }}
          />
        ))}

        {/* Render ONLY the selected train marker on the map */}
        {activeTrain && (
          <Marker 
            position={[activeTrain.position.lat, activeTrain.position.lng]} 
            icon={getTrainIcon(activeTrain.id)}
            eventHandlers={{
              click: () => onTrainClick(activeTrain.id)
            }}
          >
            <Popup className="train-popup">
              <div style={{ fontFamily: 'var(--font-family)' }}>
                <strong style={{ 
                  color: activeTrain.id === '99812' ? 'var(--accent-blue)' : 'var(--accent-orange)' 
                }}>
                  {activeTrain.id === '99812' ? '🚆 Up Local' : '🚇 Down Local'} {activeTrain.id}
                </strong><br/>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Next Stop: {activeTrain.position.nextStation}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Panning Controller */}
        <MapController selectedTrainId={selectedTrainId} trains={trains} />
      </MapContainer>
    </div>
  );
};
