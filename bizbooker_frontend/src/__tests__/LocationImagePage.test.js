import React from 'react';
import { render, screen, fireEvent, waitFor,act,cleanup } from '@testing-library/react';
import { MemoryRouter,Routes,Route } from 'react-router-dom';
import LocationImagesPage from '../modules/LocationImagesPage';
import '@testing-library/jest-dom';

// Mock all components and hooks properly
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ locationId: '1' }),
  useNavigate: () => jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div>ChevronLeftIcon</div>,
  Plus: () => <div>PlusIcon</div>,
  Trash2: () => <div>TrashIcon</div>,
  Briefcase: () => <div data-testid="briefcase-icon">BriefcaseIcon</div>,
  Upload: () => <div data-testid="file-upload-input">UploadIcon</div>,
  Image: () => <div>ImageIcon</div>,
  Star: () => <div>StarIcon</div>,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'test-token'),
};

describe('LocationImagesPage', () => {
  const mockImages = [
    {
      id: 1,
      imageName: 'test.jpg',
      imageData: 'abc123',
      imageType: 'image/jpeg',
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner while fetching images', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <LocationImagesPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading images...')).toBeInTheDocument();
  });

  it('shows error message when API fails', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    render(
      <MemoryRouter>
        <LocationImagesPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays images when API succeeds', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImages),
    });
    
    render(
      <MemoryRouter>
        <LocationImagesPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  it('shows empty state when no images exist', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    
    render(
      <MemoryRouter>
        <LocationImagesPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No images available for this location')).toBeInTheDocument();
    });
  });

  it('shows delete confirmation when delete button clicked', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImages),
    });
    
    render(
      <MemoryRouter>
        <LocationImagesPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'));
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this image?');
    });
  });

  it('shows placeholder when image fails to load', async () => {
    const mockImagesWithInvalidData = [{
      id: 1,
      imageName: 'broken.jpg',
      imageData: null,
      imageType: 'image/jpeg'
    }];

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockImagesWithInvalidData),
    });
    
    render(
      <MemoryRouter>
        <LocationImagesPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
    });
  });


});
