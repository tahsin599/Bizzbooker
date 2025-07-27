import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './BusinessReviewsPage.css'; // New CSS file with unique class names
import { useLocation } from 'react-router-dom';

const BusinessReviewsPage = () => {
  const location = useLocation();
  const { businessId } = location.state || {};
  const [customerReviews, setCustomerReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);

  const fetchCustomerFeedback = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/reviews/business/${businessId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setCustomerReviews(response.data.content);
    } catch (error) {
      setApiError('Failed to fetch customer reviews');
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitBusinessResponse = async (reviewId) => {
    try {
      const authToken = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/reviews/${reviewId}/reply`,
        { reply: replyContent },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );

      setCustomerReviews(customerReviews.map(review => 
        review.id === reviewId 
          ? { ...review, businessReply: replyContent } 
          : review
      ));
      
      setActiveReplyId(null);
      setReplyContent('');
    } catch (error) {
      console.error('Reply submission failed:', error);
      setApiError('Failed to submit your response');
    }
  };

  useEffect(() => {
    fetchCustomerFeedback();
  }, []);

  if (isLoading) {
    return (
      <div className="reviews-loading-state">
        <div className="reviews-spinner-animation"></div>
        <p className="reviews-loading-text">Loading customer feedback...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="reviews-error-state">
        <p className="reviews-error-message">{apiError}</p>
        <button 
          className="reviews-retry-button"
          onClick={fetchCustomerFeedback}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="reviews-page-container">
      <div className="reviews-content-wrapper">
        <div className="reviews-header-section">
          <div className="reviews-title-card">
            <div className="reviews-title-content">
              <div className="reviews-title-text">
                <h1 className="reviews-main-heading">
                  Customer <span className="reviews-title-highlight">Feedback</span>
                </h1>
                <p className="reviews-subtitle">
                  View and respond to customer reviews
                </p>
              </div>
              <div className="reviews-stats-container">
                <div className="reviews-stat-card">
                  <span className="reviews-stat-number">{customerReviews.length}</span>
                  <span className="reviews-stat-label">Total Reviews</span>
                </div>
                <div className="reviews-stat-card">
                  <span className="reviews-stat-number">
                    {customerReviews.filter(r => r.businessReply).length}
                  </span>
                  <span className="reviews-stat-label">Replied</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reviews-list-container">
          {customerReviews.length === 0 ? (
            <div className="reviews-empty-state">
              No customer reviews available yet
            </div>
          ) : (
            customerReviews.map(review => (
              <div key={review.id} className="review-item-card">
                <div className="review-user-info">
                  <div className="review-user-avatar">
                    {review.imageData ? (
                      <img 
                        src={`data:${review.imageType};base64,${review.imageData}`} 
                        alt={review.customerName}
                        className="review-avatar-image"
                      />
                    ) : (
                      <div className="review-avatar-initials">
                        {review.customerName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="review-user-details">
                    <h3 className="review-user-name">{review.customerName}</h3>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`review-star ${i < review.rating ? 'review-star-filled' : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="review-content">
                  <p className="review-text">{review.comment}</p>
                  <div className="review-meta">
                    <span className="review-business">{review.businessName}</span>
                  </div>
                </div>

                {review.businessReply ? (
                  <div className="review-response">
                    <h4 className="response-title">Your Response</h4>
                    <p className="response-text">{review.businessReply}</p>
                  </div>
                ) : (
                  activeReplyId === review.id ? (
                    <div className="review-reply-form">
                      <textarea
                        className="reply-textarea"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your response..."
                        rows="3"
                      />
                      <div className="reply-actions">
                        <button 
                          className="reply-cancel-button"
                          onClick={() => setActiveReplyId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="reply-submit-button"
                          onClick={() => submitBusinessResponse(review.id)}
                        >
                          Submit Response
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="reply-prompt-button"
                      onClick={() => setActiveReplyId(review.id)}
                    >
                      Respond to Review
                    </button>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessReviewsPage;