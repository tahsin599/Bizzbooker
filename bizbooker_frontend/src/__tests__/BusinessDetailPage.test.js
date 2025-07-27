import React from 'react';
import { render, screen, fireEvent, waitFor, act,cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import BusinessDetailPage from '../modules/BusinessDetailPage';
import '@testing-library/jest-dom';

// Mock the Navbar component
jest.mock('../modules/Navbar', () => () => <div>NavbarMock</div>);

// Mock the Lucide icons with unique identifiers
jest.mock('lucide-react', () => ({
  Briefcase: () => <div data-testid="briefcase-icon">BriefcaseIcon</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPinIcon</div>,
  Phone: () => <div data-testid="phone-icon">PhoneIcon</div>,
  Mail: () => <div data-testid="mail-icon">MailIcon</div>,
  Clock: () => <div data-testid="clock-icon">ClockIcon</div>,
  Calendar: () => <div data-testid="calendar-icon">CalendarIcon</div>,
  Plus: () => <div data-testid="plus-icon">PlusIcon</div>,
  Edit: () => <div data-testid="edit-icon">EditIcon</div>,
  Trash2: () => <div data-testid="trash-icon">TrashIcon</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeftIcon</div>,
  Check: () => <div data-testid="check-icon">CheckIcon</div>,
  X: () => <div data-testid="x-icon">XIcon</div>,
  Image: () => <div data-testid="image-icon">ImageIcon</div>,
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('BusinessDetailPage', () => {
  const mockToken = 'test-token';
  const mockBusiness = {
    id: 1,
    businessName: 'Test Business',
    categoryName: 'Test Category',
    approvalStatus: 'APPROVED',
    description: 'Test description',
    createdAt: '2023-01-01T00:00:00Z',
    imageData: 'test-image-data',
    imageType: 'image/jpeg',
    locations: [
      {
        locationId: 1,
        address: '123 Test St',
        area: 'Test Area',
        city: 'Test City',
        postalCode: '12345',
        contactPhone: '123-456-7890',
        contactEmail: 'test@example.com',
        isPrimary: true
      },
      {
        locationId: 2,
        address: '456 Another St',
        area: 'Test Area 2',
        city: 'Test City 2',
        postalCode: '67890',
        contactPhone: '987-654-3210',
        contactEmail: 'test2@example.com',
        isPrimary: false
      }
    ]
  };

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Set default return values
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    fetch.mockClear();
    mockNavigate.mockClear();
  });
  
  afterEach(() => {
  jest.restoreAllMocks();
  cleanup(); 
 });
  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('should render loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    renderWithRouter(<BusinessDetailPage />);
    expect(screen.getByText('Loading business details...')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading business')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('should render business details after successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Business')).toBeInTheDocument();
      expect(screen.getByText(/Test Category/)).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('should navigate to login when no token exists', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    
    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should display business image when available', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      const image = screen.getByAltText('Test Business');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', expect.stringContaining('test-image-data'));
    });
  });

  it('should display placeholder when image is not available', async () => {
    const businessWithoutImage = { ...mockBusiness, imageData: null };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(businessWithoutImage),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      // Get all instances and verify the one in the image placeholder exists
      const briefcaseIcons = screen.getAllByTestId('briefcase-icon');
      const imagePlaceholder = briefcaseIcons.find(icon => 
        icon.closest('.image-placeholder')
      );
      expect(imagePlaceholder).toBeInTheDocument();
    });
  });

  it('should display primary location information', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/123 Test St, Test Area, Test City, 12345/)).toBeInTheDocument();
      expect(screen.getByText(/123-456-7890/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });
  });

  it('should switch between tabs correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Locations'));
      expect(screen.getByText('Business Locations')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Business Hours'));
      expect(screen.getByText('Monday')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Business Settings')).toBeInTheDocument();
    });
  });

  it('should navigate to location images when button clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Locations'));
      const imagesButtons = screen.getAllByTestId('image-icon');
      fireEvent.click(imagesButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/locations/1/images');
    });
  });

  it('should display all locations in locations tab', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Locations'));
      expect(screen.getByText('Location 1')).toBeInTheDocument();
      expect(screen.getByText('Location 2')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  it('should navigate back to my businesses page when back button clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBusiness),
    });

    await act(async () => {
      renderWithRouter(<BusinessDetailPage />);
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('chevron-left-icon'));
      expect(mockNavigate).toHaveBeenCalledWith('/userBusiness');
    });
  });
});