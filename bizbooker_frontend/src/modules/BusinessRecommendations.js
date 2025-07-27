import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  Briefcase, Star, Clock, MapPin, ChevronDown, ChevronUp, 
  ArrowRight, Calendar, Users, Heart, Zap
} from 'lucide-react';
import './BusinessRecommendations.css';

const BusinessRecommendations = () => {
  const [frequentBusinesses, setFrequentBusinesses] = useState([]);
  const [popularBusinesses, setPopularBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllFrequent, setShowAllFrequent] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Fetch frequent businesses
        const frequentRes = await fetch(
          `${API_BASE_URL}/api/business/user/${userId}/frequent-businesses?page=0&size=5`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const frequentData = await frequentRes.json();
        setFrequentBusinesses(frequentData.content);

        // Fetch popular businesses
        const popularRes = await fetch(
          `${API_BASE_URL}/api/business/top-by-appointments?page=0&size=5`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const popularData = await popularRes.json();
        setPopularBusinesses(popularData.content);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleShowAllFrequent = () => setShowAllFrequent(!showAllFrequent);
  const toggleShowAllPopular = () => setShowAllPopular(!showAllPopular);

  const displayFrequent = showAllFrequent ? frequentBusinesses : frequentBusinesses.slice(0, 3);
  const displayPopular = showAllPopular ? popularBusinesses : popularBusinesses.slice(0, 3);

  if (loading) {
    return (
      <div className="recommendations-loading-screen">
        <div className="recommendations-spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="recommendations-page-container">
      <div className="recommendations-content-wrapper">
        <header className="recommendations-header-section">
          <h1 className="recommendations-main-title">Business Recommendations</h1>
          <p className="recommendations-subtitle">Discover businesses tailored for you</p>
        </header>

        <div className="recommendations-sections-container">
          {/* Your Frequent Businesses Section */}
          <section className="recommendations-section frequent-section">
            <div className="section-header-wrapper">
              <div className="section-title-group">
                <Clock className="section-title-icon" />
                <h2 className="section-heading">Your Frequent Visits</h2>
              </div>
              {frequentBusinesses.length > 3 && (
                <button 
                  className="section-toggle-button"
                  onClick={toggleShowAllFrequent}
                >
                  {showAllFrequent ? 'Show Less' : 'Show All'}
                  {showAllFrequent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>

            {frequentBusinesses.length === 0 ? (
              <div className="empty-state-container">
                <p className="empty-state-message">You haven't visited any businesses yet</p>
                <button 
                  className="explore-action-button"
                  onClick={() => navigate('/business/customer')}
                >
                  Explore Businesses <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="business-cards-grid">
                {displayFrequent.map((business) => (
                  <BusinessCard 
                    key={`frequent-${business.id}`} 
                    business={business} 
                    badgeType="frequent"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Popular Businesses Section */}
          <section className="recommendations-section popular-section">
            <div className="section-header-wrapper">
              <div className="section-title-group">
                <Zap className="section-title-icon" />
                <h2 className="section-heading">Popular Businesses</h2>
              </div>
              {popularBusinesses.length > 3 && (
                <button 
                  className="section-toggle-button"
                  onClick={toggleShowAllPopular}
                >
                  {showAllPopular ? 'Show Less' : 'Show All'}
                  {showAllPopular ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>

            <div className="business-cards-grid">
              {displayPopular.map((business) => (
                <BusinessCard 
                  key={`popular-${business.id}`} 
                  business={business} 
                  badgeType="popular"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const BusinessCard = ({ business, badgeType }) => {
  const navigate = useNavigate();

  return (
    <div className="business-card-wrapper" onClick={() => navigate(`/business/customer/${business.id}`)}>
      <div className="business-image-wrapper">
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.businessName} 
            className="business-main-image"
          />
        ) : (
          <div className="business-image-placeholder">
            <Briefcase size={32} />
          </div>
        )}
        <div className={`business-badge ${badgeType}`}>
          {badgeType === 'frequent' ? (
            <>
              <Users size={14} /> Frequent
            </>
          ) : (
            <>
              <Star size={14} fill="#FFD700" /> Popular
            </>
          )}
        </div>
      </div>
      
      <div className="business-info-content">
        <h3 className="business-name-title">{business.businessName}</h3>
        <p className="business-category-text">
          <Briefcase size={14} /> {business.category}
        </p>
        
        <div className="business-stats-wrapper">
          <div className="business-stat-item">
            <Calendar size={14} />
            <span>{business.appointmentCount} visits</span>
          </div>
          <div className="business-stat-item">
            <MapPin size={14} />
            <span>{business.locationAddress || 'Multiple locations'}</span>
          </div>
        </div>
        
        <button 
          className="view-details-action-button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/business/${business.id}`);
          }}
        >
          View Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default BusinessRecommendations;