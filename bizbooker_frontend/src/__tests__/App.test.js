import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock all child components
jest.mock('../modules/Navbar', () => () => <div>Navbar</div>);
jest.mock('../modules/LandingPage', () => () => <div>LandingPage</div>);
jest.mock('../modules/Footer', () => () => <div>Footer</div>);
jest.mock('../modules/SignupForm', () => () => <div>SignupForm</div>);
jest.mock('../modules/LoginForm', () => () => <div>LoginForm</div>);
jest.mock('../modules/AboutUs', () => () => <div>AboutUs</div>);
jest.mock('../modules/DashBoard', () => () => <div>Dashboard</div>);
jest.mock('../modules/CreateBusiness', () => () => <div>CreateBusiness</div>);
jest.mock('../modules/BusinessService', () => () => <div>BusinessService</div>);
jest.mock('../modules/OauthCallBack', () => () => <div>OAuthCallback</div>);
jest.mock('../modules/UserBusinesses', () => () => <div>UserBusinesses</div>);
jest.mock('../modules/BusinessDetailPage', () => () => <div>BusinessDetailPage</div>);
jest.mock('../modules/AddLocationPage', () => () => <div>AddLocationPage</div>);
jest.mock('../modules/LocationImagesPage', () => () => <div>LocationImagesPage</div>);
jest.mock('../modules/BusinessListingPage', () => () => <div>BusinessListingPage</div>);
jest.mock('../modules/ErrorBoundary', () => ({ children }) => <div>{children}</div>);

describe('App Component', () => {
  test('renders Navbar and LandingPage for root route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('LandingPage')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders correct components for /signup route', () => {
    window.history.pushState({}, '', '/signup');
    render(<App />);
    
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('SignupForm')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders correct components for /login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('LoginForm')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders correct components for /dashboard route', () => {
    window.history.pushState({}, '', '/dashboard');
    render(<App />);
    
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders OAuthCallback component for /oauth/callback route', () => {
    window.history.pushState({}, '', '/oauth/callback');
    render(<App />);
    
    expect(screen.getByText('OAuthCallback')).toBeInTheDocument();
  });

  test('renders BusinessDetailPage for /business/:id route', () => {
    window.history.pushState({}, '', '/business/123');
    render(<App />);
    
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('BusinessDetailPage')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders AddLocationPage for /business/:businessId/add-location route', () => {
    window.history.pushState({}, '', '/business/123/add-location');
    render(<App />);
    
    expect(screen.getByText('AddLocationPage')).toBeInTheDocument();
  });

  test('renders LocationImagesPage for /locations/:locationId/images route', () => {
    window.history.pushState({}, '', '/locations/123/images');
    render(<App />);
    
    expect(screen.getByText('LocationImagesPage')).toBeInTheDocument();
  });
});