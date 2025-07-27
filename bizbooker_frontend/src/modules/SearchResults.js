import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building, Tag, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './SearchResults.css';

const SearchResults = ({ query, onClose }) => {
  const [results, setResults] = useState({
    items: [],
    loading: false,
    hasMore: true,
    page: 0
  });
  const resultsRef = useRef(null);

  // Reset results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({
        items: [],
        loading: false,
        hasMore: true,
        page: 0
      });
      return;
    }

    const fetchResults = async () => {
      setResults(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}&page=0&size=5`
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        setResults({
          items: data,
          loading: false,
          hasMore: data.length > 0,
          page: 1
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults(prev => ({ ...prev, loading: false }));
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (resultsRef.current && 
          !results.loading && 
          results.hasMore &&
          resultsRef.current.scrollHeight - (resultsRef.current.scrollTop + resultsRef.current.clientHeight) < 100) {
        fetchMoreResults();
      }
    };

    const currentRef = resultsRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);

    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
    };
  }, [results.loading, results.hasMore, query]);

  const fetchMoreResults = async () => {
    setResults(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}&page=${results.page}&size=5`
      );
      
      const data = await response.json();
      
      setResults(prev => ({
        items: [...prev.items, ...data],
        loading: false,
        hasMore: data.length > 0,
        page: prev.page + 1
      }));
    } catch (error) {
      console.error('Search error:', error);
      setResults(prev => ({ ...prev, loading: false }));
    }
  };

  const getResultLink = (item) => {
    if (item.type === 'category') {
      return `/business/category/${item.id}`;
    }
    return `/business/customer/${item.id}`;
  };

  const getResultIcon = (item) => {
    switch (item.type) {
      case 'category':
        return <Tag size={16} className="category-icon" />;
      case 'business':
        return <Building size={16} className="business-icon" />;
      case 'location':
        return <MapPin size={16} className="location-icon" />;
      default:
        return <Building size={16} />;
    }
  };

  const getResultTypeLabel = (item) => {
    switch (item.type) {
      case 'category':
        return 'Category';
      case 'business':
        return 'Business';
      case 'location':
        return 'Location';
      default:
        return 'Business';
    }
  };

  return (
    <div className="search-results-container" ref={resultsRef}>
      {results.items.length === 0 && !results.loading && query.trim() && (
        <div className="search-no-results">
          <Search size={20} />
          <p>No results found for "{query}"</p>
        </div>
      )}

      {results.items.map((item, index) => (
        <Link 
          key={`${item.type}-${item.id}-${index}`} 
          to={getResultLink(item)}
          className={`search-result-item ${item.type}`}
          onClick={onClose}
        >
          <div className="search-result-icon">
            {getResultIcon(item)}
          </div>
          
          {item.imageData && item.type !== 'category' && (
            <img 
              src={`data:image/jpeg;base64,${item.imageData}`}
              alt={item.name || item.businessName}
              className="search-result-image"
            />
          )}

          <div className="search-result-content">
            <h4>{item.name || item.businessName}</h4>
            <p className={`search-result-type ${item.type}`}>
              {getResultTypeLabel(item)}
            </p>
            
            {(item.area || item.city) && (
              <p className="search-result-location">
                {item.area && <span>{item.area}, </span>}
                {item.city}
              </p>
            )}
          </div>
        </Link>
      ))}

      {results.loading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Loading more results...</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;