import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './BusinessReviewsTab.css';

const BusinessReviewsTab = ({ businessId }) => {
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/reviews/${businessId}`, {
        params: { page, size: 5 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviewsData(prev => {
        // On first page, replace all reviews
        if (page === 0) {
          return response.data.content || [];
        }
        // On subsequent pages, append new reviews
        return [...prev, ...(response.data.content || [])];
      });
      
      setHasMore(!response.data.last);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, businessId]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && page === 0) {
    return (
      <div className="biz-reviews-loading">
        <div className="biz-reviews-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="biz-reviews-error">
        <p>Error loading reviews: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="biz-reviews-container">
      <div className="biz-reviews-header">
        <h3 className="biz-reviews-title">
          <MessageSquare size={20} /> Customer Feedback
        </h3>
        <div className="biz-reviews-stats">
          <div className="biz-reviews-stat">
            <span className="biz-reviews-stat-value">
              {reviewsData.length}
            </span>
            <span className="biz-reviews-stat-label">Total Reviews</span>
          </div>
          <div className="biz-reviews-stat">
            <span className="biz-reviews-stat-value">
              {reviewsData.filter(r => r.businessReply).length}
            </span>
            <span className="biz-reviews-stat-label">Replied</span>
          </div>
        </div>
      </div>

      {reviewsData.length === 0 ? (
        <div className="biz-reviews-empty">
          <p>No reviews yet for this business</p>
        </div>
      ) : (
        <div className="biz-reviews-list">
          {reviewsData.map(review => (
            <div key={review.id} className="biz-review-card">
              <div className="biz-review-header">
                <div className="biz-reviewer-info">
                  {review.imageData ? (
                    <img 
                      src={`data:${review.imageType};base64,${review.imageData}`}
                      alt={review.customerName}
                      className="biz-reviewer-avatar"
                    />
                  ) : (
                    <div className="biz-reviewer-avatar-initial">
                      {review.customerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="biz-reviewer-name">{review.customerName}</h4>
                    <div className="biz-review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16}
                          fill={i < review.rating ? '#f59e0b' : '#e5e7eb'}
                          color={i < review.rating ? '#f59e0b' : '#e5e7eb'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="biz-review-meta">
                  <span className="biz-review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {review.serviceName && (
                    <span className="biz-review-service">
                      {review.serviceName}
                    </span>
                  )}
                </div>
              </div>

              <div className="biz-review-content">
                <p className="biz-review-text">{review.comment}</p>
                
                {review.businessReply && (
                  <div className="biz-review-response">
                    <div className="biz-response-header">
                      <span className="biz-response-label">Business Response</span>
                      <span className="biz-response-date">
                        {new Date(review.replyDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="biz-response-text">{review.businessReply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {hasMore && (
            <button 
              className="biz-load-more"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessReviewsTab;