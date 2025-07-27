import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import AddLocationPage from '../modules/AddLocationPage';
import { API_BASE_URL } from '../config/api';
import '@testing-library/jest-dom';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  Save: () => <div data-testid="save-icon" />
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

describe('AddLocationPage', () => {
  const mockBusinessId = '123';
  const mockToken = 'test-token';
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    localStorage.setItem('token', mockToken);
    useNavigate.mockReturnValue(mockNavigate);
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={[`/business/${mockBusinessId}/add-location`]}>
        <Routes>
          <Route path="/business/:businessId/add-location" element={<AddLocationPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders the form with all required fields', () => {
    renderComponent();

    expect(screen.getByText('Add New Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Area *')).toBeInTheDocument();
    expect(screen.getByLabelText('City *')).toBeInTheDocument();
    expect(screen.getByLabelText('Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Set as primary location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Location/i })).toBeInTheDocument();
  });



  it('submits the form successfully with valid data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Address *'), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText('Area *'), { target: { value: 'Mirpur' } });
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'Dhaka' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '01712345678' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Location/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          address: '123 Test Street',
          area: 'Mirpur',
          city: 'Dhaka',
          postalCode: '',
          contactPhone: '01712345678',
          contactEmail: '',
          isPrimary: false,
          business: { id: mockBusinessId }
        })
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith(`/business/${mockBusinessId}?tab=locations`);
  });

  it('shows error message when submission fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('Validation error')
    });

    renderComponent();

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Address *'), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText('Area *'), { target: { value: 'Mirpur' } });
    fireEvent.change(screen.getByLabelText('City *'), { target: { value: 'Dhaka' } });
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '01712345678' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Location/i }));

    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});