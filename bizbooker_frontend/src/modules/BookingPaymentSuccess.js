import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const BookingPaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Get parameters from URL
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get('session_id');
  const appointmentId = localStorage.getItem('confirmingAppointmentId') || 
                       sessionStorage.getItem('confirmingAppointmentId');

  useEffect(() => {
    // Prevent duplicate execution
    if (processing) return;
    const completePayment = async () => {
      if (!appointmentId || !sessionId) {
        setError('Missing payment or appointment information');
        setLoading(false);
        return;
      }

      // Set processing flag to prevent duplicate execution
      setProcessing(true);

      try {
        const token = localStorage.getItem('token');
        
        console.log('BookingPaymentSuccess: Starting payment completion');
        console.log('BookingPaymentSuccess: appointmentId:', appointmentId);
        console.log('BookingPaymentSuccess: sessionId:', sessionId);
        console.log('BookingPaymentSuccess: API_BASE_URL:', API_BASE_URL);
        console.log('BookingPaymentSuccess: token exists:', !!token);
        
        // Update appointment status to APPROVED
        const statusUrl = `${API_BASE_URL}/api/appointments/${appointmentId}/status?status=APPROVED`;
        console.log('BookingPaymentSuccess: Making request to:', statusUrl);
        
        const statusResponse = await fetch(statusUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('BookingPaymentSuccess: Status response status:', statusResponse.status);
        console.log('BookingPaymentSuccess: Status response ok:', statusResponse.ok);

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('BookingPaymentSuccess: Status update failed:', errorText);
          throw new Error('Failed to confirm appointment: ' + errorText);
        }

        // Create payment record
        const appointmentData = JSON.parse(localStorage.getItem('pendingAppointmentData') || '{}');
        console.log('BookingPaymentSuccess: appointmentData from localStorage:', appointmentData);
        
        const paymentData = {
          appointmentId: appointmentId,
          amount: appointmentData?.slotPrice || 0,
          paymentMethod: "stripe",
          status: "COMPLETED",
          transactionId: sessionId,
          stripePaymentIntentId: sessionId
        };

        console.log('BookingPaymentSuccess: Creating payment record with data:', paymentData);
        
        const paymentUrl = `${API_BASE_URL}/api/payments`;
        console.log('BookingPaymentSuccess: Making payment request to:', paymentUrl);

        const paymentResponse = await fetch(paymentUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });

        console.log('BookingPaymentSuccess: Payment response status:', paymentResponse.status);
        console.log('BookingPaymentSuccess: Payment response ok:', paymentResponse.ok);

        if (!paymentResponse.ok && paymentResponse.status !== 409) {
          // Only throw error if it's not a duplicate payment error (409 conflict)
          const errorText = await paymentResponse.text();
          console.warn('Payment record creation failed:', errorText);
          throw new Error('Failed to create payment record: ' + errorText);
        } else if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          console.log('Payment record created/updated successfully:', paymentResult);
        } else {
          console.log('Payment already exists (409 conflict), continuing...');
        }

        // Clean up storage
        localStorage.removeItem('confirmingAppointmentId');
        localStorage.removeItem('stripeSessionId');
        sessionStorage.removeItem('confirmingAppointmentId');
        sessionStorage.removeItem('stripeSessionId');

        setLoading(false);
        setProcessing(false);
      } catch (err) {
        console.error('Error completing payment:', err);
        setError(err.message);
        setLoading(false);
        setProcessing(false);
      }
    };

    completePayment();
  }, []); // Empty dependency array to run only once

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #667eea', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite', 
          margin: '0 auto 20px' 
        }}></div>
        <h2>Confirming your appointment...</h2>
        <p>Please wait while we process your payment and confirm your booking.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#f44336' }}>Payment Error</h2>
        <p>There was an error confirming your appointment: {error}</p>
        <button 
          onClick={() => navigate('/show-appointments')}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
      <h2 style={{ color: '#4BB543' }}>Payment Successful!</h2>
      <p>Your appointment has been confirmed and approved!</p>
      <p>You will receive a confirmation email shortly.</p>
      <div style={{ marginTop: '40px' }}>
        <button 
          onClick={() => navigate('/show-appointments')}
          style={{
            background: '#4BB543',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          View My Bookings
        </button>
        <button 
          onClick={() => navigate('/business/customer')}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Book Another Appointment
        </button>
      </div>
    </div>
  );
};

export default BookingPaymentSuccess;
