import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './NoBusinessesFound.css';

const NoBusinessesFound = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch all categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/customer/businesses/categories`,{headers:{
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }});
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (id) => {
    navigate(`/business/category/${id}`);
  };

  const handleBackToAll = () => {
    navigate('/business');
  };

  const currentCategory = categories.find(cat => cat.id === parseInt(categoryId));

  return (
    <div className="no-businesses-container">
      <div className="no-businesses-content">
        <div className="illustration-container">
          <div className="empty-state-illustration">
            <Briefcase size={80} className="briefcase-icon" />
            <div className="magnifying-glass"></div>
          </div>
        </div>

        <h1 className="title">
          {currentCategory 
            ? `No ${currentCategory.name} Businesses Found`
            : "No Businesses Found"}
        </h1>
        
        <p className="subtitle">
          We couldn't find any businesses matching your criteria. Try searching for something else or browse our popular categories.
        </p>

        <div className="action-buttons">
          <button 
            className="primary-btn"
            onClick={handleBackToAll}
          >
            <ArrowLeft size={18} /> Back to All Businesses
          </button>
          <button 
            className="secondary-btn"
            onClick={() => navigate('/business/customer')}
          >
            <Search size={18} /> Try Different Search
          </button>
        </div>

        {!loading && categories.length > 0 && (
          <div className="category-suggestions">
            <h3>Popular Categories You Might Like</h3>
            <div className="categories-grid">
              {categories.filter(cat => cat.id !== parseInt(categoryId)).slice(0, 6).map(category => (
                <div 
                  key={category.id} 
                  className="category-card"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="category-icon">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="category-name">{category.name}</span>
                  <ChevronRight size={16} className="chevron-icon" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get icons for categories
const getCategoryIcon = (categoryName) => {
  const icons = {
    'Professional Services': <Briefcase size={24} />,
    'Fitness': <div className="dumbbell-icon"></div>,
    'HealthCare': <div className="medical-icon">+</div>,
    'Restaurant': <div className="utensils-icon"></div>,
    'Education': <div className="graduation-cap-icon"></div>
  };

  for (const [key, icon] of Object.entries(icons)) {
    if (categoryName.includes(key)) {
      return icon;
    }
  }
  
  return <Briefcase size={24} />;
};

export default NoBusinessesFound;