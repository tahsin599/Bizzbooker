import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, ChevronLeft, Save } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import LocationMap from './LocationMap'; // Import the LocationMap component
import './AddLocationPage.css';

const AddLocationPage = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        address: '',
        area: '',
        city: '',
        postalCode: '',
        contactPhone: '',
        contactEmail: '',
        isPrimary: false,
        lat: '',
        lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    // Predefined list of areas in Bangladesh
    const bangladeshAreas = [
        "Mirpur", "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mohammadpur",
        "Motijheel", "Farmgate", "Malibagh", "Rampura", "Badda", "Khilgaon",
        "Shyamoli", "Kallyanpur", "Mohakhali", "Tejgaon", "Paltan", "Lalmatia",
        "Baridhara", "Basundhara", "Niketan", "Shantinagar", "Moghbazar",
        "Elephant Road", "New Market", "Azimpur", "Jatrabari", "Demra",
        "Khilkhet", "Cantonment", "Kakrail", "Shahbagh", "Ramna"
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    business: { id: businessId }
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            navigate(`/business/${businessId}?tab=locations`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-location-container">
            <div className="add-location-content">
                <div className="add-location-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} /> Back
                    </button>
                    <h1>Add New Location</h1>
                </div>

                <form onSubmit={handleSubmit} className="location-form">
                    {error && <div className="error-message">{error}</div>}

                    {/* Map Section */}
                    <div className="form-group">
                        <label>
                            <MapPin size={16} /> Select Location on Map *
                        </label>
                        <div className="map-container">
                            <LocationMap onLocationSelect={handleLocationSelect} />
                        </div>
                        {!formData.address && (
                            <p className="map-hint">Click on the map to select your location</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">
                            <MapPin size={16} /> Address *
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="area">Area *</label>
                            <select
                                id="area"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select an area</option>
                                {bangladeshAreas.map((area, index) => (
                                    <option key={index} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City *</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="contactPhone">
                                <Phone size={16} /> Phone *
                            </label>
                            <input
                                type="tel"
                                id="contactPhone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactEmail">
                                <Mail size={16} /> Email
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="isPrimary"
                            name="isPrimary"
                            checked={formData.isPrimary}
                            onChange={handleChange}
                        />
                        <label htmlFor="isPrimary">Set as primary location</label>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={16} /> Save Location
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLocationPage;