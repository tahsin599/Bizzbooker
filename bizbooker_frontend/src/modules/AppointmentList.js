import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './AppointmentList.css';
import { API_BASE_URL } from '../config/api';
import ReviewModal from './ReviewModal';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const loaderRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchAppointments = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/appointments/user/${userId}`,
        {
          headers,
          params: { page, size: 10 }
        }
      );
      
      const newAppointments = response.data.content.filter(
        newApp => !appointments.some(
          existing => existing.appointmentId === newApp.appointmentId
        )
      );
      
      setAppointments(prev => [...prev, ...newAppointments]);
      setHasMore(!response.data.last);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, userId, appointments]);

  // Reset everything when userId changes
  useEffect(() => {
    setAppointments([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, [userId]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchAppointments();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchAppointments, hasMore, loading]);

  const handleReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (rating, comment) => {
    try {
      const reviewData = {
        appointmentId: selectedAppointment.appointmentId,
        rating,
        comment
      };
      console.log('Submitting review:', reviewData);

      await axios.post(`${API_BASE_URL}/api/reviews`, reviewData, { headers });
      
      // Update the appointment to mark it as reviewed
      setAppointments(prev => prev.map(app => 
        app.appointmentId === selectedAppointment.appointmentId 
          ? { ...app, reviewGiven: true } 
          : app
      ));
      
      setShowReviewModal(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  const handlePay = (appointmentId) => {
    console.log('Pay for appointment:', appointmentId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-badge-completed';
      case 'CONFIRMED':
        return 'status-badge-confirmed';
      case 'PENDING':
        return 'status-badge-pending';
      case 'CANCELLED':
        return 'status-badge-cancelled';
      default:
        return 'status-badge-default';
    }
  };

  return (
    <div className="appointment-list-container">
      <div className="appointment-list-header">
        <h2 className="appointment-list-title">Your Appointments</h2>
        <p className="appointment-list-description">
          View and manage your upcoming and past appointments
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            className="retry-button"
            onClick={() => fetchAppointments()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="appointment-cards-container">
        {appointments.length === 0 && !loading ? (
          <div className="no-appointments">
            You don't have any appointments yet.
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.appointmentId} className="appointment-card">
              <div className="appointment-card-header">
                <h3 className="appointment-business">
                  {appointment.businessName || 'Unknown Business'}
                </h3>
                <div className={`status-badge ${getStatusBadge(appointment.status)}`}>
                  {appointment.status}
                </div>
              </div>

              <div className="appointment-details">
                <div className="appointment-info">
                  <div className="appointment-location">
                    <span className="info-icon">📍</span>
                    {appointment.locationName || 'Location not specified'}
                  </div>
                  <div className="appointment-time">
                    <span className="info-icon">🕒</span>
                    {new Date(appointment.startTime).toLocaleString()} -{' '}
                    {new Date(appointment.endTime).toLocaleTimeString()}
                  </div>
                  {appointment.serviceName && (
                    <div className="appointment-service">
                      <span className="info-icon">🔧</span>
                      {appointment.serviceName}
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {appointment.status === 'COMPLETED' && !appointment.reviewGiven && (
                    <button
                      className="action-button review-button"
                      onClick={() => handleReviewClick(appointment)}
                    >
                      Leave Review
                    </button>
                  )}
                  {appointment.status === 'COMPLETED' && appointment.reviewGiven && (
                    <div className="review-given-badge">
                      Review Submitted
                    </div>
                  )}
                  {appointment.status === 'PENDING' && (
                    <button
                      className="action-button pay-button"
                      onClick={() => handlePay(appointment.appointmentId)}
                    >
                      Complete Payment
                    </button>
                  )}
                  {appointment.status === 'CONFIRMED' && (
                    <div className="active-indicator" title="Active Appointment"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        <div ref={loaderRef} className="loading-indicator">
          {loading && (
            <>
              <div className="loading-spinner"></div>
              <p>Loading more appointments...</p>
            </>
          )}
          {!hasMore && appointments.length > 0 && (
            <p className="no-more-appointments">
              You've reached the end of your appointments
            </p>
          )}
        </div>
      </div>

      {showReviewModal && selectedAppointment && (
        <ReviewModal
          
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default AppointmentList;