import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserBusinesses from '../modules/UserBusinesses';
import '@testing-library/jest-dom';
import { Briefcase, PlusCircle, ArrowRight, Clock, MapPin, Phone, Check, X } from 'lucide-react';

// Mock Lucide icons with unique test IDs
jest.mock('lucide-react', () => ({
  Briefcase: () => <div data-testid="briefcase-icon">BriefcaseIcon</div>,
  PlusCircle: () => <div data-testid="plus-icon">PlusIcon</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRightIcon</div>,
  Clock: () => <div data-testid="clock-icon">ClockIcon</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPinIcon</div>,
  Phone: () => <div data-testid="phone-icon">PhoneIcon</div>,
  Check: () => <div data-testid="check-icon">CheckIcon</div>,
  X: () => <div data-testid="x-icon">XIcon</div>,
}));

// Mock Navbar
jest.mock('../modules/Navbar', () => () => <div>NavbarMock</div>);

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
};

// Mock useNavigate
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

// Mock fetch
global.fetch = jest.fn();

describe('UserBusinesses', () => {
  const mockUserId = 'user-123';
  const mockToken = 'test-token';
  const mockBusinesses = [
    {
      id: 1,
      businessName: 'Test Business 1',
      description: 'Test description 1',
      categoryName: 'Test Category',
      approvalStatus: 'APPROVED',
      isApproved: true,
      createdAt: '2023-01-01T00:00:00Z',
      imageData: 'abc123',
      imageType: 'image/jpeg',
      locations: [
        {
          address: '123 Test St',
          city: 'Test City',
          contactPhone: '123-456-7890',
          contactEmail: 'test1@example.com',
          isPrimary: true
        }
      ]
    },
    {
      id: 2,
      businessName: 'Test Business 2',
      description: 'Test description 2',
      categoryName: 'Another Category',
      approvalStatus: 'PENDING',
      isApproved: false,
      createdAt: '2023-02-01T00:00:00Z',
      imageData: null,
      locations: [
        {
          address: '456 Another St',
          city: 'Test City 2',
          contactPhone: '987-654-3210',
          contactEmail: 'test2@example.com',
          isPrimary: true
        }
      ]
    }
  ];

  beforeEach(() => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return mockUserId;
      if (key === 'token') return mockToken;
      return null;
    });

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    mockNavigate.mockClear();
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to login if no user ID or token', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    mockLocalStorage.getItem.mockReturnValueOnce(null);

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should show loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading your businesses...')).toBeInTheDocument();
  });

  it('should show error message when API fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading businesses')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('should redirect to create-business when no businesses exist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/create-business');
    });
  });

  it('should display businesses when API succeeds', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusinesses),
    });

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check business names
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
      expect(screen.getByText('Test Business 2')).toBeInTheDocument();

      // Check stats
      expect(screen.getByText('2')).toBeInTheDocument(); // Total businesses
      expect(screen.getByText('1')).toBeInTheDocument(); // Approved businesses

      // Check images
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(1); // Only one business has imageData
      
      // Check for at least one briefcase icon (there may be multiple)
      expect(screen.getAllByTestId('briefcase-icon').length).toBeGreaterThan(0);

      // Check status badges - specifically look for the clock icon in status badges
      const clockIcons = screen.getAllByTestId('clock-icon');
      const statusClockIcon = clockIcons.find(icon => 
        icon.closest('.status-badge')
      );
      expect(statusClockIcon).toBeInTheDocument(); // Pending status badge

      // Check location info
      expect(screen.getByText('123 Test St, Test City')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });
  });

  it('should navigate to business details when manage button clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusinesses),
    });

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      const manageButtons = screen.getAllByText('Manage Business');
      fireEvent.click(manageButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/business/1');
    });
  });

  it('should navigate to create-business when add button clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusinesses),
    });

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add New Business');
      fireEvent.click(addButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/create-business');
    });
  });

  it('should show correct approval status badges', async () => {
    const mixedStatusBusinesses = [
      ...mockBusinesses,
      {
        id: 3,
        businessName: 'Rejected Business',
        approvalStatus: 'REJECTED',
        isApproved: false,
        createdAt: '2023-03-01T00:00:00Z',
        locations: []
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mixedStatusBusinesses),
    });

    render(
      <MemoryRouter>
        <UserBusinesses />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check for exactly one of each status icon in the business cards
      const checkIcons = screen.getAllByTestId('check-icon');
      const clockIcons = screen.getAllByTestId('clock-icon');
      const xIcons = screen.getAllByTestId('x-icon');
      
      const statusCheckIcon = checkIcons.find(icon => 
        icon.closest('.status-badge')
      );
      const statusClockIcon = clockIcons.find(icon => 
        icon.closest('.status-badge')
      );
      const statusXIcon = xIcons.find(icon => 
        icon.closest('.status-badge')
      );

      expect(statusCheckIcon).toBeInTheDocument(); // Approved
      expect(statusClockIcon).toBeInTheDocument(); // Pending
      expect(statusXIcon).toBeInTheDocument(); // Rejected
    });
  });
});