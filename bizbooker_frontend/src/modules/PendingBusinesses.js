import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PendingBusinesses.css';
import { API_BASE_URL } from '../config/api';

const PendingBusinesses = () => {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchPendingApprovals = useCallback(async (pageNum) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/business/pending?page=${pageNum}&size=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.content?.length > 0) {
        setApprovals(prev => 
          pageNum === 0 
            ? response.data.content 
            : [...prev, ...response.data.content]
        );
        setHasMore(response.data.content.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.status === 403 
        ? 'Access denied. Admin privileges required.' 
        : 'Failed to load pending approvals. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) navigate('/login');
    fetchPendingApprovals(page);
  }, [page, token, navigate, fetchPendingApprovals]);

  const lastApprovalRef = useCallback(node => {
    if (isLoading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/business/${id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError('Approval failed. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/business/${id}/reject`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError('Rejection failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return (
      <div className="error-state">
        <div className="error-message">
          <h2 className="error-title">Error</h2>
          <p>{error}</p>
          {error.includes('Access denied') && (
            <button onClick={handleLogout} className="admin-logout">
              Logout
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pending-approvals-page">
      <header className="approval-header">
        <h1 className="approval-title">Pending Business Approvals</h1>
        <button onClick={handleLogout} className="admin-logout">
          Logout
        </button>
      </header>

      <div className="approval-list">
        {approvals.length === 0 && !isLoading ? (
          <div className="empty-state">
            <p>No pending approvals found.</p>
          </div>
        ) : (
          approvals.map((approval, index) => (
            <div 
              key={approval.id} 
              className="approval-item"
              ref={index === approvals.length - 1 ? lastApprovalRef : null}
            >
              <div className="approval-image-container">
                {approval.imageData && (
                  <img 
                    className="approval-image"
                    src={`data:${approval.imageType};base64,${arrayBufferToBase64(approval.imageData)}`} 
                    alt={approval.businessName} 
                  />
                )}
              </div>
              <div className="approval-content">
                <h2 className="approval-name">{approval.businessName}</h2>
                <div className="approval-detail">
                  <span className="detail-label">Owner:</span>
                  <span>{approval.ownerName}</span>
                </div>
                <div className="approval-detail">
                  <span className="detail-label">Email:</span>
                  <span>{approval.email}</span>
                </div>
              </div>
              <div className="approval-actions">
                <button 
                  onClick={() => handleApprove(approval.id)} 
                  className="approve-action"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleReject(approval.id)} 
                  className="reject-action"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading more approvals...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function
function arrayBufferToBase64(buffer) {
  if (typeof buffer === 'string') return buffer;
  if (!buffer) return '';
  
  try {
    const bytes = buffer.byteLength ? new Uint8Array(buffer) : buffer;
    let binary = '';
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (e) {
    console.error('Image conversion error:', e);
    return '';
  }
}

export default PendingBusinesses;