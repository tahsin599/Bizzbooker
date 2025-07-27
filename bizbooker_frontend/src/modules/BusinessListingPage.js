import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Filter, ChevronRight, Star } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './BusinessListingPage.css';

const BusinessListingPage = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [filters, setFilters] = useState({
        category: null,
        area: null
    });
    const observer = useRef();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

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
        const fetchRandomBusinesses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/customer/businesses/random?count=6`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setBusinesses(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchRandomBusinesses();
    }, [token]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const categoriesResponse = await fetch(`${API_BASE_URL}/api/customer/businesses/categories`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                const areasSet = new Set();
                businesses.forEach(business => {
                    business.locations?.forEach(location => {
                        if (location.area) {
                            areasSet.add(location.area);
                        }
                    });
                });
                setAreas(Array.from(areasSet));
            } catch (err) {
                console.error('Error fetching filters:', err);
            }
        };

        fetchFilters();
    }, [token, businesses]);

    const fetchBusinesses = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/customer/businesses?page=${page}&size=6`;
            if (filters.category) url += `&categoryId=${filters.category}`;
            if (filters.area) url += `&area=${filters.area}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (page === 0) {
                setBusinesses(data.content);
            } else {
                setBusinesses(prev => [...prev, ...data.content]);
            }
            
            setHasMore(!data.last);
            setPage(prev => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, filters, loading, hasMore, token]);

    const lastBusinessRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchBusinesses();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchBusinesses]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setPage(0);
        setHasMore(true);
    };

    if (error) {
        return (
            <div className="business-listing-error">
                <h2>Error loading businesses</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="business-listing-page">
            {/* Top spacing for navbar */}
            <div className="business-listing-spacer"></div>

            {/* Hero Section */}
            <div className="business-listing-hero">
                <div className="business-listing-hero-content">
                    <h1>Discover Local Businesses</h1>
                    <p>Find and book services from trusted providers in your area</p>
                </div>
            </div>

            <div className="business-listing-main">
                {/* Filter Section */}
                <div className="business-filters">
                    <div className="business-filter-group">
                        <Filter size={18} />
                        <select 
                            value={filters.category || ''}
                            onChange={(e) => handleFilterChange('category', e.target.value || null)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="business-filter-group">
                        <MapPin size={18} />
                        <select 
                            value={filters.area || ''}
                            onChange={(e) => handleFilterChange('area', e.target.value || null)}
                        >
                            <option value="">All Areas</option>
                            {areas.map((area, index) => (
                                <option key={index} value={area}>
                                    {area}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Business Grid */}
                <div className="business-grid">
                    {businesses.map((business, index) => {
                        const imageUrl = getImageUrl(business.imageData, business.imageType);
                        const primaryLocation = business.locations?.find(loc => loc.isPrimary) || 
                                             business.locations?.[0];
                        const rating = business.averageRating || 0;
                        
                        return (
                            <div 
                                key={`${business.id}-${index}`}
                                className="business-card"
                                ref={index === businesses.length - 1 ? lastBusinessRef : null}
                                onClick={() => navigate(`/business/customer/${business.id}`)}
                            >
                                <div className="business-card-image">
                                    {imageUrl ? (
                                        <img 
                                            src={imageUrl}
                                            alt={business.businessName}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.parentElement.innerHTML = `
                                                    <div class="business-card-image-placeholder">
                                                        <Briefcase size={40} />
                                                    </div>
                                                `;
                                            }}
                                        />
                                    ) : (
                                        <div className="business-card-image-placeholder">
                                            <Briefcase size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="business-card-content">
                                    <h3>{business.businessName}</h3>
                                    <p className="business-card-category">{business.categoryName}</p>
                                    
                                    <div className="business-card-rating">
                                        <Star size={14} fill="#FFD700" color="#FFD700" />
                                        <span>{rating.toFixed(1)}</span>
                                    </div>
                                    
                                    {primaryLocation && (
                                        <div className="business-card-location">
                                            <MapPin size={14} />
                                            <span>{primaryLocation.area}, {primaryLocation.city}</span>
                                        </div>
                                    )}
                                    
                                    <div className="business-card-status">
                                        <span className={`business-status-badge ${business.approvalStatus?.toLowerCase()}`}>
                                            {business.approvalStatus || 'PENDING'}
                                        </span>
                                    </div>
                                    
                                    <button 
                                        className="business-card-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/business/customer/${business.id}`);
                                        }}
                                    >
                                        View Details <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="business-listing-loading">
                        <div className="business-loading-spinner"></div>
                        <p>Loading more businesses...</p>
                    </div>
                )}

                {/* No Results Message */}
                {!loading && businesses.length === 0 && (
                    <div className="business-no-results">
                        <h3>No businesses found</h3>
                        <p>Try adjusting your filters</p>
                    </div>
                )}

                {/* Load More Button */}
                {!loading && hasMore && businesses.length > 0 && (
                    <button 
                        className="business-load-more"
                        onClick={fetchBusinesses}
                    >
                        Load More Businesses
                    </button>
                )}
            </div>
        </div>
    );
};

export default BusinessListingPage;