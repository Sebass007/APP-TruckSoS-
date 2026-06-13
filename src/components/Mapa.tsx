'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

interface MapaProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  isSelectionMode?: boolean;
  markers?: Array<{
    id: string;
    position: [number, number];
    type: 'truck' | 'car' | 'provider' | 'camion' | 'auto' | 'minivan' | 'moto';
    label: string;
  }>;
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
  markers = [] 
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

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

        {!isSelectionMode && markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position} 
            icon={marker.type === 'truck' || marker.type === 'camion' ? truckIcon : carIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <p className="font-bold text-neutral-900">{marker.label}</p>
              </div>
            </Popup>
          </Marker>
        ))}
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
