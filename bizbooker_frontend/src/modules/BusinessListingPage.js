import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Filter, ChevronRight } from 'lucide-react';
import './BusinessListingPage.css';
import { API_BASE_URL } from '../config/api';   

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

    // Enhanced image handling function
    const getImageUrl = (imageData, imageType) => {
        if (!imageData) return null;
        
        try {
            // Handle both string (base64) and ArrayBuffer formats
            const base64String = typeof imageData === 'string' 
                ? imageData 
                : arrayBufferToBase64(imageData);
            
            return `data:${imageType || 'image/jpeg'};base64,${base64String}`;
        } catch (error) {
            console.error('Error processing image:', error);
            return null;
        }
    };

    // Convert ArrayBuffer to base64 string
    const arrayBufferToBase64 = (buffer) => {
        if (!buffer) return '';
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    // Fetch initial random businesses
    useEffect(() => {
        const fetchRandomBusinesses = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/customer/businesses/random?count=6`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                console.log(data);
                setBusinesses(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchRandomBusinesses();
    }, [token]);

    // Fetch categories and areas
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                // Fetch categories
              
                const categoriesResponse = await fetch(`${API_BASE_URL}/api/customer/businesses/categories`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Extract unique areas from businesses
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
    }, [token,businesses]);

    // Fetch more businesses when scrolling or filters change
    const fetchBusinesses = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            let url = `http://localhost:8080/api/customer/businesses?page=${page}&size=6`;
            if (filters.category) url += `&categoryId=${filters.category}`;
            if (filters.area) url += `&area=${filters.area}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('Fetched businesses:', data);
            
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

    // Infinite scroll observer
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

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setPage(0);
        setHasMore(true);
    };

    // Load more when filters change
    useEffect(() => {
        fetchBusinesses();
    }, [filters]);

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
        <div className="business-listing-container">
            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-group">
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
                
                <div className="filter-group">
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
            <div className="businesses-grid">
                {businesses.map((business, index) => {
                    const imageUrl = getImageUrl(business.imageData, business.imageType);
                    const primaryLocation = business.locations?.find(loc => loc.isPrimary) || 
                                         business.locations?.[0];
                    
                    return (
                        <div 
                            key={`${business.id}-${index}`}
                            className="business-card"
                            ref={index === businesses.length - 1 ? lastBusinessRef : null}
                        >
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
                            <div className="business-info">
                                <h3>{business.businessName}</h3>
                                <p className="category">{business.categoryName}</p>
                                {primaryLocation && (
                                    <div className="location">
                                        <MapPin size={14} />
                                        <span>{primaryLocation.area}, {primaryLocation.city}</span>
                                    </div>
                                )}
                                <div className="business-status">
                                    <span className={`status-badge ${business.approvalStatus?.toLowerCase()}`}>
                                        {business.approvalStatus}
                                    </span>
                                </div>
                                <button 
                                    className="view-button"
                                    onClick={() => navigate(`/business/customer/${business.id}`)}
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
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading more businesses...</p>
                </div>
            )}

            {/* Load More Button (alternative to infinite scroll) */}
            {!loading && hasMore && (
                <button 
                    className="load-more-btn"
                    onClick={fetchBusinesses}
                >
                    Load More Businesses
                </button>
            )}
        </div>
    );
};

export default BusinessListingPage;