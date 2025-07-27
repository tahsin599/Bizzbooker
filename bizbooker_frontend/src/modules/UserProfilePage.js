import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { User, Edit, Save, X, ArrowLeft } from 'lucide-react';
import './UserProfileStyles.css';

const UserProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    imageData: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      try {
        const response = await fetch(`${API_BASE_URL}/api/userprofile?id=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setProfile(data.userProfile);
        setTempProfile(data.userProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempProfile(profile);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
      const response = await fetch(`${API_BASE_URL}/api/userprofile/update?id=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tempProfile)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div className="profile-loading-screen">Loading profile...</div>;
  }

  return (
    <div className="profile-root-container">
      <div className="profile-back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back to Dashboard
      </div>

      <div className="profile-card-wrapper">
        <div className="profile-header-section">
          <div className="profile-avatar-container">
            {profile.imageData ? (
              <img 
                src={`data:image/jpeg;base64,${profile.imageData}`} 
                alt="Profile" 
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <User size={48} />
              </div>
            )}
          </div>

          {!isEditing ? (
            <button 
              className="profile-edit-button"
              onClick={handleEdit}
            >
              <Edit size={16} /> Edit Profile
            </button>
          ) : (
            <div className="profile-action-buttons">
              <button 
                className="profile-save-button"
                onClick={handleSave}
              >
                <Save size={16} /> Save
              </button>
              <button 
                className="profile-cancel-button"
                onClick={handleCancel}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-details-section">
          {!isEditing ? (
            <>
              <h2 className="profile-display-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
              <p className="profile-bio">{profile.bio || 'No bio provided'}</p>
            </>
          ) : (
            <>
              <input
                type="text"
                name="name"
                value={tempProfile.name}
                onChange={handleChange}
                className="profile-edit-input"
                placeholder="Full Name"
              />
              <input
                type="email"
                name="email"
                value={tempProfile.email}
                onChange={handleChange}
                className="profile-edit-input"
                placeholder="Email"
                disabled // Email often shouldn't be editable
              />
              <textarea
                name="bio"
                value={tempProfile.bio}
                onChange={handleChange}
                className="profile-edit-textarea"
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;