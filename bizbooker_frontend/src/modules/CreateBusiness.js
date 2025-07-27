import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { ArrowRight, X, Image as ImageIcon, MapPin, Phone, Mail } from 'lucide-react';
import LocationMap from './LocationMap';
import './CreateBusiness.css';

const CreateBusiness = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Business info
    businessName: '',
    description: '',
    businessCategory: '',
    image: null,
    // Location info
    address: '',
    area: '',
    city: '',
    postalCode: '',
    lat: '',
    lng: '',
    contactPhone: '',
    contactEmail: '',
    isPrimary: true
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const businessCategories = [
    'Healthcare',
    'Beauty & Wellness',
    'Restaurant & Food',
    'Education',
    'Fitness',
    'Professional Services',
    'Automotive',
    'Home Services',
    'Event Planning',
    'Technology',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      address: location.street || location.fullAddress,
      area: location.area,
      city: location.city,
      postalCode: location.postalCode,
      lat: location.lat,
      lng: location.lng
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      
      if (!formData.businessCategory) {
        newErrors.businessCategory = 'Business category is required';
      }
      
      if (!formData.image) {
        newErrors.image = 'Business image is required';
      }
    } else if (currentStep === 2) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
      
      if (!formData.area.trim()) {
        newErrors.area = 'Area is required';
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'Contact phone is required';
      }
      
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Contact email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', localStorage.getItem('userId'));
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryName', formData.businessCategory);
      formDataToSend.append('image', formData.image);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('area', formData.area);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('postalCode', formData.postalCode);
      formDataToSend.append('lat', formData.lat);
      formDataToSend.append('lng', formData.lng);
      formDataToSend.append('contactPhone', formData.contactPhone);
      formDataToSend.append('contactEmail', formData.contactEmail);

      try {
        const response = await fetch(`${API_BASE_URL}/api/business/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataToSend
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (data.error === "Business name already exists") {
            setErrors(prev => ({...prev, businessName: data.error}));
          }
          throw new Error(data.error || 'Registration failed');
        }

        alert('Business registered successfully!');
        navigate('/userBusiness');
      } catch (error) {
        console.error('Error:', error);
        if (error.message !== "Business name already exists") {
          alert('Failed to register business: ' + error.message);
        }
      }
    }
  };

  return (
    <div className="create-business-container">
      <div className="create-business-content">
        <div className="create-business-header">
          <h1>Create Your <span className="gradient-text">Business Account</span></h1>
          <p>Start offering your services to customers on BizzBooker</p>
          
          <div className="form-steps">
            <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Business Info</p>
            </div>
            <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Location Info</p>
            </div>
          </div>
        </div>
        
        <div className="create-business-form-container">
          <form onSubmit={currentStep === 2 ? handleSubmit : nextStep} className="create-business-form">
            {currentStep === 1 && (
              <>
                <div className="form-group">
                  <label htmlFor="businessName" className="form-label">
                    Business Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.businessName ? 'error' : ''}`}
                    placeholder="Enter your business name"
                  />
                  {errors.businessName && <span className="error-message">{errors.businessName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Business Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Describe your business and services..."
                    rows="4"
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="businessCategory" className="form-label">
                    Business Category <span className="required">*</span>
                  </label>
                  <select
                    id="businessCategory"
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className={`form-select ${errors.businessCategory ? 'error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {businessCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.businessCategory && <span className="error-message">{errors.businessCategory}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="image" className="form-label">
                    Business Logo/Image <span className="required">*</span>
                  </label>
                  <div className="file-input-container">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleImageChange}
                      className={`form-file-input ${errors.image ? 'error' : ''}`}
                      accept="image/*"
                    />
                    <label htmlFor="image" className="file-input-label">
                      <div className="file-input-icon">
                        <ImageIcon size={20} />
                      </div>
                      <span>{formData.image ? formData.image.name : 'Choose business image'}</span>
                      {formData.image && (
                        <button 
                          type="button" 
                          className="clear-file-btn"
                          onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </label>
                  </div>
                  {errors.image && <span className="error-message">{errors.image}</span>}
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    Next: Location Info <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="form-section-header">
                  <MapPin size={20} />
                  <h3>Business Location</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Click on the map to select your business location <span className="required">*</span>
                  </label>
                  <LocationMap onLocationSelect={handleLocationSelect} />
                </div>

                <div className="location-details">
                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      Address <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-input ${errors.address ? 'error' : ''}`}
                      placeholder="Street address"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="area" className="form-label">
                      Area/Neighborhood <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className={`form-input ${errors.area ? 'error' : ''}`}
                      placeholder="Area or neighborhood"
                    />
                    {errors.area && <span className="error-message">{errors.area}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      placeholder="City"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode" className="form-label">
                      Postal/Zip Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Postal or zip code"
                    />
                  </div>
                </div>

                <div className="form-section-header">
                  <Phone size={20} />
                  <h3>Contact Information</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.contactPhone ? 'error' : ''}`}
                    placeholder="Business phone number"
                  />
                  {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail" className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className={`form-input ${errors.contactEmail ? 'error' : ''}`}
                    placeholder="Business email"
                  />
                  {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={prevStep}>
                    Back
                  </button>
                  <button type="submit" className="submit-btn">
                    Create Business Account
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBusiness;