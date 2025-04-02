'use client'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationPickerMapProps {
  onMapClick: (lat: number, lng: number) => void
  onMapReady?: () => void
  defaultPosition: [number, number]
  markerPosition: [number, number]
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

// Event component to handle map clicks
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  
  return null
}

export default function LocationPickerMap({ 
  onMapClick, 
  onMapReady,
  defaultPosition,
  markerPosition
}: LocationPickerMapProps) {
  const [isReady, setIsReady] = useState(false)
  const customIcon = useMemo(() => createCustomIcon(), [])
  
  // Call onMapReady when map is initialized
  useEffect(() => {
    if (isReady && onMapReady) {
      onMapReady()
    }
  }, [isReady, onMapReady])

  return (
    <MapContainer 
      center={defaultPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      whenReady={() => setIsReady(true)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Click handler */}
      <MapEvents onClick={onMapClick} />
      
      {/* Marker at selected position */}
      <Marker 
        position={markerPosition as LatLngExpression} 
        icon={customIcon}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target
            const position = marker.getLatLng()
            onMapClick(position.lat, position.lng)
          },
        }}
      />
    </MapContainer>
  )
}