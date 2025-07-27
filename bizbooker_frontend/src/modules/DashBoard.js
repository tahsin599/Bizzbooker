import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './DashBoard.css';
import Navbar from './Navbar';
import ScheduleList from './List';
import { 
  Calendar, Users, Home, MessageSquare, CreditCard, 
  Settings, Plus, FileText, User, Shield, Search, ArrowRight,
  Briefcase, Dumbbell, HeartPulse, Utensils, GraduationCap, ArrowLeft
} from 'lucide-react';
import { Modal } from 'antd';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayBookings: 0,
    monthlyBookings: 0,
    totalBookings: 0,
    pendingRequests: 0
  });
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();

  // Service types configuration
  const serviceTypes = [
    { name: 'Professional Services', icon: <Briefcase size={20} />, color: '#4895ef' },
    { name: 'Fitness', icon: <Dumbbell size={20} />, color: '#3b56d4' },
    { name: 'HealthCare', icon: <HeartPulse size={20} />, color: '#4361ee' },
    { name: 'Restaurant & Food', icon: <Utensils size={20} />, color: '#4895ef' },
    { name: 'Education', icon: <GraduationCap size={20} />, color: '#3a0ca3' }
  ];

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/user/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch today's appointments
  const fetchTodaysAppointments = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/user/${userId}/appointments/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const appointments = await response.json();
        const transformedAppointments = appointments.map(apt => {
          // Parse the dates properly
          const startTime = apt.startTime ? new Date(apt.startTime) : null;
          
          return {
            id: apt.id,
            appointmentTitle: apt.appointmentTitle || 'Appointment',
            // Format time for display in list
            time: startTime ? startTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : 'N/A',
            // Format date for display in list
            date: startTime ? startTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            }) : 'N/A',
            // Keep the formatted strings for modal
            formattedFullDate: apt.formattedFullDate || (startTime ? startTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'),
            formattedTime: apt.formattedTime || (startTime ? startTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : 'N/A'),
            status: apt.status || 'Pending',
            businessName: apt.businessName || 'N/A',
            serviceName: apt.serviceName || 'N/A',
            locationAddress: apt.locationAddress || 'N/A'
          };
        });
        setTodaysAppointments(transformedAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/businesses/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Combine service types with actual category IDs
  const getServices = () => {
    const defaultServices = [
      { name: 'Profile', icon: <User size={20} />, color: '#4361ee', path: '/profile' },
      { name: 'Bookings', icon: <Calendar size={20} />, color: '#4361ee', path: '/bookings' },
      { name: 'Payment', icon: <CreditCard size={20} />, color: '#3b56d4', path: '/payment' },
      { name: 'Settings', icon: <Settings size={20} />, color: '#4895ef', path: '/settings' }
    ];

    const categoryServices = serviceTypes.map(service => {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(service.name.toLowerCase()) ||
        service.name.toLowerCase().includes(cat.name.toLowerCase())
      );
      
      return {
        ...service,
        categoryId: category?.id,
        path: category ? undefined : '/explore'
      };
    });

    return [...categoryServices, ...defaultServices];
  };

  // Handle service click
  const handleServiceClick = (service) => {
    if (service.path) {
      navigate(service.path);
    } else if (service.categoryId) {
      navigate(`/business/category/${service.categoryId}`);
    } else {
      navigate('/business');
    }
  };

  const handleCreateBusiness = () => {
    navigate('/create-business');
  };

  const handleMyBusinesses = () => {
    navigate('/userBusiness');
  };

  // Verify authentication and fetch data
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
          fetchCategories();
          fetchDashboardStats();
          fetchTodaysAppointments();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [navigate, fetchCategories, fetchDashboardStats, fetchTodaysAppointments]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1>Welcome back! <span className="wave">👋</span></h1>
                <p>Ready to manage your bookings and schedule today?</p>
              </div>
              <div className="welcome-stats">
                <div className="stat-item">
                  <div className="stat-number">
                    {statsLoading ? '...' : dashboardStats.todayBookings}
                  </div>
                  <div className="stat-label">Today's Bookings</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {statsLoading ? '...' : dashboardStats.monthlyBookings}
                  </div>
                  <div className="stat-label">This Month</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {statsLoading ? '...' : dashboardStats.pendingRequests}
                  </div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search bookings, services, or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#4361ee'}}>
                <Plus size={24} />
              </div>
              <span>New Booking</span>
            </div>
            <div className="quick-action-card" onClick={handleCreateBusiness}>
              <div className="action-icon" style={{backgroundColor: '#8b5cf6'}}>
                <Home size={24} />
              </div>
              <span>Create Business</span>
            </div>
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#10b981'}}>
                <Users size={24} />
              </div>
              <span>Manage Clients</span>
            </div>
            <div className="quick-action-card" onClick={handleMyBusinesses}>
              <div className="action-icon" style={{backgroundColor: '#f59e0b'}}>
                <FileText size={24} />
              </div>
              <span>My Businesses</span>
            </div>
            <div className="quick-action-card">
              <div className="action-icon" style={{backgroundColor: '#ef4444'}}>
                <Settings size={24} />
              </div>
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-section">
          <h3>Popular Services</h3>
          {servicesLoading ? (
            <div className="services-loading">
              <div className="loading-spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : (
            <div className="services-grid">
              {getServices().map((service, index) => (
                <div 
                  key={index} 
                  className="service-card"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="service-icon" style={{backgroundColor: service.color}}>
                    {service.icon}
                  </div>
                  <span className="service-name">{service.name}</span>
                  {service.categoryId && (
                    <span className="service-badge">Category</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="schedule-section">
          <div className="section-header">
            <h3>Today's Appointments</h3>
            <button className="view-all-btn" onClick={() => navigate('/bookings')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          {/* Update the ScheduleList component usage */}
          {appointmentsLoading ? (
            <div className="loading-schedule">
              <div className="loading-spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : todaysAppointments.length > 0 ? (
            <ScheduleList 
              schedules={todaysAppointments}
              onViewDetails={(appointment) => {
                setSelectedAppointment(appointment);
                setShowAppointmentModal(true);
              }}
            />
          ) : (
            <div className="no-appointments">
              <p>No appointments scheduled for today</p>
              <button 
                className="book-now-btn"
                onClick={() => navigate('/business')}
              >
                <Plus size={16} /> Book Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal
        title="Appointment Details"
        visible={showAppointmentModal}
        onOk={() => setShowAppointmentModal(false)}
        onCancel={() => setShowAppointmentModal(false)}
        footer={[
          <button 
            key="ok" 
            className="modal-ok-btn"
            onClick={() => setShowAppointmentModal(false)}
          >
            OK
          </button>
        ]}
      >
        {selectedAppointment && (
          <div className="booking-summary">
            <h3>{selectedAppointment.appointmentTitle || 'Appointment Details'}</h3>
            <div className="summary-detail">
              <strong>Business:</strong> {selectedAppointment.businessName || 'N/A'}
            </div>
            <div className="summary-detail">
              <strong>Service:</strong> {selectedAppointment.serviceName || 'N/A'}
            </div>
            <div className="summary-detail">
              <strong>Location:</strong> {selectedAppointment.locationAddress || 'N/A'}
            </div>
            <div className="summary-detail">
              <strong>Date:</strong> {selectedAppointment.formattedFullDate || 'N/A'}
            </div>
            <div className="summary-detail">
              <strong>Time:</strong> {selectedAppointment.formattedTime || 'N/A'}
            </div>
            <div className="summary-detail">
              <strong>Status:</strong> 
              <span className={`status-badge ${(selectedAppointment.status || 'pending').toLowerCase()}`}>
                {selectedAppointment.status || 'Pending'}
              </span>
            </div>
            <div className="summary-detail">
              <strong>Reference ID:</strong> {selectedAppointment.id || 'N/A'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;