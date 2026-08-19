
import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Pantry, Politician, Candidate } from './types';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { getIconForPantry, getRandomIcon, getIconForPolitician, getIconForCandidate } from './marker-icons';

interface PantryMapProps {
  pantries: Pantry[];
  politicians?: Politician[];
  candidates?: Candidate[];
  onViewDetails: (pantry: Pantry) => void;
  isPreview?: boolean;
}

export function PantryMap({ pantries = [], politicians = [], candidates = [], onViewDetails, isPreview = false }: PantryMapProps) {
  const mapRef = React.useRef<L.Map>(null);
  const markerRefs = React.useRef<{ [key: string]: L.Marker | null }>({});
  
  React.useEffect(() => {
    const senators = politicians.filter(p => p.office === 'Senate');
    console.log('Map rendering - Politicians:', politicians.length, 'Senators:', senators.length);
    const stateCount: { [key: string]: number } = {};
    senators.forEach(s => {
      stateCount[s.state] = (stateCount[s.state] || 0) + 1;
    });
    console.log('Map - Senators per state:', stateCount);
  }, [politicians]);

  const handleMarkerClick = (pantry: Pantry) => {
    if (isPreview) return;
    const marker = markerRefs.current[`pantry-${pantry.id}`];
    if (marker) {
      marker.setIcon(getRandomIcon(pantry.type));
    }
  };

  React.useEffect(() => {
    if (mapRef.current) {
      // Invalidate size after a short delay to ensure container is sized
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={[39.8283, -98.5795]}
      zoom={isPreview ? 3 : 4}
      scrollWheelZoom={!isPreview}
      className="h-full w-full z-0"
      zoomControl={!isPreview}
      attributionControl={!isPreview}
      dragging={!isPreview}
      doubleClickZoom={!isPreview}
      touchZoom={!isPreview}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pantries.map(pantry => (
        <Marker
          key={`pantry-${pantry.id}`}
          position={[pantry.lat, pantry.lng]}
          icon={getIconForPantry(pantry)}
          ref={el => { if(el) markerRefs.current[`pantry-${pantry.id}`] = el }}
          eventHandlers={{
            click: () => handleMarkerClick(pantry),
          }}
        >
          {!isPreview && (
            <Popup>
              <div className="font-sans p-2 rounded-md">
                <h3 className="font-bold text-base mb-1">{pantry.name}</h3>
                <p className="text-sm text-muted-foreground m-0">{pantry.address}</p>
                <p className="text-sm mt-2 m-0">{pantry.notes}</p>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onViewDetails(pantry)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
      {!isPreview && politicians.map(politician => {
        let { lat, lng } = politician;
        // Add a small jitter to senator positions to avoid overlap
        if (politician.office === 'Senate') {
            lat += (Math.random() - 0.5) * 0.2;
            lng += (Math.random() - 0.5) * 0.2;
        }
        
        return (
          <Marker
            key={`politician-${politician.id}`}
            position={[lat, lng]}
            icon={getIconForPolitician(politician)}
          >
            <Popup>
              <div className="font-sans p-2 rounded-md">
                <h3 className="font-bold text-base mb-1">{politician.name}</h3>
                <p className="text-sm m-0">{politician.office} for {politician.state}{politician.district ? `-${politician.district}` : ''}</p>
                <p className="text-xs text-muted-foreground m-0">In office until: {politician.term_end_date}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {!isPreview && candidates.map(candidate => (
        <Marker
          key={`candidate-${candidate.id}`}
          position={[candidate.lat, candidate.lng]}
          icon={getIconForCandidate(candidate)}
        >
          <Popup>
            <div className="font-sans p-2 rounded-md">
              <h3 className="font-bold text-base mb-1">{candidate.name}</h3>
              <p className="text-sm m-0">Running for {candidate.office}</p>
              <p className="text-sm m-0">{candidate.state}{candidate.district ? `-${candidate.district}` : ''}</p>
              <a href="https://uminion.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                Website
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
