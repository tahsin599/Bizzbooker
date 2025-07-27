// utils/geocoding.js
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    if (data.length === 0) return null;
    
    // Return first result (most relevant)
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      address: data[0].display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};