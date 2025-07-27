import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const StripeOnboardingComplete = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stripe-connect/complete-onboarding/${businessId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to complete onboarding');
        }

        const data = await response.json();
        setSuccess(true);
        
        // Redirect to stripe connect dashboard after 3 seconds
        setTimeout(() => {
          navigate(`/stripe-connect-dashboard/${businessId}`);
        }, 3000);

      } catch (error) {
        console.error('Error completing onboarding:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      completeOnboarding();
    }
  }, [businessId, navigate, token]);

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
        <h2>Completing your payment setup...</h2>
        <p>Please wait while we finalize your account.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Setup Error</h2>
        <p style={{ color: '#f44336' }}>There was an error completing your setup: {error}</p>
        <button 
          onClick={() => navigate(`/stripe-connect-dashboard/${businessId}`)}
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
          Try Again
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
        <h2>Payment Setup Complete!</h2>
        <p>Your Stripe account has been successfully set up. You can now receive payments from customers.</p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Redirecting you back to the setup page...</p>
      </div>
    );
  }

  return null;
};

export default StripeOnboardingComplete;
