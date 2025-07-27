import React, { useState } from 'react';
import Map from './Map';

const BusinessForm = () => {
  const [formData, setFormData] = useState({
    address: '',
    area: '',
    city: '',
    postalCode: ''
  });

  const handleLocationSelect = (location) => {
    setFormData({
      address: location.street || location.fullAddress,
      area: location.area,
      city: location.city,
      postalCode: location.postalCode
    });
  };

  return (
    <div>
      <Map onLocationSelect={handleLocationSelect} />
      
      <div className="form-group">
        <label>Address</label>
        <input 
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Area</label>
        <input 
          value={formData.area}
          onChange={(e) => setFormData({...formData, area: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>City</label>
        <input 
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Postal Code</label>
        <input 
          value={formData.postalCode}
          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
        />
      </div>
    </div>
    
  );
};

export default BusinessForm;  