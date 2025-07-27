import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  Calendar, Clock, ChevronRight, ChevronDown, ChevronUp,
  Check, X, Loader, ArrowLeft, DollarSign,
  MapPin, CheckCircle
} from 'lucide-react';
import './BookingsPage.css';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Fetch bookings with pagination
  const fetchBookings = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/user/${userId}/bookings?page=${reset ? 0 : page}&size=10&sort=startTime,desc`,
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

  // Calculate stats from bookings
  useEffect(() => {
    const newStats = bookings.reduce((acc, booking) => {
      acc.total++;
      acc[booking.status.toLowerCase()]++;
      return acc;
    }, { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    
    setStats(newStats);
  }, [bookings]);

  // Initial load
  useEffect(() => {
    fetchBookings(true);
  }, [userId, token]);

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

  // Confirm appointment - trigger payment process
  const confirmAppointment = async (booking) => {
    try {
      setLoading(true);
      
      // Create checkout session for payment
      const response = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price: booking.slotPrice || 0,
          quantity: 1,
          businessId: booking.businessId,
          appointmentId: booking.appointmentId || booking.id,
          successUrl: `${window.location.origin}/booking-payment-success`,
          cancelUrl: `${window.location.origin}/bookings`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const stripeData = await response.json();
      
      if (stripeData.alreadyPaid === "true") {
        alert('Payment already completed! Appointment has been confirmed.');
        fetchBookings(true);
        return;
      }
      
      if (stripeData.url && stripeData.sessionId) {
        localStorage.setItem('confirmingAppointmentId', booking.appointmentId || booking.id);
        localStorage.setItem('stripeSessionId', stripeData.sessionId);
        sessionStorage.setItem('confirmingAppointmentId', booking.appointmentId || booking.id);
        sessionStorage.setItem('stripeSessionId', stripeData.sessionId);
        
        localStorage.setItem('pendingAppointmentData', JSON.stringify({
          slotPrice: booking.slotPrice,
          businessId: booking.businessId,
          appointmentId: booking.appointmentId || booking.id
        }));
        
        window.location.href = stripeData.url;
      } else {
        throw new Error('Invalid payment session response');
      }
    } catch (error) {
      alert('Failed to start payment process: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/${booking.appointmentId || booking.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      alert('Appointment cancelled successfully!');
      fetchBookings(true);
    } catch (error) {
      alert('Failed to cancel appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookings-container">
      <div className="bookings-content">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>View and manage your upcoming appointments</p>
        </div>

        {/* Stats Overview */}
        <div className="bookings-stats">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Confirmed</h3>
            <p className="stat-value">{stats.confirmed}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>
          <div className="stat-card">
            <h3>Cancelled</h3>
            <p className="stat-value">{stats.cancelled}</p>
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
                        <span className="detail-label">
                          <MapPin size={16} /> Location:
                        </span>
                        <span className="detail-value">{booking.locationAddress || booking.locationName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">#{booking.appointmentId || booking.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.slotPrice && (
                        <div className="detail-row">
                          <span className="detail-label">
                            <DollarSign size={16} /> Price:
                          </span>
                          <span className="detail-value detail-price">
                            ${booking.slotPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="booking-actions">
                        {booking.status === 'PENDING' && (
                          <>
                            <button 
                              className="action-button confirm" 
                              onClick={() => confirmAppointment(booking)}
                              disabled={loading}
                            >
                              <CheckCircle size={16} /> {loading ? 'Processing...' : 'Confirm & Pay'}
                            </button>
                            <button 
                              className="action-button cancel" 
                              onClick={() => cancelAppointment(booking)}
                              disabled={loading}
                            >
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
    </div>
  );
};

export default BookingsPage;