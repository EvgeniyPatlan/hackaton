'use client'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import { useEffect, useState, useMemo } from 'react'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import 'leaflet/dist/leaflet.css'

// Define proper types for location data
interface Coordinates {
  x: number; // longitude
  y: number; // latitude
}

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  accessibilityFeatures?: string[];
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

export default function MapView() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default center for Ukraine
  const defaultCenter: [number, number] = [50.45, 30.52]; // Kyiv
  
  const customIcon = useMemo(() => createCustomIcon(), []);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/locations')
      .then(res => {
        if (!res.ok) {
          throw new Error(`${t('error.fetchFailed')}: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setLocations(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching locations:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [t]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full bg-white bg-opacity-70 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full bg-white bg-opacity-90 rounded-lg p-4">
      <div className="text-red-500 text-center">
        <p className="text-xl font-bold">{t('error.mapLoadFailed')}</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t('common.retry')}
        </button>
      </div>
    </div>;
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.coordinates.y, loc.coordinates.x]}
            icon={customIcon}
          >
            <Popup className="location-popup">
              <div className="font-semibold text-lg">{loc.name}</div>
              <div className="text-gray-600">{loc.address}</div>
              {loc.accessibilityFeatures && loc.accessibilityFeatures.length > 0 && (
                <div className="mt-2">
                  <strong>{t('accessibility.features')}:</strong>
                  <ul className="list-disc list-inside">
                    {loc.accessibilityFeatures.map((feature, index) => (
                      <li key={index} className="text-sm">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-md shadow-md p-2 text-xs">
        <div className="font-semibold">{t('map.locations')}: {locations.length}</div>
      </div>
    </div>
  );
}