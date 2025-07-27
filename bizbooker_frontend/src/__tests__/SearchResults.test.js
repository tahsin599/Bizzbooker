import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchResults from '../modules/SearchResults';
import '@testing-library/jest-dom';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Building: () => <div data-testid="building-icon" />,
}));

// Mock fetch
global.fetch = jest.fn();

describe('SearchResults', () => {
  const mockOnClose = jest.fn();
  const mockQuery = 'test query';

  const mockApiResults = [
    {
      id: '1',
      name: 'Test Business 1',
      area: 'Test Area',
      city: 'Test City',
      imageData: 'test-image-data-1'
    },
    {
      id: '2',
      name: 'Test Business 2',
      area: 'Test Area 2',
      city: 'Test City 2',
      imageData: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockReset();
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: MemoryRouter });
  };

  it('shows no results when query is empty', () => {
    renderWithRouter(<SearchResults query="" onClose={mockOnClose} />);
    expect(screen.queryByTestId('search-icon')).not.toBeInTheDocument();
  });

  it('shows loading state when fetching results', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => { }));
    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText(`No results found for "${mockQuery}"`)).toBeInTheDocument();
  });

  it('correctly transforms and displays API results', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResults)
    });

    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
      expect(screen.getByText('Test Business 2')).toBeInTheDocument();
      const locationElement = screen.getByText((content, node) => {
        return node.textContent === 'Test Area, Test City' && node.classList.contains('search-result-location');
      });
      expect(locationElement).toBeInTheDocument();
       const locationElement2 = screen.getByText((content, node) => {
        return node.textContent === 'Test Area 2, Test City 2' && node.classList.contains('search-result-location');
      });
      expect(locationElement2).toBeInTheDocument();
      expect(screen.getAllByText('Business')).toHaveLength(2);
      expect(screen.getAllByTestId('building-icon')).toHaveLength(2);
    });
  });

  it('handles minimal item data correctly', async () => {
    const minimalResults = [
      {
        id: '3',
        name: 'Minimal Business'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(minimalResults)
    });

    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Minimal Business')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.queryByText(/,/)).not.toBeInTheDocument();
    });
  });

  it('shows no results message when no matches found', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByText(`No results found for "${mockQuery}"`)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API error'));
    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByText(`No results found for "${mockQuery}"`)).toBeInTheDocument();
    });
  });

  it('loads more results when scrolling to bottom', async () => {
    // First page results
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResults)
    });

    // Second page results
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        {
          id: '3',
          name: 'Test Business 3',
          area: 'Test Area 3',
          city: 'Test City 3'
        }
      ])
    });

    const { container } = renderWithRouter(
      <SearchResults query={mockQuery} onClose={mockOnClose} />
    );

    // Wait for initial results to load
    await waitFor(() => {
      expect(screen.getByText('Test Business 1')).toBeInTheDocument();
    });

    // Get the scroll container
    const scrollContainer = container.querySelector('.search-results-container');

    // Mock scroll properties
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000 });
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 800 });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 200 });

    // Trigger scroll event
    fireEvent.scroll(scrollContainer);

    // Verify loading state appears
    await waitFor(() => {
      expect(screen.getByText('Loading more results...')).toBeInTheDocument();
    });

    // Verify new results are loaded
    await waitFor(() => {
      expect(screen.getByText('Test Business 3')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
  it('calls onClose when a result is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResults)
    });

    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Business 1'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles items without image data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResults)
    });

    renderWithRouter(<SearchResults query={mockQuery} onClose={mockOnClose} />);

    await waitFor(() => {
      const icons = screen.getAllByTestId('building-icon');
      expect(icons.length).toBe(2);
    });
  });
});