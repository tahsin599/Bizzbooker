import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './StripeOnboarding.css';

const StripeOnboarding = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    checkAccountStatus();
  }, [businessId]);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/account-status/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check account status');
      }

      const data = await response.json();
      setAccountStatus(data);
    } catch (error) {
      console.error('Error checking account status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createStripeAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-account/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      await checkAccountStatus();
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accountStatus?.hasStripeAccount) {
        await createStripeAccount();
      }

      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-onboarding-link/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAccountStatus = () => {
    if (!accountStatus) return null;

    if (!accountStatus.hasStripeAccount) {
      return (
        <div className="stripe-onboarding__status">
          <div className="stripe-onboarding__card">
            <h3 className="stripe-onboarding__card-title">Payment Setup Required</h3>
            <p className="stripe-onboarding__card-text">To receive payments from customers, you need to set up a Stripe account.</p>
            <ul className="stripe-onboarding__card-list">
              <li className="stripe-onboarding__card-item">✓ Secure payment processing</li>
              <li className="stripe-onboarding__card-item">✓ Direct deposits to your bank account</li>
              <li className="stripe-onboarding__card-item">✓ Real-time payment tracking</li>
              <li className="stripe-onboarding__card-item">✓ Automatic tax reporting</li>
            </ul>
            <button 
              className={`stripe-onboarding__btn ${loading ? 'stripe-onboarding__btn--disabled' : ''}`}
              onClick={startOnboarding}
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Set Up Payments'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="stripe-onboarding__status">
        <div className="stripe-onboarding__card">
          <h3 className="stripe-onboarding__card-title">Payment Account Status</h3>
          <div className="stripe-onboarding__status-items">
            <div className={`stripe-onboarding__status-item ${accountStatus.onboardingCompleted ? 'stripe-onboarding__status-item--completed' : 'stripe-onboarding__status-item--pending'}`}>
              <span className="stripe-onboarding__status-icon">
                {accountStatus.onboardingCompleted ? '✅' : '🔄'}
              </span>
              <span>Account Setup: {accountStatus.onboardingCompleted ? 'Complete' : 'Pending'}</span>
            </div>
            
            <div className={`stripe-onboarding__status-item ${accountStatus.chargesEnabled ? 'stripe-onboarding__status-item--completed' : 'stripe-onboarding__status-item--pending'}`}>
              <span className="stripe-onboarding__status-icon">
                {accountStatus.chargesEnabled ? '✅' : '🔄'}
              </span>
              <span>Receiving Payments: {accountStatus.chargesEnabled ? 'Enabled' : 'Pending'}</span>
            </div>
            
            <div className={`stripe-onboarding__status-item ${accountStatus.payoutsEnabled ? 'stripe-onboarding__status-item--completed' : 'stripe-onboarding__status-item--pending'}`}>
              <span className="stripe-onboarding__status-icon">
                {accountStatus.payoutsEnabled ? '✅' : '🔄'}
              </span>
              <span>Bank Transfers: {accountStatus.payoutsEnabled ? 'Enabled' : 'Pending'}</span>
            </div>
          </div>

          {!accountStatus.onboardingCompleted && (
            <div className="stripe-onboarding__action-section">
              <p className="stripe-onboarding__card-text">Complete your account setup to start receiving payments.</p>
              <button 
                className={`stripe-onboarding__btn ${loading ? 'stripe-onboarding__btn--disabled' : ''}`}
                onClick={startOnboarding}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Continue Setup'}
              </button>
            </div>
          )}

          {accountStatus.onboardingCompleted && accountStatus.chargesEnabled && (
            <div className="stripe-onboarding__success-section">
              <p className="stripe-onboarding__success-text">🎉 Your payment account is fully set up! You can now receive payments from customers.</p>
              <button 
                className="stripe-onboarding__btn"
                onClick={() => navigate(`/business-config/${businessId}`)}
              >
                Back to Business Settings
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !accountStatus) {
    return (
      <div className="stripe-onboarding__loading">
        <div className="stripe-onboarding__spinner"></div>
        <p>Loading payment setup...</p>
      </div>
    );
  }

  return (
    <div className="stripe-onboarding">
      <div className="stripe-onboarding__content">
        <h1 className="stripe-onboarding__title">Payment Setup</h1>
        
        {error && (
          <div className="stripe-onboarding__error">
            <p>Error: {error}</p>
            <button className="stripe-onboarding__error-btn" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {renderAccountStatus()}
      </div>
    </div>
  );
};

export default StripeOnboarding;