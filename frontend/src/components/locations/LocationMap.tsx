import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/router';

// Fix Leaflet icon issues
const fixLeafletIcon = () => {
  // Fix the default icon
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });
};

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  overallRating: number;
}

interface LocationMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function LocationMap({ 
  locations, 
  center = [50.4501, 30.5234], // Default to Kyiv
  zoom = 12,
  height = '600px'
}: LocationMapProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Only render map on client-side
  useEffect(() => {
    setIsClient(true);
    fixLeafletIcon();
  }, []);
  
  const handleLocationClick = (locationId: string) => {
    router.push(`/locations/${locationId}`);
  };
  
  // Custom marker icon
  const accessibleIcon = new L.Icon({
    iconUrl: '/images/accessible-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  
  if (!isClient) {
    return <div className="bg-gray-100 rounded-lg" style={{ height }}></div>;
  }
  
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height, width: '100%' }}
      className="rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {locations.map((location) => (
        <Marker 
          key={location.id}
          position={[location.latitude, location.longitude]}
          icon={accessibleIcon}
          eventHandlers={{
            click: () => handleLocationClick(location.id),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-semibold">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.address}</p>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(location.overallRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <button 
                onClick={() => handleLocationClick(location.id)}
                className="mt-2 text-sm text-primary-600 hover:text-primary-800"
              >
                Детальніше
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
