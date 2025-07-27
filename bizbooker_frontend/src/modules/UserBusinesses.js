import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, ArrowRight, Clock, MapPin, Phone, Check, X, Star } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './UserBusinesses.css';
import Navbar from './Navbar';
import BusinessReviewsPage from './BusinessReviewsPage';

const UserBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Helper function to convert image data to displayable format
  const getImageUrl = (imageData, imageType) => {
    if (!imageData) return null;
    
    try {
      const base64String = typeof imageData === 'string' 
        ? imageData 
        : arrayBufferToBase64(imageData);
      
      return `data:${imageType || 'image/jpeg'};base64,${base64String}`;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  useEffect(() => {
    const fetchUserBusinesses = async () => {
      try {
        if (!userId || !token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/business?ownerId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch businesses: ${response.status}`);
        }
        
        const data = await response.json();
        setBusinesses(data);
        
        if (data.length === 0) {
          navigate('/create-business');
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBusinesses();
  }, [userId, token, navigate]);

  const handleViewReviews = (businessId) => {
    navigate('/business/reviews', { state: { businessId } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading businesses</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        {/* Blue Gradient Header with Stats */}
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1>Your Business Portfolio <span className="wave">🏢</span></h1>
                <p>Manage all your business locations and services</p>
              </div>
              <div className="welcome-stats">
                <div className="stat-item">
                  <div className="stat-number">{businesses.length}</div>
                  <div className="stat-label">Total Businesses</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {businesses.filter(b => b.isApproved).length}
                  </div>
                  <div className="stat-label">Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="quick-actions-section">
          <div className="section-header">
            <h3>Business Management</h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/create-business')}
            >
              <PlusCircle size={18} /> New Business
            </button>
          </div>
          <div className="quick-actions">
            <div className="quick-action-card" onClick={() => navigate('/create-business')}>
              <div className="action-icon" style={{backgroundColor: '#8b5cf6'}}>
                <PlusCircle size={24} />
              </div>
              <span>Add New Business</span>
            </div>
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#10b981'}}>
                <Briefcase size={24} />
              </div>
              <span>View Services</span>
            </div>
            <div className="quick-action-card" onClick={() => navigate(`/business-hours/${businesses[0]?.id}`)}>
              <div className="action-icon" style={{backgroundColor: '#3b82f6'}}>
                <Clock size={24} />
              </div>
              <span>Business Hours</span>
            </div>
          </div>
        </div>

        {/* Businesses Grid */}
        <div className="businesses-section">
          <div className="section-header">
            <h3>Your Businesses</h3>
            <div className="view-all-btn">
              {businesses.length} Total <ArrowRight size={16} />
            </div>
          </div>
          
          <div className="businesses-grid">
            {businesses.map(business => {
              const imageUrl = getImageUrl(business.imageData, business.imageType);
              const primaryLocation = business.locations?.find(loc => loc.isPrimary) || 
                                     business.locations?.[0];
              
              return (
                <div key={business.id} className="business-card">
                  <div className="business-header">
                    <div className="business-image">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={business.businessName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `
                              <div class="image-placeholder">
                                <Briefcase size={40} />
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <Briefcase size={40} />
                        </div>
                      )}
                    </div>
                    <div className="business-title">
                      <h4>{business.businessName}</h4>
                      <div className={`status-badge ${business.approvalStatus?.toLowerCase() || 'pending'}`}>
                        {business.isApproved ? (
                          <Check size={14} />
                        ) : business.approvalStatus === 'REJECTED' ? (
                          <X size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {business.approvalStatus || 'PENDING'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="business-details">
                    <p className="business-description">{business.description}</p>
                    
                    <div className="business-category">
                      <span>Category:</span> {business.categoryName || 'Not specified'}
                    </div>
                    
                    {primaryLocation && (
                      <div className="business-location">
                        <div className="location-detail">
                          <MapPin size={16} />
                          <span>{primaryLocation.address}, {primaryLocation.city}</span>
                        </div>
                        <div className="location-detail">
                          <Phone size={16} />
                          <span>{primaryLocation.contactPhone}</span>
                        </div>
                        <div className="location-detail">
                          <span>Email: {primaryLocation.contactEmail}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="business-footer">
                    <div className="created-at">
                      Created: {new Date(business.createdAt).toLocaleDateString()}
                    </div>
                    <div className="business-actions">
                      <button 
                        className="reviews-btn"
                        onClick={() => handleViewReviews(business.id)}
                      >
                        <Star size={16} /> View Reviews
                      </button>
                      <button 
                        className="manage-btn"
                        onClick={() => navigate(`/business/${business.id}`)}
                      >
                        Manage <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBusinesses;