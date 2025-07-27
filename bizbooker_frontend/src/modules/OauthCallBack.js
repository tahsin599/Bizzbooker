// src/components/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userEmail = searchParams.get('user');

    if (token) {
      // Store token in localStorage or context
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', userEmail);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate]);

  return <div>Processing OAuth login...</div>;
};

export default OAuthCallback;