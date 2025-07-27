import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import Navbar from './Navbar';
import './StripeConnectDashboard.css';

const StripeConnectDashboard = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAccountStatus();
  }, [businessId]);

  const fetchAccountStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/account-status/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStatus(data);
      } else {
        setError('Failed to fetch account status');
      }
    } catch (error) {
      console.error('Error fetching account status:', error);
      setError('Error fetching account status');
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-account/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        await createOnboardingLink();
      } else {
        setError('Failed to create Stripe account');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setError('Error starting onboarding');
    } finally {
      setLoading(false);
    }
  };

  const createOnboardingLink = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/create-onboarding-link/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        setError('Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Error creating onboarding link:', error);
      setError('Error creating onboarding link');
    }
  };

  const openStripeDashboard = async () => {
    try {
      setDashboardLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stripe-connect/dashboard-link/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        setError('Failed to open dashboard');
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      setError('Failed to open dashboard');
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stripe-connect">
        <Navbar />
        <div className="stripe-connect__container">
          <div className="stripe-connect__loading">
            <div className="stripe-connect__spinner"></div>
            <p>Loading payment settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-connect">
      <Navbar />
      <div className="stripe-connect__container">
        <div className="stripe-connect__header">
          <h2>Payment Settings</h2>
          <p>Manage your payment account and view earnings</p>
        </div>

        {error && (
          <div className="stripe-connect__error">
            <p>{error}</p>
            <button onClick={() => setError('')} className="stripe-connect__btn-clear">
              Dismiss
            </button>
          </div>
        )}

        {!accountStatus?.accountExists ? (
          <div className="stripe-connect__state stripe-connect__state--no-account">
            <div className="stripe-connect__icon">
              <CreditCard size={64} />
            </div>
            <h3>Set Up Payments</h3>
            <p>
              Set up your payment account to start receiving money from customer bookings.
              We use Stripe to ensure secure and fast transfers to your bank account.
            </p>
            <button onClick={startOnboarding} className="stripe-connect__btn stripe-connect__btn--primary">
              Set Up Payment Account
            </button>
          </div>
        ) : !accountStatus.onboardingComplete ? (
          <div className="stripe-connect__state stripe-connect__state--incomplete">
            <div className="stripe-connect__status-indicator stripe-connect__status-indicator--warning">
              <AlertCircle size={24} />
            </div>
            <h3>Complete Payment Setup</h3>
            <p>Your payment account is created but setup isn't complete.</p>
            
            <div className="stripe-connect__status-details">
              <div className="stripe-connect__status-item">
                <span className={`stripe-connect__status-dot ${accountStatus.chargesEnabled ? 'stripe-connect__status-dot--success' : 'stripe-connect__status-dot--warning'}`}></span>
                <span>Accept Payments: {accountStatus.chargesEnabled ? 'Enabled' : 'Pending'}</span>
              </div>
              <div className="stripe-connect__status-item">
                <span className={`stripe-connect__status-dot ${accountStatus.payoutsEnabled ? 'stripe-connect__status-dot--success' : 'stripe-connect__status-dot--warning'}`}></span>
                <span>Receive Payouts: {accountStatus.payoutsEnabled ? 'Enabled' : 'Pending'}</span>
              </div>
            </div>

            <button onClick={startOnboarding} className="stripe-connect__btn stripe-connect__btn--primary">
              Complete Setup
            </button>
          </div>
        ) : (
          <div className="stripe-connect__state stripe-connect__state--active">
            <div className="stripe-connect__status-indicator stripe-connect__status-indicator--success">
              <CheckCircle size={24} />
            </div>
            <h3>Payment Account Active</h3>
            <p>Your payment account is fully set up and ready to receive payments.</p>

            <div className="stripe-connect__account-info">
              <div className="stripe-connect__info-grid">
                <div className="stripe-connect__info-item">
                  <h4>Platform Fee</h4>
                  <p className="stripe-connect__fee">{accountStatus.platformFeePercentage || 5}%</p>
                  <small>per transaction</small>
                </div>
                <div className="stripe-connect__info-item">
                  <h4>Your Earnings</h4>
                  <p className="stripe-connect__earnings">{100 - (accountStatus.platformFeePercentage || 5)}%</p>
                  <small>per transaction</small>
                </div>
                <div className="stripe-connect__info-item">
                  <h4>Payout Schedule</h4>
                  <p>Daily</p>
                  <small>for eligible transactions</small>
                </div>
                <div className="stripe-connect__info-item">
                  <h4>Account Status</h4>
                  <p className="stripe-connect__status-text">Active</p>
                  <small>charges and payouts enabled</small>
                </div>
              </div>
            </div>

            <div className="stripe-connect__actions">
              <button 
                onClick={openStripeDashboard} 
                disabled={dashboardLoading}
                className="stripe-connect__btn stripe-connect__btn--primary"
              >
                {dashboardLoading ? 'Opening...' : 'View Stripe Dashboard'}
              </button>
              <button 
                onClick={() => navigate(`/business/${businessId}`)}
                className="stripe-connect__btn stripe-connect__btn--secondary"
              >
                Back to Business
              </button>
            </div>

            <div className="stripe-connect__help">
              <h4>Payment Information</h4>
              <ul className="stripe-connect__help-list">
                <li className="stripe-connect__help-item">Payments are processed automatically when customers book appointments</li>
                <li className="stripe-connect__help-item">Funds are transferred to your bank account according to Stripe's payout schedule</li>
                <li className="stripe-connect__help-item">You can view detailed payment history in your Stripe dashboard</li>
                <li className="stripe-connect__help-item">Platform fees are deducted automatically before payouts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeConnectDashboard;