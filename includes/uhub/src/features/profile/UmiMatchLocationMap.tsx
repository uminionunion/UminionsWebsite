import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';

// Fix for default Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const GreenMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RedMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapClickHelper = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const UmiMatchLocationMap = ({ user, onLocationSelected, onExit }: { user: any; onLocationSelected: (city: string) => void; onExit: () => void }) => {
  const [otherMarkers, setOtherMarkers] = useState<any[]>([]);
  const [myMarker, setMyMarker] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetch('/api/umimatch/all-markers', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setOtherMarkers(data.markers || []))
      .catch(() => {});
  }, []);

  const handleMapClick = async (lat: number, lng: number) => {
    // Reverse geocode to get city name
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
      
      // Save coordinates to profile
      await fetch('/api/umimatch/profile', { 
        method: 'PUT', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ city, lat, lng }) 
      });

      onLocationSelected(city);
      onExit();
    } catch (e) {
      alert('Error saving location.');
    }
  };

  return (
    <div className="h-full w-full relative bg-black">
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <Button variant="outline" onClick={onExit}>Cancel</Button>
        <p className="text-white text-sm bg-black/50 p-2 rounded">Click map to set your location</p>
      </div>
      <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHelper onLocationSelect={handleMapClick} />
        {myMarker && <Marker position={[myMarker.lat, myMarker.lng]} icon={GreenMarker} />}
        {otherMarkers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={RedMarker} />
        ))}
      </MapContainer>
    </div>
  );
};

export default UmiMatchLocationMap;
