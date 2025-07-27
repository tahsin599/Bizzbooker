import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Bell, ChevronDown, Search, X, LogOut, User, Settings, MoreHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './Navbar.css';
import '../styles/variables.css';
import SearchResults from './SearchResults';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [showDropdownForNotification, setShowDropdownForNotification] = useState(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Format time display
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now - date) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Sort notifications: unread first, then by newest
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      // Unread notifications first
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      
      // Then sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notifications]);

  // Fetch user profile and notifications (using your original endpoint)
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/userprofile?id=${localStorage.getItem('userId')}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.userProfile);
          
          // Set notifications from the userprofile response
          const notifs = data.notifications || [];
          setNotifications(notifs);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(fetchData, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowDropdownForNotification(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) setShowSearchResults(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.trim().length > 0);
  };

  const closeSearchResults = () => setShowSearchResults(false);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setIsMarkingRead(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/mark-all-read?userId=${localStorage.getItem('userId')}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setShowDropdownForNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserProfile(null);
    setShowProfileMenu(false);
    navigate('/');
  };

  const isAuthenticated = !!userProfile;

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Calendar size={20} />
          </div>
          <span className="logo-text">BizzBooker</span>
        </Link>

        {/* Navigation Links */}
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/show-appointments" className="nav-link">Bookings</Link>
              <Link to="/business/customer" className="nav-link">Services</Link>
              <Link to="/chatbot" className="nav-link">Chatbot</Link>
              
            </>
          ) : (
            <>
              <Link to="/Login" className="nav-link">Services</Link>
              <Link to="/providers" className="nav-link">For Businesses</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </>
          )}

          {/* Search Bar */}
          <div className="search-container" ref={searchRef}>
            <form className="search-bar" onSubmit={handleSearch}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </form>
            {showSearchResults && (
              <SearchResults query={searchQuery} onClose={closeSearchResults} />
            )}
          </div>
        </nav>

        {/* Right Side */}
        <div className="navbar-actions">
          {isLoading ? (
            <div className="loading-spinner small"></div>
          ) : isAuthenticated ? (
            <>
              {/* Notifications Dropdown */}
              <div className="notification-container" ref={notificationsRef}>
                <button 
                  className={`notification-icon icon-button ${showNotifications ? 'active' : ''}`}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                <div className={`notifications-dropdown ${showNotifications ? 'show' : ''}`}>
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    <div className="notification-actions">
                      <button 
                        className="refresh-notifications"
                        onClick={fetchData}
                        title="Refresh notifications"
                      >
                        ↻
                      </button>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read"
                          onClick={markAllAsRead}
                          disabled={isMarkingRead}
                        >
                          {isMarkingRead ? 'Marking...' : 'Mark all as read'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="notifications-list">
                    {sortedNotifications.length > 0 ? (
                      sortedNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id);
                            setShowNotifications(false);
                            if (notification.link) navigate(notification.link);
                          }}
                        >
                          <div className="notification-content">
                            <div className="notification-header">
                              <span className="notification-type">{notification.notificationType}</span>
                              <span className="related-entity-type">{notification.relatedEntityType}</span>
                              <button 
                                className="notification-more"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDropdownForNotification(
                                    showDropdownForNotification === notification.id ? null : notification.id
                                  );
                                }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              {showDropdownForNotification === notification.id && (
                                <div 
                                  className="notification-dropdown-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button onClick={() => deleteNotification(notification.id)}>
                                    Delete Notification
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="notification-message">{notification.message}</p>
                            <p className={`notification-time ${!notification.read ? 'unread-time' : ''}`}>
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && <div className="unread-dot"></div>}
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        No notifications yet
                      </div>
                    )}
                  </div>

                  <div className="notifications-footer">
                    <Link to="/notifications" onClick={() => setShowNotifications(false)}>
                      View All Notifications
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* User Profile Dropdown */}
              <div className="user-profile-container" ref={profileRef}>
                <div 
                  className="user-profile" 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {userProfile?.imageData ? (
                    <img 
                      src={`data:image/jpeg;base64,${userProfile.imageData}`}
                      alt="User Avatar" 
                      className="navbar-avatar"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                  <ChevronDown size={16} className={`dropdown-arrow ${showProfileMenu ? 'open' : ''}`} />
                </div>

                {showProfileMenu && (
                  <div className="profile-menu">
                    <div className="profile-menu-header">
                      <h4>{userProfile?.name || 'User'}</h4>
                      {userProfile?.bio && <p className="profile-bio">{userProfile.bio}</p>}
                    </div>
                    <Link 
                      to="/profile" 
                      className="profile-menu-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/settings" 
                      className="profile-menu-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <div 
                      className="profile-menu-item logout" 
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-button secondary">Log In</Link>
              <Link to="/signup" className="nav-button primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;