import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, Phone, Mail, Clock, Calendar, Plus, Edit, 
  Trash2, ChevronLeft, Check, X, Clock as HoursIcon, Image 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import Navbar from './Navbar';
import LocationSelectMap from './LocationSelectMap'; // Import the LocationSelectMap component
import './BusinessDetail.css';
import {useLocation} from 'react-router-dom';

const dayOfWeekMap = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

const BusinessDetailPage = () => {
  // const { id } = useParams();
  const location = useLocation();
  const { businessId} = location.state || {};
  const id=businessId;
  console.log(id);
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showEditHours, setShowEditHours] = useState(false);
  const [businessHours, setBusinessHours] = useState(null);
  const [hoursLoading, setHoursLoading] = useState(true);
  const token = localStorage.getItem('token');

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

  const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

const handleHoursClick = () => {
  navigate('/business/config', { 
    state: { 
      id
    } 
  });
};

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`Failed to fetch business: ${response.status}`);
        
        const data = await response.json();
        console.log('Business Data:', data);
        setBusiness(data);
      } catch (error) {
        console.error('Error fetching business:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBusinessDetails();
    else navigate('/login');
  }, [id, token, navigate]);

  // Fetch business hours for the business
  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business-hours/${id}/weekly`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch business hours');
        const data = await response.json();
        setBusinessHours(data);
      } catch (err) {
        setBusinessHours([]);
      } finally {
        setHoursLoading(false);
      }
    };
    if (token) fetchBusinessHours();
  }, [id, token]);

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
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="not-found-container">
        <h2>Business not found</h2>
        <button onClick={() => navigate('/userBusiness')}>Back to My Businesses</button>
      </div>
    );
  }

  const imageUrl = getImageUrl(business.imageData, business.imageType);
  const primaryLocation = business.locations?.find(loc => loc.isPrimary) || business.locations?.[0];

  return (
    <div className="business-detail-container">
      <Navbar />
      
      <div className="business-detail-content">
        <div className="business-header">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate('/userBusiness')}>
              <ChevronLeft size={20} /> Back to Dashboard
            </button>
            <h1>{business.businessName}</h1>
          </div>
          <div className={`status-badge ${business.approvalStatus?.toLowerCase() || 'pending'}`}>
            {business.isApproved ? <Check size={14} /> : business.approvalStatus === 'REJECTED' ? <X size={14} /> : <Clock size={14} />}
            {business.approvalStatus || 'PENDING'}
          </div>
        </div>

        <div className="business-profile">
          <div className="profile-content">
            <div className="business-image-container">
              {imageUrl ? (
                <img 
                  src={imageUrl}
                  alt={business.businessName}
                  className="business-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.className = 'image-placeholder';
                    e.target.src = '';
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <Briefcase size={60} />
                </div>
              )}
            </div>
            
            <div className="business-meta">
              <div className="meta-item">
                <Briefcase size={18} />
                <span>Category: {business.categoryName || 'Not specified'}</span>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <span>Created: {new Date(business.createdAt).toLocaleDateString()}</span>
              </div>
              {primaryLocation && (
                <div className="meta-item">
                  <MapPin size={18} />
                  <span>{primaryLocation.city}, {primaryLocation.area}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="business-tabs">
          <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
            Locations
          </button>
          <button className={`tab-button ${activeTab === 'hours' ? 'active' : ''}`} onClick={() => setActiveTab('hours')}>
            Business Hours
          </button>
          <button className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Settings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <h2>Business Overview</h2>
              <p className="business-description">{business.description}</p>
              
              {/* Map Section */}
              <div className="map-section">
                <h3>Location Map</h3>
                <LocationSelectMap locations={business.locations} />
                
              </div>
              
              <div className="info-section">
                <h3>Primary Location</h3>
                {primaryLocation ? (
                  <div className="location-card">
                    <div className="location-info">
                      <div className="info-row">
                        <MapPin size={16} />
                        <span>Address:</span>
                        <p>{primaryLocation.address}, {primaryLocation.area}, {primaryLocation.city}, {primaryLocation.postalCode}</p>
                      </div>
                      <div className="info-row">
                        <Phone size={16} />
                        <span>Phone:</span>
                        <p>{primaryLocation.contactPhone}</p>
                      </div>
                      <div className="info-row">
                        <Mail size={16} />
                        <span>Email:</span>
                        <p>{primaryLocation.contactEmail}</p>
                      </div>
                    </div>
                    <div className="location-actions">
                      <button className="edit-button">
                        <Edit size={16} /> Edit
                      </button>
                      <button 
                        className="images-button"
                        onClick={() => navigate(`/locations/${primaryLocation.locationId}/images`)}
                      >
                        <Image size={16} /> Images
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>No location information available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="locations-tab">
              <div className="section-header">
                <h2>Business Locations</h2>
                <button className="add-button" onClick={() => navigate(`/business/${business.id}/add-location`)}>
                  <Plus size={16} /> Add Location
                </button>
              </div>

              {/* Locations Map */}
              <div className="locations-map-container">
                <LocationSelectMap locations={business.locations} />
              </div>

              {business.locations?.length > 0 ? (
                <div className="locations-grid">
                  {business.locations.map((location, index) => (
                    <div key={index} className="location-card">
                      <div className="location-header">
                        <h3>Location {index + 1}</h3>
                        {location.isPrimary && <span className="primary-badge">Primary</span>}
                      </div>
                      <div className="location-info">
                        <div className="info-row">
                          <MapPin size={16} />
                          <span>Address:</span>
                          <p>{location.address}, {location.city}</p>
                        </div>
                        <div className="info-row">
                          <Phone size={16} />
                          <span>Phone:</span>
                          <p>{location.contactPhone}</p>
                        </div>
                        <div className="info-row">
                          <Mail size={16} />
                          <span>Email:</span>
                          <p>{location.contactEmail}</p>
                        </div>
                      </div>
                      <div className="location-actions">
                        <button className="edit-button">
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          className="images-button"
                          onClick={() => navigate(`/locations/${location.locationId}/images`)}
                        >
                          <Image size={16} /> Images
                        </button>
                        {/* <button
                          className="hours-button"
                          onClick={() => navigate(`/locations/${location.locationId}/hours`)}
                        >
                          <Plus size={16} /> Business Hours
                        </button> */}
                        {!location.isPrimary && (
                          <button className="delete-button">
                            <Trash2 size={16} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No locations added yet</p>
                  <button className="add-button" onClick={() => setShowAddLocation(true)}>
                    <Plus size={16} /> Add Your First Location
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="hours-tab">
              <div className="section-header">
                <h2>Business Hours</h2>
                {businessHours && businessHours.length > 0 && (
                  <button className="edit-button" onClick={() => handleHoursClick()}>
                    <Edit size={16} /> Edit Hours and Pricing
                  </button>
                )}
              </div>

              {hoursLoading ? (
                <div>Loading hours...</div>
              ) : businessHours && businessHours.length > 0 ? (
                <div className="hours-card">
                  {businessHours.map((hour, idx) => (
                    <div key={hour.dayOfWeek || idx} className="hours-row">
                      <span>{dayOfWeekMap[hour.dayOfWeek] || hour.dayOfWeek}</span>
                      <span>
                        {hour.isClosed
                          ? 'Closed'
                          : `${hour.openTime} - ${hour.closeTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No business hours configured yet.</p>
                  <button className="add-button" onClick={handleHoursClick}>
                    <Plus size={16} /> Configure Hours and Pricing
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <h2>Business Settings</h2>
              <div className="settings-card">
                <h3>Business Information</h3>
                <div className="setting-row">
                  <div>
                    <span>Business Name</span>
                    <p>{business.businessName}</p>
                  </div>
                  <button className="edit-button">
                    <Edit size={16} /> Edit
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <span>Description</span>
                    <p>{business.description}</p>
                  </div>
                  <button className="edit-button">
                    <Edit size={16} /> Edit
                  </button>
                </div>
                <div className="setting-row">
                  <div>
                    <span>Category</span>
                    <p>{business.categoryName}</p>
                  </div>
                  <button className="edit-button">
                    <Edit size={16} /> Edit
                  </button>
                </div>
              </div>

              <div className="settings-card danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-action">
                  <div>
                    <h4>Delete Business</h4>
                    <p>Permanently delete this business and all its data</p>
                  </div>
                  <button className="delete-button">
                    <Trash2 size={16} /> Delete Business
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   Briefcase, MapPin, Phone, Mail, Clock, Calendar, Plus, Edit, 
//   Trash2, ChevronLeft, Check, X, Clock as HoursIcon, Image, CreditCard 
// } from 'lucide-react';
// import { API_BASE_URL } from '../config/api';
// import Navbar from './Navbar';
// import './BusinessDetail.css';

// const dayOfWeekMap = {
//   0: 'Sunday',
//   1: 'Monday',
//   2: 'Tuesday',
//   3: 'Wednesday',
//   4: 'Thursday',
//   5: 'Friday',
//   6: 'Saturday'
// };

// const BusinessDetailPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [business, setBusiness] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [showAddLocation, setShowAddLocation] = useState(false);
//   const [showEditHours, setShowEditHours] = useState(false);
//   const [businessHours, setBusinessHours] = useState(null);
//   const [hoursLoading, setHoursLoading] = useState(true);
//   const token = localStorage.getItem('token');

//   const getImageUrl = (imageData, imageType) => {
//     if (!imageData) return null;
//     try {
//       const base64String = typeof imageData === 'string' 
//         ? imageData 
//         : arrayBufferToBase64(imageData);
//       return `data:${imageType || 'image/jpeg'};base64,${base64String}`;
//     } catch (error) {
//       console.error('Error processing image:', error);
//       return null;
//     }
//   };

//   const arrayBufferToBase64 = (buffer) => {
//     if (!buffer) return '';
//     const bytes = new Uint8Array(buffer);
//     let binary = '';
//     for (let i = 0; i < bytes.byteLength; i++) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
//   };

//   const handleHoursClick = () => {

//     navigate(`/business/config/${id}`);
//     // setShowEditHours(true); // Uncomment if you want to show edit hours modal instead`);
//   }


//   useEffect(() => {
//     const fetchBusinessDetails = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/business/${id}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (!response.ok) throw new Error(`Failed to fetch business: ${response.status}`);
        
//         const data = await response.json();
//         console.log('Business Data:', data);
//         setBusiness(data);
//       } catch (error) {
//         console.error('Error fetching business:', error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) fetchBusinessDetails();
//     else navigate('/login');
//   }, [id, token, navigate]);

//   // Fetch business hours for the business
//   useEffect(() => {
//     const fetchBusinessHours = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/business-hours/${id}/weekly`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//         if (!response.ok) throw new Error('Failed to fetch business hours');
//         const data = await response.json();
//         setBusinessHours(data);
//       } catch (err) {
//         setBusinessHours([]);
//       } finally {
//         setHoursLoading(false);
//       }
//     };
//     if (token) fetchBusinessHours();
//   }, [id, token]);

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading business details...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <h2>Error loading business</h2>
//         <p>{error}</p>
//         <button onClick={() => window.location.reload()}>Try Again</button>
//       </div>
//     );
//   }

//   if (!business) {
//     return (
//       <div className="not-found-container">
//         <h2>Business not found</h2>
//         <button onClick={() => navigate('/userBusiness')}>Back to My Businesses</button>
//       </div>
//     );
//   }

//   const imageUrl = getImageUrl(business.imageData, business.imageType);
//   const primaryLocation = business.locations?.find(loc => loc.isPrimary) || business.locations?.[0];
//   console.log('Primary Location:', primaryLocation.locationId);
//   console.log(business.locations);

//   return (
//     <div className="business-detail-container">
//       <Navbar />
      
//       <div className="business-detail-content">
//         <div className="business-header">
//           <div className="header-left">
//             <button className="back-button" onClick={() => navigate('/userBusiness')}>
//               <ChevronLeft size={20} /> Back to Dashboard
//             </button>
//             <h1>{business.businessName}</h1>
//           </div>
//           <div className={`status-badge ${business.approvalStatus?.toLowerCase() || 'pending'}`}>
//             {business.isApproved ? <Check size={14} /> : business.approvalStatus === 'REJECTED' ? <X size={14} /> : <Clock size={14} />}
//             {business.approvalStatus || 'PENDING'}
//           </div>
//         </div>

//         <div className="business-profile">
//           <div className="profile-content">
//             <div className="business-image-container">
//               {imageUrl ? (
//                 <img 
//                   src={imageUrl}
//                   alt={business.businessName}
//                   className="business-image"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.className = 'image-placeholder';
//                     e.target.src = '';
//                   }}
//                 />
//               ) : (
//                 <div className="image-placeholder">
//                   <Briefcase size={60} />
//                 </div>
//               )}
//             </div>
            
//             <div className="business-meta">
//               <div className="meta-item">
//                 <Briefcase size={18} />
//                 <span>Category: {business.categoryName || 'Not specified'}</span>
//               </div>
//               <div className="meta-item">
//                 <Calendar size={18} />
//                 <span>Created: {new Date(business.createdAt).toLocaleDateString()}</span>
//               </div>
//               {primaryLocation && (
//                 <div className="meta-item">
//                   <MapPin size={18} />
//                   <span>{primaryLocation.city}, {primaryLocation.area}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="business-tabs">
//           <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
//             Overview
//           </button>
//           <button className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
//             Locations
//           </button>
//           <button className={`tab-button ${activeTab === 'hours' ? 'active' : ''}`} onClick={() => setActiveTab('hours')}>
//             Business Hours
//           </button>
//           <button className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
//             Settings
//           </button>
//         </div>

//         <div className="tab-content">
//           {activeTab === 'overview' && (
//             <div className="overview-tab">
//               <h2>Business Overview</h2>
//               <p className="business-description">{business.description}</p>
              
//               <div className="info-section">
//                 <h3>Primary Location</h3>
//                 {primaryLocation ? (
//                   <div className="location-card">
//                     <div className="location-info">
//                       <div className="info-row">
//                         <MapPin size={16} />
//                         <span>Address:</span>
//                         <p>{primaryLocation.address}, {primaryLocation.area}, {primaryLocation.city}, {primaryLocation.postalCode}</p>
//                       </div>
//                       <div className="info-row">
//                         <Phone size={16} />
//                         <span>Phone:</span>
//                         <p>{primaryLocation.contactPhone}</p>
//                       </div>
//                       <div className="info-row">
//                         <Mail size={16} />
//                         <span>Email:</span>
//                         <p>{primaryLocation.contactEmail}</p>
//                       </div>
//                     </div>
//                     <div className="location-actions">
//                       <button className="edit-button">
//                         <Edit size={16} /> Edit
//                       </button>
//                       <button 
//                         className="images-button"
//                         onClick={() => navigate(`/locations/${primaryLocation.locationId}/images`)}
//                       >
//                         <Image size={16} /> Images
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <p>No location information available</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === 'locations' && (
//             <div className="locations-tab">
//               <div className="section-header">
//                 <h2>Business Locations</h2>
//                 <button className="add-button" onClick={() => navigate(`/business/${business.id}/add-location`)}>
//                   <Plus size={16} /> Add Location
//                 </button>
//               </div>

//               {business.locations?.length > 0 ? (
//                 <div className="locations-grid">
//                   {business.locations.map((location, index) => (
//                     <div key={index} className="location-card">
//                       <div className="location-header">
//                         <h3>Location {index + 1}</h3>
//                         {location.isPrimary && <span className="primary-badge">Primary</span>}
//                       </div>
//                       <div className="location-info">
//                         <div className="info-row">
//                           <MapPin size={16} />
//                           <span>Address:</span>
//                           <p>{location.address}, {location.city}</p>
//                         </div>
//                         <div className="info-row">
//                           <Phone size={16} />
//                           <span>Phone:</span>
//                           <p>{location.contactPhone}</p>
//                         </div>
//                         <div className="info-row">
//                           <Mail size={16} />
//                           <span>Email:</span>
//                           <p>{location.contactEmail}</p>
//                         </div>
//                       </div>
//                       <div className="location-actions">
//                         <button className="edit-button">
//                           <Edit size={16} /> Edit
//                         </button>
//                         <button 
//                           className="images-button"
//                           onClick={() => navigate(`/locations/${location.locationId}/images`)}
//                         >
//                           <Image size={16} /> Images
//                         </button>
//                         <button
//                           className="hours-button"
//                           onClick={() => navigate(`/locations/${location.locationId}/hours`)}
//                         >
//                           <Plus size={16} /> Business Hours
//                         </button>
//                         {!location.isPrimary && (
//                           <button className="delete-button">
//                             <Trash2 size={16} /> Remove
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="empty-state">
//                   <p>No locations added yet</p>
//                   <button className="add-button" onClick={() => setShowAddLocation(true)}>
//                     <Plus size={16} /> Add Your First Location
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'hours' && (
//             <div className="hours-tab">
//               <div className="section-header">
//                 <h2>Business Hours</h2>
//                 {businessHours && businessHours.length > 0 && (
//                   <button className="edit-button" onClick={handleHoursClick}>
//                     <Edit size={16} /> Edit Hours & Pricing
//                   </button>
//                 )}
//               </div>

//               {hoursLoading ? (
//                 <div>Loading hours...</div>
//               ) : businessHours && businessHours.length > 0 ? (
//                 <div className="hours-card">
//                   {businessHours.map((hour, idx) => (
//                     <div key={hour.dayOfWeek || idx} className="hours-row">
//                       <span>{dayOfWeekMap[hour.dayOfWeek] || hour.dayOfWeek}</span>
//                       <span>
//                         {hour.isClosed
//                           ? 'Closed'
//                           : `${hour.openTime} - ${hour.closeTime}`}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="empty-state">
//                   <p>No business hours configured yet.</p>
//                   <button className="add-button" onClick={handleHoursClick}>
//                     <Plus size={16} /> Configure Hours & Pricing
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'settings' && (
//             <div className="settings-tab">
//               <h2>Business Settings</h2>
              
//               <div className="settings-card">
//                 <h3>Payment Setup</h3>
//                 <p>Set up your payment account to receive money directly from customer bookings.</p>
//                 <div className="setting-row">
//                   <div>
//                     <CreditCard size={18} />
//                     <div>
//                       <span>Stripe Payment Account</span>
//                       <p>Connect your bank account to receive payments automatically</p>
//                     </div>
//                   </div>
//                   <button 
//                     className="setup-button"
//                     onClick={() => navigate(`/stripe-connect-dashboard/${business.id}`)}
//                   >
//                     <CreditCard size={16} /> Setup Payments
//                   </button>
//                 </div>
//               </div>

//               <div className="settings-card">
//                 <h3>Business Information</h3>
//                 <div className="setting-row">
//                   <div>
//                     <span>Business Name</span>
//                     <p>{business.businessName}</p>
//                   </div>
//                   <button className="edit-button">
//                     <Edit size={16} /> Edit
//                   </button>
//                 </div>
//                 <div className="setting-row">
//                   <div>
//                     <span>Description</span>
//                     <p>{business.description}</p>
//                   </div>
//                   <button className="edit-button">
//                     <Edit size={16} /> Edit
//                   </button>
//                 </div>
//                 <div className="setting-row">
//                   <div>
//                     <span>Category</span>
//                     <p>{business.categoryName}</p>
//                   </div>
//                   <button className="edit-button">
//                     <Edit size={16} /> Edit
//                   </button>
//                 </div>
//               </div>

//               <div className="settings-card danger-zone">
//                 <h3>Danger Zone</h3>
//                 <div className="danger-action">
//                   <div>
//                     <h4>Delete Business</h4>
//                     <p>Permanently delete this business and all its data</p>
//                   </div>
//                   <button className="delete-button">
//                     <Trash2 size={16} /> Delete Business
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BusinessDetailPage;