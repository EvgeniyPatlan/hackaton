'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import types
import type { Location } from '@/services/api'

interface DashboardMapProps {
  location: Location
}

// Custom marker icon to fix the default icon issue
const createCustomIcon = () => {
  return L.icon({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function DashboardMap({ location }: DashboardMapProps) {
  // Create marker position
  const position: [number, number] = [location.coordinates.y, location.coordinates.x]
  
  // Create marker icon
  const customIcon = useMemo(() => createCustomIcon(), [])

  return (
    <MapContainer 
      center={position}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={customIcon}>
        <Popup>
          <div>
            <div className="font-medium">{location.name}</div>
            <div className="text-sm text-gray-600">{location.address}</div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}