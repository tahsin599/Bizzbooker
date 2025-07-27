import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import Navbar from './Navbar';
import { 
  Bell, ChevronDown, X, MoreHorizontal, 
  Briefcase, Calendar, ArrowRight, Loader2
} from 'lucide-react';
import './BusinessNotifications.css';

const BusinessNotifications = () => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showDropdownForNotification, setShowDropdownForNotification] = useState(null);
  const navigate = useNavigate();
  const notificationsPerPage = 10;

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

  // Fetch user profile with notifications
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/userprofile?id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure notifications exist and filter for business-related ones
        const notifications = data.notifications || [];
        const businessNotifications = notifications.filter(n => 
          n && (n.notificationType === 'Business Creation' || 
               n.notificationType === 'Appointment Booking')
        );
        
        setAllNotifications(businessNotifications);
        setDisplayedNotifications(businessNotifications.slice(0, notificationsPerPage));
      } else {
        console.error('Failed to fetch user profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Load more notifications when page changes
  useEffect(() => {
    if (page > 1) {
      const nextNotifications = allNotifications.slice(0, page * notificationsPerPage);
      setDisplayedNotifications(nextNotifications);
    }
  }, [page, allNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setAllNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setDisplayedNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      
      setAllNotifications(prev => prev.filter(n => n.id !== notificationId));
      setDisplayedNotifications(prev => prev.filter(n => n.id !== notificationId));
      setShowDropdownForNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Load more notifications
  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.notificationType === 'Business Creation') {
      navigate('/userBusiness');
    } else if (notification.notificationType === 'Appointment Booking') {
      navigate('/show-appointments');
    }
  };

  const hasMore = displayedNotifications.length < allNotifications.length;

  return (
    <div className="business-notifications-container">
      <Navbar />
      
      <div className="business-notifications-content">
        <div className="notifications-header-section">
          <h1 className="notifications-main-title">Business Notifications</h1>
          <p className="notifications-subtitle">Manage your business alerts and updates</p>
        </div>

        <div className="notifications-list-container">
          {isLoading ? (
            <div className="notifications-loading">
              <Loader2 size={24} className="loading-spinner" />
              <p>Loading notifications...</p>
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="no-notifications-message">
              <Bell size={48} className="empty-icon" />
              <h3>No business notifications yet</h3>
              <p>Your business-related notifications will appear here</p>
            </div>
          ) : (
            <>
              <div className="notifications-grid">
                {displayedNotifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`notification-card ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon-container">
                      {notification.notificationType === 'Business Creation' ? (
                        <Briefcase size={20} className="notification-icon" />
                      ) : (
                        <Calendar size={20} className="notification-icon" />
                      )}
                    </div>
                    
                    <div 
                      className="notification-content"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-header">
                        <h4 className="notification-title">{notification.message}</h4>
                        <button 
                          className="notification-more-button"
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
                            className="notification-actions-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              className="dropdown-action"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              Delete Notification
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="notification-footer">
                        <span className="notification-time">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.read && <span className="unread-indicator"></span>}
                      </div>
                    </div>
                    
                    <div className="notification-actions">
                      {notification.notificationType === 'Business Creation' && (
                        <button 
                          className="notification-action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/userBusiness');
                          }}
                        >
                          My Businesses
                        </button>
                      )}
                      
                      {notification.notificationType === 'Appointment Booking' && (
                        <button 
                          className="notification-action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/show-appointments');
                          }}
                        >
                          Check Bookings
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <button 
                  className="load-more-button"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="loading-spinner" />
                      Loading...
                    </>
                  ) : (
                    'Load More Notifications'
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessNotifications;