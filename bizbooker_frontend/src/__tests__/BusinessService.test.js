import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BusinessService from '../modules/BusinessService';
import '@testing-library/jest-dom';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Check: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('BusinessService', () => {
  const mockBusinessId = '123';
  const mockToken = 'test-token';
  const mockBusinessData = {
    businessName: 'Test Business',
    categoryName: 'Test Category',
    description: 'Test description',
    imageData: 'test-image-data',
    locations: [
      {
        address: '123 Test St',
        area: 'Test Area',
        city: 'Test City',
        postalCode: '12345',
        contactPhone: '123-456-7890',
        contactEmail: 'test@example.com',
        isPrimary: true
      }
    ]
  };

  beforeEach(() => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ businessId: mockBusinessId });
    localStorageMock.getItem.mockReturnValue(mockToken);
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={[`/business/${mockBusinessId}`]}>
        <Routes>
          <Route path="/business/:businessId" element={<BusinessService />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading business details...')).toBeInTheDocument();
  });

  it('displays business information after loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusinessData)
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockBusinessData.businessName)).toBeInTheDocument();
      expect(screen.getByText(mockBusinessData.categoryName)).toBeInTheDocument();
      expect(screen.getByText(mockBusinessData.description)).toBeInTheDocument();
    });
  });

  it('shows error message when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Error loading business')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('displays and switches between tabs', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusinessData)
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Locations')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Locations'));
    expect(screen.getByText('Our Locations')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Services'));
    expect(screen.getByText('Book Your Appointment')).toBeInTheDocument();
  });

  it('displays location information correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusinessData)
    });

    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Locations'));
      
      expect(screen.getByText('123 Test St, Test Area, Test City')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  it('handles missing image data', async () => {
    const businessWithoutImage = {
      ...mockBusinessData,
      imageData: null
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(businessWithoutImage)
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    });
  });
});