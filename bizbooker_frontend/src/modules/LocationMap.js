import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetchLocationDetails(e.latlng, onLocationSelect);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

async function fetchLocationDetails(latlng, callback) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
    );
    const data = await response.json();
    
    const address = {
      fullAddress: data.display_name || '',
      street: data.address?.road || '',
      area: data.address?.suburb || data.address?.neighbourhood || '',
      city: data.address?.city || data.address?.town || data.address?.county || '',
      postalCode: data.address?.postcode || '',
      lat: latlng.lat,
      lng: latlng.lng
    };
    
    callback(address);
  } catch (error) {
    console.error("Error fetching location details:", error);
  }
}

const LocationMap = ({ onLocationSelect }) => {
  const [position, setPosition] = React.useState(null);

  return (
    <div style={{ height: '300px', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={[23.8103, 90.4125]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker 
          position={position} 
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
};

export default LocationMap;