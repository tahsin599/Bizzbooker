import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, User, Clock as TimeIcon, Check, X,
  ChevronLeft, ChevronRight, ArrowRight, MapPin, Briefcase,
  Clock as HoursIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './BusinessService.css';
import { Modal } from 'antd';
import message from 'antd/lib/message';
import axios from 'axios';
import BusinessReviewsTab from './BusinessReviewsTab';
import LocationSelectMap from './LocationSelectMap';
// Stripe Checkout integration

const BusinessService = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [businessHours, setBusinessHours] = useState([]);
  const [slotConfig, setSlotConfig] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);
  const token = localStorage.getItem('token');
  // Remove setShowPayment, not needed for Stripe Checkout

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business/${businessId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch business');
        const data = await response.json();
        setBusiness(data);

        // Set primary location as default selected
        const primaryLoc = data.locations?.find(loc => loc.isPrimary) || data.locations?.[0];
        if (primaryLoc) {
          setSelectedLocation(primaryLoc);
          fetchBusinessHours(primaryLoc.locationId);
          fetchSlotConfig(primaryLoc.locationId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  const fetchBusinessHours = async (locationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-hours/${businessId}/weekly`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch business hours');
      const data = await response.json();
      setBusinessHours(data);
    } catch (err) {
      console.error('Error fetching business hours:', err);
    }
  };

  const fetchSlotConfig = async (locationId, dateString) => {
    try {
      const dayOfWeek = dateString ? new Date(dateString).getDay() : null;
      let url = `${API_BASE_URL}/api/slot-config/location/${locationId}`;
      if (dayOfWeek !== null) {
        url += `/${dayOfWeek}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch slot config');
      const data = await response.json();
      setSlotConfig(data);
      generateAvailableSlots(data, businessHours);
    } catch (err) {
      console.error('Error fetching slot config:', err);
    }
  };

  const generateAvailableSlots = (config, hours) => {
    if (!config || !hours) return;

    const slots = {};
    const today = new Date();
    // Find the previous Sunday (start of week)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    // Saturday (end of week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // If today is after Sunday, only show from today to Saturday
    const startDay = today > startOfWeek ? today : startOfWeek;

    for (
      let date = new Date(startDay);
      date <= endOfWeek;
      date.setDate(date.getDate() + 1)
    ) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayOfWeek = date.getDay();

      const dayHours = hours.find(h => h.dayOfWeek === dayOfWeek);

      if (dayHours && !dayHours.isClosed) {
        // Use local time for slot generation
        const [year, month, dayNum] = dateString.split('-').map(Number);
        const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);

        const startTime = new Date(year, month - 1, dayNum, openHour, openMinute);
        const endTime = new Date(year, month - 1, dayNum, closeHour, closeMinute);

        let currentTime = new Date(startTime);
        const slotIntervals = [];

        while (currentTime < endTime) {
          const slotEndTime = new Date(currentTime.getTime() + config.slotDuration * 60000);

          if (slotEndTime > endTime) break;

          // Find the matching interval from slotConfig
          const interval = config.intervals.find(int => {
            const [intHour, intMinute] = int.startTime.split(':').map(Number);
            return intHour === currentTime.getHours() && intMinute === currentTime.getMinutes();
          });

          const availableSlots = interval ? (interval.maxSlots - interval.usedSlots) : 0;
          const status = availableSlots > 0 ? 'vacant' : 'booked';

          // Get price from interval or fallback to slot config price
          const slotPrice = interval?.price || config.slotPrice || 0;

          slotIntervals.push({
            start: currentTime.toTimeString().substring(0, 5),
            end: slotEndTime.toTimeString().substring(0, 5),
            status,
            customer: null,
            availableSlots,
            price: slotPrice,
            intervalData: interval
          });

          currentTime = new Date(slotEndTime);
        }

        if (slotIntervals.length > 0) {
          slots[dateString] = slotIntervals;
        }
      }
    }

    setAvailableSlots(slots);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSelectedDate(null);
    setSelectedTime(null);
    fetchBusinessHours(location.locationId);
    fetchSlotConfig(location.locationId);
    setExpandedLocation(null);
  };

  const toggleLocationExpand = (locationId) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId);
  };

  // Helper function to get image URL
  const getImageUrl = (imageData, imageType) => {
    if (!imageData) return null;
    try {
      const base64String = typeof imageData === 'string'
        ? imageData
        : arrayBufferToBase64(imageData);
      return `data:${imageType || 'image/jpeg'};base64,${base64String}`;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days for current selected month/year
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      // Use local date string, not UTC
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayOfWeek = date.getDay();
      const dayHours = businessHours.find(h => h.dayOfWeek === dayOfWeek);
      const isClosed = dayHours?.isClosed || false;
      const hasSlots = !isClosed && availableSlots[dateString]?.length > 0;
      const vacantSlots = hasSlots ?
        availableSlots[dateString].filter(slot => slot.status === 'vacant').length : 0;

      days.push({
        day,
        date: dateString,
        hasSlots,
        vacantSlots,
        isClosed
      });
    }

    return days;
  };

 const handleDateClick = (dateInfo) => {
  if (dateInfo && !dateInfo.isClosed && dateInfo.hasSlots) {
    setSelectedDate(dateInfo.date);
    setSelectedTime(null);
    
    // Calculate day of week (0=Sunday, 1=Monday, etc.)
    const date = new Date(dateInfo.date);
    const dayOfWeek = date.getDay(); // Returns 0-6
    
    // Fetch slot config for this specific location and day
    fetchSlotConfig(selectedLocation.locationId, dateInfo.date);
    
    // Optional: Log for debugging
    console.log(`Selected date: ${dateInfo.date}, Day of week: ${dayOfWeek}`);
  }
};

  const handleTimeClick = (timeSlot) => {
    if (timeSlot.status === 'vacant' && timeSlot.availableSlots > 0) {
      setSelectedTime(timeSlot.start);
    }
  };

  const handleBookAppointment = async () => {
    if (selectedDate && selectedTime && selectedLocation) {
      const selectedSlot = availableSlots[selectedDate]?.find(
        slot => slot.start === selectedTime
      );
      if (selectedSlot && selectedSlot.status === 'vacant' && selectedSlot.availableSlots > 0) {
        try {
          // Step 1: Create pending appointment first
          const appointmentData = {
            customerId: localStorage.getItem('userId'),
            businessId,
            locationId: selectedLocation.locationId,
            startTime: `${selectedDate}T${selectedTime}:00`,
            endTime: `${selectedDate}T${selectedSlot.end}:00`,
            configId: selectedSlot.intervalData.configId,
            userSelectedCount: selectedSlot.selectedCount || 1,
            slotPrice: selectedSlot.price * selectedSlot.selectedCount || 0,
            notes: ""
          };

          console.log('Creating pending appointment:', appointmentData);

          const appointmentResponse = await fetch(`${API_BASE_URL}/api/appointments/pending`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
          });

          if (!appointmentResponse.ok) {
            const errorData = await appointmentResponse.json();
            throw new Error(errorData.error || 'Failed to create appointment');
          }

          const createdAppointment = await appointmentResponse.json();
          console.log('Pending appointment created:', createdAppointment);

          // Store appointment ID for later use (backend returns appointmentId, not id)
          const appointmentId = createdAppointment.appointmentId || createdAppointment.id;
          localStorage.setItem('pendingAppointmentId', appointmentId);
          sessionStorage.setItem('pendingAppointmentId', appointmentId);
          localStorage.setItem('pendingAppointmentData', JSON.stringify(appointmentData));
          sessionStorage.setItem('pendingAppointmentData', JSON.stringify(appointmentData));

          // Step 2: Create Stripe checkout session
          const res = await fetch(`${API_BASE_URL}/api/payments/create-checkout-session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              price: selectedSlot.price || 0,
              quantity: selectedSlot.selectedCount || 1,
              businessId,
              locationId: selectedLocation.locationId,
              startTime: `${selectedDate}T${selectedTime}:00`,
              endTime: `${selectedDate}T${selectedSlot.end}:00`,
              configId: selectedSlot.intervalData.configId,
              customerId: localStorage.getItem('userId'),
              appointmentId: appointmentId  // Pass the appointment ID to link the payment
            })
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to create checkout session:', errorText);
            throw new Error(`Failed to create checkout session: ${errorText}`);
          }

          const stripeData = await res.json();
          console.log('Stripe checkout session response:', stripeData);

          if (stripeData.error) {
            throw new Error(`Stripe error: ${stripeData.error}`);
          }

          if (stripeData.url && stripeData.sessionId) {
            // Store the session ID as payment reference
            localStorage.setItem('stripeSessionId', stripeData.sessionId);
            sessionStorage.setItem('stripeSessionId', stripeData.sessionId);

            // Redirect to Stripe Checkout
            window.location.href = stripeData.url;
          } else {
            console.error('Invalid stripe response:', stripeData);
            throw new Error('Failed to create Stripe checkout session - missing URL or session ID');
          }
        } catch (err) {
          console.error('Booking error:', err);
          alert('Failed to book appointment: ' + err.message);
        }
      }
    }
  };

  // Remove handlePaymentSuccess, not needed for Stripe Checkout

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading business details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading business</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="not-found-container">
        <h2>Business not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const imageUrl = getImageUrl(business.imageData, business.imageType);

  return (
    <div className="business-service-container">
      {/* Success Booking Modal */}
      <Modal
        title="Booking Confirmation"
        open={bookingSuccess}
        onOk={() => {
          setBookingSuccess(false);
          setSelectedDate(null);
          setSelectedTime(null);
        }}
        onCancel={() => setBookingSuccess(false)}
        footer={[
          <button
            key="ok"
            className="modal-ok-btn"
            onClick={() => {
              setBookingSuccess(false);
              setSelectedDate(null);
              setSelectedTime(null);
            }}
          >
            OK
          </button>
        ]}
      >
        {bookingData && (
          <div className="booking-summary">
            <h3>Your booking is confirmed!</h3>
            <div className="summary-detail">
              <strong>Business:</strong> {bookingData.businessName}
            </div>
            <div className="summary-detail">
              <strong>Location:</strong> {bookingData.location}
            </div>
            <div className="summary-detail">
              <strong>Date:</strong> {bookingData.date}
            </div>
            <div className="summary-detail">
              <strong>Time:</strong> {bookingData.time}
            </div>
            <div className="summary-detail">
              <strong>Slots Booked:</strong> {bookingData.slotsBooked}
            </div>
            <div className="summary-detail">
              <strong>Price per Slot:</strong> ${bookingData.pricePerSlot?.toFixed(2) || '0.00'}
            </div>
            <div className="summary-detail total-price">
              <strong>Total Amount:</strong> ${bookingData.totalPrice?.toFixed(2) || '0.00'}
            </div>
            <div className="summary-detail">
              <strong>Reference ID:</strong> {bookingData.referenceId}
            </div>
            <p className="confirmation-message">
              You will receive a confirmation email shortly.
            </p>
          </div>
        )}
      </Modal>

      {/* Header Section */}
      <div className="service-header">
        <div className="service-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt={business.businessName} className="service-image" />
          ) : (
            <div className="image-placeholder">
              <Briefcase size={60} />
            </div>
          )}
          <div className="service-overlay">
            <h1 className="service-title">{business.businessName}</h1>
            <div className="service-category-badge">{business.categoryName}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="business-tabs">
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Locations
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {/* Main Content */}
      <div className="service-content">
        {activeTab === 'services' ? (
          /* Services Tab */
          <div className="service-details-section">
            <div className="service-info-card">
              <div className="service-description">
                <h3>About This Business</h3>
                <p>{business.description}</p>
              </div>

              {/* Location Selection */}
              <div className="location-selection">
                <h3>Select Location</h3>
                <div className="location-options">
                  {business.locations?.map(location => (
                    <div
                      key={location.locationId}
                      className={`location-option ${selectedLocation?.locationId === location.locationId ? 'selected' : ''}`}
                    >
                      <div
                        className="location-summary"
                        onClick={() => toggleLocationExpand(location.locationId)}
                      >
                        <MapPin size={16} />
                        <span>{location.address}, {location.city}</span>
                        {expandedLocation === location.locationId ? (
                          <ChevronUp size={16} className="expand-icon" />
                        ) : (
                          <ChevronDown size={16} className="expand-icon" />
                        )}
                      </div>

                      {expandedLocation === location.locationId && (
                        <div className="location-details">
                          <div className="detail-row">
                            <span>Address:</span>
                            <p>{location.address}, {location.area}, {location.city}</p>
                          </div>
                          <div className="detail-row">
                            <span>Postal Code:</span>
                            <p>{location.postalCode}</p>
                          </div>
                          <div className="detail-row">
                            <span>Phone:</span>
                            <p>{location.contactPhone}</p>
                          </div>
                          <button
                            className="select-location-btn"
                            onClick={() => handleLocationSelect(location)}
                          >
                            Select This Location
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Section - Only shown when location is selected */}
              {selectedLocation && (
                <div className="booking-card">
                  <h3>Book Your Appointment at {selectedLocation.address}</h3>

                  {/* Calendar */}
                  <div className="calendar-container">
                    <div className="calendar-header">
                      <h4>Select Date</h4>
                      <div className="calendar-navigation">
                        <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                          <ChevronLeft size={20} />
                        </button>
                        <div className="month-year-selector">
                          <span className="month-name">{monthNames[currentMonth]}</span>
                          <span className="year">{currentYear}</span>
                        </div>
                        <button className="nav-btn" onClick={() => navigateMonth('next')}>
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="calendar-grid">
                      <div className="calendar-days-header">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="day-header">{day}</div>
                        ))}
                      </div>

                      <div className="calendar-days">
                        {generateCalendarDays().map((dayInfo, index) => (
                          <div
                            key={index}
                            className={`calendar-day ${!dayInfo ? 'empty' : ''} ${dayInfo?.isClosed ? 'closed' : ''} ${dayInfo?.hasSlots ? 'available' : 'no-slots'} ${selectedDate === dayInfo?.date ? 'selected' : ''}`}
                            onClick={() => handleDateClick(dayInfo)}
                          >
                            {dayInfo?.day}
                            {dayInfo?.isClosed ? (
                              <div className="day-status closed">Closed</div>
                            ) : dayInfo?.hasSlots ? (
                              <div className="availability-indicator">
                                <div className="availability-dot"></div>
                                <span className="vacant-count">{dayInfo.vacantSlots}</span>
                              </div>
                            ) : (
                              <div className="day-status no-slots">No slots</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}

                  {selectedDate && (
                    <div className="time-slots-container">
                      <h4>Schedule for {selectedDate}</h4>
                      <div className="time-slots-detailed">
                        {availableSlots[selectedDate] ? (
                          availableSlots[selectedDate].map((timeSlot, index) => {
                            const isAvailable = timeSlot.status === 'vacant' && timeSlot.availableSlots > 0;
                            const isFullyBooked = timeSlot.availableSlots <= 0;

                            return (
                              <div
                                key={index}
                                className={`time-slot-detailed ${timeSlot.status} ${isFullyBooked ? 'fully-booked' : ''} ${selectedTime === timeSlot.start ? 'selected' : ''}`}
                                onClick={() => isAvailable && handleTimeClick(timeSlot)}
                              >
                                <div className="time-slot-header">
                                  <div className="time-slot-time">{timeSlot.start} - {timeSlot.end}</div>
                                  <div className="time-slot-price">${(timeSlot.price || 0).toFixed(2)}</div>
                                </div>
                                <div className="time-slot-status">
                                  <span className={`status-badge ${isAvailable ? 'vacant' : 'booked'}`}>
                                    {isAvailable ? (
                                      <>
                                        <Check size={14} /> Available
                                      </>
                                    ) : (
                                      <>
                                        <X size={14} /> {isFullyBooked ? 'Fully Booked' : 'Booked'}
                                      </>
                                    )}
                                  </span>
                                  <span className={`available-count ${isFullyBooked ? 'fully-booked' : ''}`}>
                                    {timeSlot.availableSlots} slots available
                                  </span>
                                  {timeSlot.customer && (
                                    <span className="customer-name">by {timeSlot.customer}</span>
                                  )}
                                </div>
                                {/* If vacant, allow user to select how many slots to book */}
                                {isAvailable && (
                                  <div className="slot-booking-options">
                                    <label>
                                      Slots to book:&nbsp;
                                      <input
                                        type="number"
                                        min={1}
                                        max={timeSlot.availableSlots}
                                        value={selectedTime === timeSlot.start ? (timeSlot.selectedCount || 1) : 1}
                                        onClick={e => e.stopPropagation()}
                                        onChange={e => {
                                          e.stopPropagation();
                                          const newCount = Math.min(
                                            Math.max(1, parseInt(e.target.value) || 1),
                                            timeSlot.availableSlots
                                          );

                                          // Update the selected count in availableSlots
                                          setAvailableSlots(prev => ({
                                            ...prev,
                                            [selectedDate]: prev[selectedDate].map((slot, idx) =>
                                              idx === index ? { ...slot, selectedCount: newCount } : slot
                                            )
                                          }));
                                        }}
                                        style={{ width: 50 }}
                                      />
                                    </label>
                                    <button
                                      className="schedule-btn"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setSelectedTime(timeSlot.start);
                                      }}
                                    >
                                      Select
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="no-slots-message">
                            <div className="no-slots-icon">📅</div>
                            <h4>No appointments available</h4>
                            <p>This date has no available time slots. Please select another date.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  {selectedDate && selectedTime && (
                    <div className="booking-confirmation">
                      <div className="selected-appointment">
                        <p><strong>Selected:</strong> {selectedDate} at {selectedTime}</p>
                        <p><strong>Location:</strong> {selectedLocation.address}, {selectedLocation.city}</p>
                        <p><strong>Slots:</strong> {
                          availableSlots[selectedDate]?.find(slot => slot.start === selectedTime)?.selectedCount || 1
                        }</p>
                        <p><strong>Price per Slot:</strong> ${
                          (availableSlots[selectedDate]?.find(slot => slot.start === selectedTime)?.price || 0).toFixed(2)
                        }</p>
                        <p className="total-price"><strong>Total:</strong> ${
                          ((availableSlots[selectedDate]?.find(slot => slot.start === selectedTime)?.price || 0) *
                            (availableSlots[selectedDate]?.find(slot => slot.start === selectedTime)?.selectedCount || 1)).toFixed(2)
                        }</p>
                      </div>
                      <button className="book-appointment-btn" onClick={handleBookAppointment}>
                        Book Appointment <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Stripe Payment Modal */}
                  {/* Stripe Checkout handles payment UI, no modal needed here */}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'locations' ? (
          /* Locations Tab */
          <div className="locations-section">
            <h3>Our Locations</h3>

            {/* Add the map component here */}
            <div className="locations-map-container">
              <LocationSelectMap locations={business.locations} />
            </div>

            <div className="locations-grid">
              {business.locations?.map((location, index) => (
                <div key={index} className="location-card">
                  <div className="location-header">
                    <h4>
                      <MapPin size={16} /> Location {index + 1}
                      {location.isPrimary && <span className="primary-badge">Primary</span>}
                    </h4>
                  </div>
                  <div className="location-info">
                    <div className="info-row">
                      <span>Address:</span>
                      <p>{location.address}, {location.area}, {location.city}</p>
                    </div>
                    <div className="info-row">
                      <span>Postal Code:</span>
                      <p>{location.postalCode}</p>
                    </div>
                    <div className="info-row">
                      <span>Contact:</span>
                      <p>{location.contactPhone}</p>
                    </div>
                    <div className="info-row">
                      <span>Email:</span>
                      <p>{location.contactEmail}</p>
                    </div>
                  </div>
                  <button
                    className="view-schedule-btn"
                    onClick={() => {
                      setActiveTab('services');
                      handleLocationSelect(location);
                    }}
                  >
                    <HoursIcon size={16} /> View Schedule
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Reviews Tab */
          <div className="reviews-section">
            <BusinessReviewsTab businessId={businessId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessService;