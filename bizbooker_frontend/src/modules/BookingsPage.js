import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  Calendar, Clock, ChevronRight, ChevronDown, ChevronUp,
  Check, X, Loader, ArrowLeft, Search, Filter
} from 'lucide-react';
import './BookingsPage.css';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Status options for filtering
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  // Fetch bookings with pagination
  const fetchBookings = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/user/${userId}/bookings?page=${reset ? 0 : page}&size=10&sort=startTime,desc${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      
      if (reset) {
        setBookings(data.content);
      } else {
        setBookings(prev => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchBookings(true);
  }, [statusFilter, searchTerm]);

  // Load more bookings
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchBookings();
    }
  }, [page]);

  // Toggle booking details
  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'confirmed';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      case 'COMPLETED':
        return 'completed';
      default:
        return '';
    }
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>My Bookings</h1>
      </div>

      {/* Filters and Search */}
      <div className="bookings-controls">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <Filter size={18} className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {loading && bookings.length === 0 ? (
          <div className="loading-container">
            <Loader size={24} className="spinner" />
            <p>Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error loading bookings: {error}</p>
            <button onClick={() => fetchBookings(true)}>Retry</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found</p>
            <button 
              className="explore-button"
              onClick={() => navigate('/business')}
            >
              Explore Businesses
            </button>
          </div>
        ) : (
          <>
            {bookings.map(booking => (
              <div 
                key={booking.id} 
                className={`booking-card ${expandedBooking === booking.id ? 'expanded' : ''}`}
              >
                <div 
                  className="booking-summary"
                  onClick={() => toggleBookingDetails(booking.id)}
                >
                  <div className="booking-info">
                    <div className="booking-business">
                      <h3>{booking.businessName}</h3>
                      {booking.serviceName && (
                        <p className="booking-service">{booking.serviceName}</p>
                      )}
                    </div>
                    <div className="booking-time">
                      <div className="booking-date">
                        <Calendar size={16} />
                        <span>{formatDate(booking.startTime)}</span>
                      </div>
                      <div className="booking-time-slot">
                        <Clock size={16} />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="booking-status">
                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                    {expandedBooking === booking.id ? (
                      <ChevronUp size={20} className="expand-icon" />
                    ) : (
                      <ChevronDown size={20} className="expand-icon" />
                    )}
                  </div>
                </div>

                {expandedBooking === booking.id && (
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{booking.locationAddress}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Booking ID:</span>
                      <span className="detail-value">{booking.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'PENDING' && (
                        <>
                          <button className="action-button confirm">
                            <Check size={16} /> Confirm
                          </button>
                          <button className="action-button cancel">
                            <X size={16} /> Cancel
                          </button>
                        </>
                      )}
                      <button 
                        className="action-button view"
                        onClick={() => navigate(`/business/${booking.businessId}`)}
                      >
                        View Business
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="load-more-button"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="spinner" /> Loading...
                    </>
                  ) : (
                    'Load More Bookings'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;