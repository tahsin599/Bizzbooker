import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import BusinessListingPage from '../modules/BusinessListingPage';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {
      this.observe = jest.fn();
      this.unobserve = jest.fn();
      this.disconnect = jest.fn();
    }
  };
});

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Briefcase: () => <div>BriefcaseIcon</div>,
  MapPin: () => <div>MapPinIcon</div>,
  Filter: () => <div>FilterIcon</div>,
  ChevronRight: () => <div>ChevronRightIcon</div>,
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('BusinessListingPage', () => {
  const mockToken = 'test-token';
  const mockRandomBusinesses = [
    {
      id: 1,
      businessName: 'Test Business 1',
      categoryName: 'Test Category',
      approvalStatus: 'APPROVED',
      imageData: 'test-image-data',
      imageType: 'image/jpeg',
      locations: [
        {
          area: 'Test Area',
          city: 'Test City',
          isPrimary: true,
        },
      ],
    },
    {
      id: 2,
      businessName: 'Test Business 2',
      categoryName: 'Test Category 2',
      approvalStatus: 'PENDING',
      locations: [
        {
          area: 'Test Area 2',
          city: 'Test City 2',
          isPrimary: true,
        },
      ],
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' },
  ];

  const mockAreas = ['Test Area', 'Test Area 2'];

  const mockBusinessesPage = {
    content: mockRandomBusinesses,
    last: false,
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

    // Default mock implementations
    fetch.mockImplementation((url) => {
      if (url.includes('/api/customer/businesses/random')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRandomBusinesses),
        });
      }
      if (url.includes('/api/customer/businesses/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCategories),
        });
      }
      if (url.includes('/api/customer/businesses/areas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAreas),
        });
      }
      if (url.includes('/api/customer/businesses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBusinessesPage),
        });
      }
      return Promise.reject(new Error('Unexpected URL: ' + url));
    });
  });

  it('should render without crashing', async () => {
    render(<BusinessListingPage />);
    await waitFor(() => {
      expect(screen.getByText('Loading more businesses...')).toBeInTheDocument();
    });
  });

  it('displays random businesses on initial load', async () => {
    render(<BusinessListingPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
      expect(screen.getByText('Test Business 2')).toBeInTheDocument();
      expect(screen.getByText('Test Category')).toBeInTheDocument();
      expect(screen.getByText('Test Area, Test City')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));
    render(<BusinessListingPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading businesses')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('applies category filter correctly', async () => {
    render(<BusinessListingPage />);

    await waitFor(() => {
      // Find the category select by finding the select that contains "All Categories" option
      const selects = screen.getAllByRole('combobox');
      const categoryFilter = selects.find(select => 
        select.innerHTML.includes('All Categories')
      );
      fireEvent.change(categoryFilter, { target: { value: '1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    });
  });

  it('applies area filter correctly', async () => {
    render(<BusinessListingPage />);

    await waitFor(() => {
      // Find the area select by finding the select that contains "All Areas" option
      const selects = screen.getAllByRole('combobox');
      const areaFilter = selects.find(select => 
        select.innerHTML.includes('All Areas')
      );
      fireEvent.change(areaFilter, { target: { value: 'Test Area' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    });
  });

  it('navigates to business details when view button is clicked', async () => {
    render(<BusinessListingPage />);

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view details/i });
      // Click the first button which should correspond to business ID 1
      fireEvent.click(viewButtons[0]);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/business/customer/1');
  });

  it('handles image loading errors gracefully', async () => {
    const mockBusinessWithImage = {
      ...mockRandomBusinesses[0],
      imageData: 'invalid-image-data',
    };

    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockBusinessWithImage]),
      })
    );

    render(<BusinessListingPage />);

    await waitFor(() => {
      expect(screen.getByText('BriefcaseIcon')).toBeInTheDocument();
    });
  });
});