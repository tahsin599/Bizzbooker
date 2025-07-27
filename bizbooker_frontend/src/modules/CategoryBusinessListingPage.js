import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, MapPin, ChevronRight, ArrowLeft, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './CategoryBusinessListingPage.css';

const CategoryBusinessListingPage = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const observer = useRef();
    const navigate = useNavigate();
    const { categoryId } = useParams();
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

    const fetchBusinesses = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const url = `${API_BASE_URL}/api/customer/businesses?page=${page}&size=6&categoryId=${categoryId}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (page === 0) {
                setBusinesses(data.content);
                // Set category name from first business (if available)
                if (data.content.length > 0) {
                    setCategoryName(data.content[0].categoryName);
                }
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
    }, [page, loading, hasMore, categoryId, token]);

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

    useEffect(() => {
        setPage(0);
        setHasMore(true);
        fetchBusinesses();
    }, [categoryId]);

    if (error) {
        return (
            <div className="error-container">
                <XCircle size={48} className="error-icon" />
                <h2>Error loading businesses</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    <CheckCircle size={16} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="category-listing-container">
            <div className="category-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back to Categories
                </button>
                <h1 className="category-title">
                    {categoryName || 'Businesses'} <span className="category-badge">{categoryName}</span>
                </h1>
            </div>

            <div className="businesses-grid">
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
                                <div className="business-rating">
                                    <Star size={14} fill="currentColor" />
                                    <span>{rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="business-info">
                                <h3>{business.businessName}</h3>
                                <p className="category">
                                    <Briefcase size={14} /> {business.categoryName}
                                </p>
                                {primaryLocation && (
                                    <div className="location">
                                        <MapPin size={14} />
                                        <span>{primaryLocation.area}, {primaryLocation.city}</span>
                                    </div>
                                )}
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

            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p><Clock size={16} /> Loading more businesses...</p>
                </div>
            )}

            {!loading && hasMore && (
                <button 
                    className="load-more-btn"
                    onClick={fetchBusinesses}
                >
                    <ChevronRight size={18} /> Load More Businesses
                </button>
            )}
        </div>
    );
};

export default CategoryBusinessListingPage;