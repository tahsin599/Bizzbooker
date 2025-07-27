import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configure Leaflet markers
const createIcon = (color = 'blue') => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Enhanced geocoding with structured queries
const geocodeBangladeshLocation = async (location) => {
  try {
    // Respect Nominatim's 1 request/second policy
    await new Promise(resolve => setTimeout(resolve, 1100));

    const params = new URLSearchParams({
      street: location.address || '',
      city: location.city || '',
      county: location.area || '',
      country: 'Bangladesh',
      countrycodes: 'bd',
      format: 'jsonv2',
      addressdetails: 1,
      limit: 1,
      email: 'your@email.com' // Required for production use
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0',
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!data || data.length === 0) return null;

    return {
      ...location,
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name,
      osmData: data[0]
    };

  } catch (error) {
    console.error('Geocoding failed for:', location, error);
    return null;
  }
};

// Auto-fit map to markers
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations?.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

const LocationSelectMap = ({ locations = [] }) => {
  const [processedLocations, setProcessedLocations] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const processLocations = async () => {
      setIsGeocoding(true);
      
      try {
        const results = await Promise.all(
          locations.map(async (loc) => {
            // Skip if already has coordinates
            if (loc.latitude && loc.longitude) return loc;
            
            // Only geocode if we have minimal address info
            if (loc.address || loc.city || loc.area) {
              const geocoded = await geocodeBangladeshLocation(loc);
              return geocoded || loc;
            }
            return loc;
          })
        );

        setProcessedLocations(results.filter(loc => loc.latitude && loc.longitude));
      } finally {
        setIsGeocoding(false);
      }
    };

    processLocations();
  }, [locations]);

  // Calculate initial center
  const initialCenter = useMemo(() => {
    if (processedLocations.length > 0) {
      return [
        processedLocations[0].latitude,
        processedLocations[0].longitude
      ];
    }
    return [23.8103, 90.4125]; // Default to Dhaka coordinates
  }, [processedLocations]);

  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      {isGeocoding && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.9)',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderTopColor: '#0078d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Locating places in Bangladesh...</span>
        </div>
      )}

      <MapContainer 
        center={initialCenter} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <FitBounds locations={processedLocations} />
        
        {processedLocations.map((location) => (
          <Marker
            key={`${location.latitude}-${location.longitude}`}
            position={[location.latitude, location.longitude]}
            icon={createIcon(location.isPrimary ? 'red' : 'blue')}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>
                  {location.isPrimary && '⭐ '}
                  {location.name || 'Location'}
                </h4>
                <p style={{ margin: '5px 0' }}>
                  {location.address || 'No address provided'}
                </p>
                {location.city && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    {location.city}{location.area ? `, ${location.area}` : ''}
                  </p>
                )}
                <div style={{ marginTop: '8px', fontSize: '0.8em', color: '#888' }}>
                  {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </div>
                {location.formattedAddress && (
                  <div style={{ marginTop: '8px', fontSize: '0.8em' }}>
                    {location.formattedAddress}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LocationSelectMap;