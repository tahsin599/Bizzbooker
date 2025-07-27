import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Briefcase, Upload, Image as ImageIcon, Star } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './LocationImagesPage.css';

const LocationImagesPage = () => {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const token = localStorage.getItem('token');

    // Enhanced image handling function (matches UserBusinesses)
    const getImageUrl = (imageData, imageType) => {
        if (!imageData) return null;
        
        try {
            // Handle both string (base64) and ArrayBuffer formats
            const base64String = typeof imageData === 'string' 
                ? imageData 
                : arrayBufferToBase64(imageData);
            
            return `data:${imageType || 'image/jpeg'};base64,${base64String}`;
        } catch (error) {
            console.error('Error processing image:', error);
            return null;
        }
    };

    // Convert ArrayBuffer to base64 string (matches UserBusinesses)
    const arrayBufferToBase64 = (buffer) => {
        if (!buffer) return '';
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    // Fetch images from the backend
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/locations/${locationId}/images`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                setImages(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [locationId, token]);

    // Handle file selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Upload new image
    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${API_BASE_URL}/api/locations/${locationId}/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            
            const newImage = await response.json();
            setImages([...images, newImage]);
            setSelectedFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete an image
    const handleDelete = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/locations/${locationId}/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Deletion failed');
            
            setImages(images.filter(img => img.id !== imageId));
        } catch (err) {
            setError(err.message);
        }
    };

    // Display loading state
    if (loading) {
        return (
            <div className="location-images-container">
                <div className="location-images-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading images...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className="location-images-container">
                <div className="location-images-content">
                    <div className="error-container">
                        <h2>Error</h2>
                        <p>{error}</p>
                        <button className="upload-button" onClick={() => window.location.reload()}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="location-images-container">
            <div className="location-images-content">
                <div className="location-images-header">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate(-1)}>
                            <ChevronLeft size={20} /> Back
                        </button>
                        <h1>Location Images</h1>
                    </div>
                </div>

                {/* Enhanced Image Upload Section */}
                <div className="upload-section">
                    <div className="upload-content">
                        <div className="file-input-container">
                            <input 
                                type="file" 
                                id="image-upload"
                                
                                onChange={handleFileChange} 
                                accept="image/*"
                            />
                            <label htmlFor="image-upload" className="file-input-label">
                                <Upload size={20} />
                                {selectedFile ? selectedFile.name : 'Choose an image file'}
                            </label>
                        </div>
                        <button 
                            className="upload-button"
                            onClick={handleUpload} 
                            disabled={!selectedFile || loading}
                        >
                            <Plus size={16} /> 
                            {loading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>
                </div>

                {/* Images Grid */}
                {images.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <ImageIcon size={40} />
                        </div>
                        <p>No images available for this location</p>
                    </div>
                ) : (
                    <div className="images-grid">
                        {images.map(image => {
                            const imageUrl = getImageUrl(image.imageData, image.imageType);
                            
                            return (
                                <div key={image.id} className={`image-card ${image.isPrimary ? 'primary' : ''}`}>
                                    <div className="image-container">
                                        {imageUrl ? (
                                            <img 
                                                src={imageUrl}
                                                alt={image.imageName || 'Location image'}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    const placeholder = document.createElement('div');
                                                    placeholder.className = 'image-placeholder';
                                                    placeholder.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18l-1.41-2.82A1 1 0 0 0 15.54 2H8.46a1 1 0 0 0-.87.52L6.18 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM12 18a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"/></svg>';
                                                    e.target.parentElement.appendChild(placeholder);
                                                }}
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                <Briefcase size={40} />
                                            </div>
                                        )}
                                        {image.isPrimary && (
                                            <div className="primary-badge">
                                                <Star size={14} fill="currentColor" />
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                    <div className="image-details">
                                        <p className="image-name">{image.imageName || 'Untitled Image'}</p>
                                        <div className="image-actions">
                                            {!image.isPrimary && (
                                                <button 
                                                    className="set-primary-button"
                                                    onClick={() => {/* Add set primary functionality */}}
                                                >
                                                    <Star size={16} /> Set Primary
                                                </button>
                                            )}
                                            <button 
                                                className="delete-button"
                                                onClick={() => handleDelete(image.id)}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationImagesPage;