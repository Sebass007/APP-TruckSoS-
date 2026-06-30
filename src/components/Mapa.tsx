'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/741/741407.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const workshopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3256/3256360.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

interface MapaProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  isSelectionMode?: boolean;
  markers?: Array<{
    id: string;
    position: [number, number];
    type: 'truck' | 'car' | 'provider' | 'camion' | 'auto' | 'minivan' | 'moto' | 'workshop' | 'taller';
    label: string;
  }>;
  activeRoutePoints?: Array<[number, number]>;
}

// Component to handle map movement events
function MapController({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      onMoveEnd(center.lat, center.lng);
    },
  });
  return null;
}

const Mapa: React.FC<MapaProps> = ({ 
  center = [-16.409, -71.537], // Default to Arequipa
  zoom = 13,
  onLocationSelect,
  isSelectionMode = false,
  markers = [],
  activeRoutePoints
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  const generateStreetRoute = (start: [number, number], end: [number, number]): Array<[number, number]> => {
    const [lat1, lon1] = start;
    const [lat2, lon2] = end;
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    // Generar un trazo con múltiples giros (estilo cuadrícula de calles de Yango/InDrive)
    return [
      [lat1, lon1],
      [lat1 + dLat * 0.35, lon1], // Avanza por la primera avenida
      [lat1 + dLat * 0.35, lon1 + dLon * 0.65], // Dobla en la esquina y avanza por la calle cruzada
      [lat1 + dLat * 0.75, lon1 + dLon * 0.65], // Dobla de nuevo en la siguiente avenida
      [lat1 + dLat * 0.75, lon1 + dLon], // Dobla hacia la calle del destino
      [lat2, lon2] // Llega al destino
    ];
  };

  const clientMarker = markers.find(m => m.id === 'me' || (m.label && typeof m.label === 'string' && m.label.toUpperCase().includes('EN SERVICIO:')));
  const providerMarker = markers.find(m => m.id === 'provider' || m.id === 'my-location');
  
  let routePoints: Array<[number, number]> | null = null;
  if (activeRoutePoints && activeRoutePoints.length >= 2) {
    routePoints = generateStreetRoute(activeRoutePoints[0], activeRoutePoints[activeRoutePoints.length - 1]);
  } else if (clientMarker && providerMarker) {
    routePoints = generateStreetRoute(providerMarker.position, clientMarker.position);
  }

  if (!isMounted) return <div className="h-full w-full bg-neutral-900 animate-pulse rounded-2xl flex items-center justify-center text-neutral-500 font-black italic uppercase">Cargando Mapa...</div>;

  return (
    <div className="h-full w-full relative overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {isSelectionMode && onLocationSelect && (
          <MapController onMoveEnd={onLocationSelect} />
        )}

        {routePoints && (
          <React.Fragment key={routePoints.map(p => p.join(',')).join('|')}>
            {/* Camino de fondo gris/azul oscuro grueso para simular pista */}
            <Polyline 
              positions={routePoints} 
              pathOptions={{ color: '#1e293b', weight: 8, opacity: 0.6, lineJoin: 'round', lineCap: 'round' }} 
            />
            {/* Trazo azul/verde brillante estilo Yango / InDrive */}
            <Polyline 
              positions={routePoints} 
              pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }} 
            />
            {/* Línea interna punteada blanca animada para simular tráfico/movimiento */}
            <Polyline 
              positions={routePoints} 
              pathOptions={{ color: '#60a5fa', weight: 2, opacity: 0.9, dashArray: '8, 12', lineJoin: 'round' }} 
            />
          </React.Fragment>
        )}

        {!isSelectionMode && markers.map((marker) => {
          let chosenIcon = carIcon;
          if (marker.type === 'truck' || marker.type === 'camion') {
            chosenIcon = truckIcon;
          } else if (marker.type === 'workshop' || marker.type === 'taller') {
            chosenIcon = workshopIcon;
          }
          return (
            <Marker 
              key={marker.id} 
              position={marker.position} 
              icon={chosenIcon}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <p className="font-bold text-neutral-900">{marker.label}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Fixed Pin for Selection Mode (InDrive Style) */}
      {isSelectionMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000] mb-10">
          <div className="relative flex flex-col items-center">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white animate-bounce">
              <MapPin className="text-white w-6 h-6" />
            </div>
            <div className="w-2 h-2 bg-black/40 rounded-full blur-[1px] mt-1 scale-x-150"></div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          background: #0a0a0a;
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .leaflet-tile-pane {
          filter: brightness(0.6) contrast(1.2) saturate(0.5);
        }
      `}</style>
    </div>
  );
};

export default Mapa;
