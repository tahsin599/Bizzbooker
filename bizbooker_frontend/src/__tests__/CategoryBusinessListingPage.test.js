// src/__tests__/CategoryBusinessListingPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryBusinessListingPage from '../modules/CategoryBusinessListingPage';

// Mock react-router hooks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
    });
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(function (callback) {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    this.unobserve = jest.fn();
    this.callback = callback;
    return this;
});

// Mock data
const mockBusinesses = [
    {
        id: 1,
        businessName: "Test Business 1",
        categoryName: "Test Category",
        averageRating: 4.5,
        imageData: "base64string1",
        imageType: "image/jpeg",
        locations: [{ isPrimary: true, area: "Downtown", city: "Test City" }]
    },
    {
        id: 2,
        businessName: "Test Business 2",
        categoryName: "Test Category",
        averageRating: 3.8,
        imageData: "base64string2",
        imageType: "image/png",
        locations: [{ isPrimary: false, area: "Uptown", city: "Test City" }]
    }
];

const mockResponse = (data, last = false) => ({
    ok: true,
    json: () => Promise.resolve({
        content: data,
        last
    })
});

describe('CategoryBusinessListingPage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useParams.mockReturnValue({ categoryId: '1' });
        useNavigate.mockReturnValue(mockNavigate);
        mockLocalStorage.getItem.mockImplementation((key) => key === 'token' ? 'mock-token' : null);
        mockLocalStorage.setItem('token', 'mock-token');
        global.fetch = jest.fn();
        mockNavigate.mockClear();
        mockLocalStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        global.fetch.mockResolvedValueOnce(mockResponse(mockBusinesses));

        render(<CategoryBusinessListingPage />);

        expect(screen.getByText(/Loading more businesses/i)).toBeInTheDocument();
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    });

    it('displays businesses after loading', async () => {
        global.fetch.mockResolvedValueOnce(mockResponse(mockBusinesses));

        render(<CategoryBusinessListingPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Business 1')).toBeInTheDocument();
            expect(screen.getByText('Downtown, Test City')).toBeInTheDocument();
            expect(screen.getByText('4.5')).toBeInTheDocument();
        });
    });

    it('handles error state', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<CategoryBusinessListingPage />);

        await waitFor(() => {
            expect(screen.getByText('Error loading businesses')).toBeInTheDocument();
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    it('navigates to business details', async () => {
        global.fetch.mockResolvedValueOnce(mockResponse(mockBusinesses));

        render(<CategoryBusinessListingPage />);

        await waitFor(() => {
            fireEvent.click(screen.getAllByText(/View Details/i)[0]);
            expect(mockNavigate).toHaveBeenCalledWith('/business/customer/1');
        });
    });
    it('loads more businesses on scroll', async () => {
        global.fetch.mockResolvedValueOnce(mockResponse(mockBusinesses, false));
        global.fetch.mockResolvedValueOnce(mockResponse([], true)); // No more businesses

        render(<CategoryBusinessListingPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Business 1')).toBeInTheDocument();
            expect(screen.getByText('Test Business 2')).toBeInTheDocument();
        });

        // Simulate scroll to bottom
        act(() => {
            global.IntersectionObserver.mock.instances[0].callback([{ isIntersecting: true }]);
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(screen.queryByText('Loading more businesses')).not.toBeInTheDocument();
        });
    });

});