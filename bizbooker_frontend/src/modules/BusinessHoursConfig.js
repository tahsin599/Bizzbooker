// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { Clock, Calendar, Check, X, Plus, Trash2 } from 'lucide-react';
// import { API_BASE_URL } from '../config/api';
// import './BusinessHoursConfig.css';

// const daysOfWeek = [
//   { id: 0, name: 'Sunday' },
//   { id: 1, name: 'Monday' },
//   { id: 2, name: 'Tuesday' },
//   { id: 3, name: 'Wednesday' },
//   { id: 4, name: 'Thursday' },
//   { id: 5, name: 'Friday' },
//   { id: 6, name: 'Saturday' }
// ];

// const BusinessHoursConfig = () => {
//   const token = localStorage.getItem('token');
//   //const { businessId } = useParams();
//   businessId = 1; // Hardcoded for testing, replace with useParams() in production
//   const [isOpen, setIsOpen] = useState(true);
//   const [config, setConfig] = useState({
//     regularHours: daysOfWeek.map(day => ({
//       dayOfWeek: day.id,
//       openTime: '09:00',
//       closeTime: '17:00',
//       isClosed: false
//     })),
//     slotConfig: {
//       slotDuration: 30,
//       maxSlotsPerInterval: 1,
//       bufferTime: 0,
//       isRecurring: true,
//       startTime: '09:00',
//       endTime: '17:00'
//     },
//     specialHours: []
//   });

//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('regular');
//   const [previewDate, setPreviewDate] = useState(new Date());
//   const [generatedSlots, setGeneratedSlots] = useState([]);

//   useEffect(() => {
//     if (isOpen && businessId) {
//       fetchConfig();
//     }
//     document.body.style.overflow = isOpen ? 'hidden' : 'unset';
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, businessId]);

//   const fetchConfig = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/business-hours/${businessId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       if (!response.ok) throw new Error('Failed to fetch config');
//       const data = await response.json();
//       setConfig({
//         ...data,
//         slotConfig: {
//           slotDuration: 30,
//           maxSlotsPerInterval: 1,
//           bufferTime: 0,
//           isRecurring: true,
//           startTime: '09:00',
//           endTime: '17:00',
//           ...data.slotConfig
//         }
//       });
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching config:', error);
//       setLoading(false);
//     }
//   };

//   const saveConfig = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/business-hours`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           businessId,
//           ...config
//         })
//       });
      
//       if (!response.ok) throw new Error('Failed to save config');
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Error saving config:', error);
//       alert('Failed to save configuration. Please try again.');
//     }
//   };

//   const generatePreview = async () => {
//     try {
//       const dateStr = previewDate.toISOString().split('T')[0];
//       const response = await fetch(
//         `${API_BASE_URL}/api/business-hours/generate-slots/${businessId}?date=${dateStr}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       if (!response.ok) throw new Error('Failed to generate slots');
//       const slots = await response.json();
//       setGeneratedSlots(slots);
//     } catch (error) {
//       console.error('Error generating slots:', error);
//       alert('Failed to generate slots. Please check your configuration.');
//     }
//   };

//   const handleTimeChange = (dayIndex, field, value) => {
//     const updatedHours = [...config.regularHours];
//     updatedHours[dayIndex][field] = value;
//     setConfig({ ...config, regularHours: updatedHours });
//   };

//   const toggleDayClosed = (dayIndex) => {
//     const updatedHours = [...config.regularHours];
//     updatedHours[dayIndex].isClosed = !updatedHours[dayIndex].isClosed;
//     setConfig({ ...config, regularHours: updatedHours });
//   };

//   const handleSlotConfigChange = (field, value) => {
//     setConfig({
//       ...config,
//       slotConfig: {
//         ...config.slotConfig,
//         [field]: value
//       }
//     });
//   };

//   const handleSpecialHoursChange = (index, field, value) => {
//     const updatedHours = [...config.specialHours];
//     updatedHours[index][field] = value;
//     setConfig({ ...config, specialHours: updatedHours });
//   };

//   const addSpecialHours = () => {
//     setConfig({
//       ...config,
//       specialHours: [
//         ...config.specialHours,
//         {
//           date: new Date().toISOString().split('T')[0],
//           openTime: '09:00',
//           closeTime: '17:00',
//           isClosed: false
//         }
//       ]
//     });
//   };

//   const removeSpecialHours = (index) => {
//     const updatedHours = [...config.specialHours];
//     updatedHours.splice(index, 1);
//     setConfig({ ...config, specialHours: updatedHours });
//   };

//   const onClose = () => {
//     setIsOpen(false);
//   };

//   const handleOverlayClick = (e) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="business-hours-modal">
//       <div 
//         className="modal-overlay" 
//         onClick={handleOverlayClick}
//         onMouseDown={(e) => e.preventDefault()}
//       />
      
//       <div className="modal-container">
//         <div className="modal-header">
//           <h2>Business Hours & Slot Configuration</h2>
//           <button onClick={onClose} className="close-button">
//             &times;
//           </button>
//         </div>

//         {loading ? (
//           <div className="loading-spinner">
//             <div className="spinner"></div>
//           </div>
//         ) : (
//           <div className="modal-content">
//             <div className="tab-header">
//               <button
//                 className={`tab-button ${activeTab === 'regular' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('regular')}
//               >
//                 Regular Hours
//               </button>
//               <button
//                 className={`tab-button ${activeTab === 'special' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('special')}
//               >
//                 Special Hours
//               </button>
//               <button
//                 className={`tab-button ${activeTab === 'slots' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('slots')}
//               >
//                 Slot Configuration
//               </button>
//               <button
//                 className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('preview')}
//               >
//                 Preview
//               </button>
//             </div>

//             <div className="tab-content">
//               {activeTab === 'regular' && (
//                 <div className="regular-hours-section">
//                   <h3>Set your regular weekly hours</h3>
//                   {config.regularHours.map((day, index) => (
//                     <div key={index} className="day-row">
//                       <div className="day-name">{daysOfWeek.find(d => d.id === day.dayOfWeek)?.name}</div>
//                       <button
//                         onClick={() => toggleDayClosed(index)}
//                         className={`toggle-button ${day.isClosed ? 'closed' : 'open'}`}
//                       >
//                         {day.isClosed ? <X size={16} /> : <Check size={16} />}
//                       </button>
//                       {!day.isClosed && (
//                         <div className="time-inputs">
//                           <div className="time-input">
//                             <Clock size={16} />
//                             <input
//                               type="time"
//                               value={day.openTime}
//                               onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
//                             />
//                           </div>
//                           <span>to</span>
//                           <div className="time-input">
//                             <Clock size={16} />
//                             <input
//                               type="time"
//                               value={day.closeTime}
//                               onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {activeTab === 'special' && (
//                 <div className="special-hours-section">
//                   <div className="section-header">
//                     <h3>Special Hours</h3>
//                     <button onClick={addSpecialHours} className="add-button">
//                       <Plus size={16} className="icon" /> Add Special Hours
//                     </button>
//                   </div>
                  
//                   {config.specialHours.length === 0 ? (
//                     <div className="empty-state">
//                       <Calendar size={32} />
//                       <p>No special hours configured. Add special hours for holidays or events.</p>
//                     </div>
//                   ) : (
//                     <div className="special-hours-list">
//                       {config.specialHours.map((special, index) => (
//                         <div key={index} className="special-hour-item">
//                           <div className="item-header">
//                             <h4>Special Hours #{index + 1}</h4>
//                             <button 
//                               onClick={() => removeSpecialHours(index)} 
//                               className="delete-button"
//                             >
//                               <Trash2 size={16} />
//                             </button>
//                           </div>
                          
//                           <div className="item-content">
//                             <div className="form-group">
//                               <label>Date</label>
//                               <input
//                                 type="date"
//                                 value={special.date}
//                                 onChange={(e) => handleSpecialHoursChange(index, 'date', e.target.value)}
//                               />
//                             </div>
                            
//                             <div className="time-range">
//                               <div className="form-group">
//                                 <label>Open Time</label>
//                                 <input
//                                   type="time"
//                                   value={special.openTime}
//                                   onChange={(e) => handleSpecialHoursChange(index, 'openTime', e.target.value)}
//                                 />
//                               </div>
//                               <span>to</span>
//                               <div className="form-group">
//                                 <label>Close Time</label>
//                                 <input
//                                   type="time"
//                                   value={special.closeTime}
//                                   onChange={(e) => handleSpecialHoursChange(index, 'closeTime', e.target.value)}
//                                 />
//                               </div>
//                             </div>
                            
//                             <div className="form-group checkbox-group">
//                               <input
//                                 type="checkbox"
//                                 id={`special-closed-${index}`}
//                                 checked={special.isClosed}
//                                 onChange={(e) => handleSpecialHoursChange(index, 'isClosed', e.target.checked)}
//                               />
//                               <label htmlFor={`special-closed-${index}`}>Closed</label>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'slots' && (
//                 <div className="slot-config-section">
//                   <h3>Slot Configuration</h3>
                  
//                   <div className="config-grid">
//                     <div className="config-column">
//                       <div className="form-group">
//                         <label>Slot Duration (minutes)</label>
//                         <select
//                           value={config.slotConfig.slotDuration}
//                           onChange={(e) => handleSlotConfigChange('slotDuration', parseInt(e.target.value))}
//                         >
//                           {[15, 30, 45, 60, 90, 120].map((duration) => (
//                             <option key={duration} value={duration}>{duration} minutes</option>
//                           ))}
//                         </select>
//                       </div>
                      
//                       <div className="form-group">
//                         <label>Max Slots Per Interval</label>
//                         <input
//                           type="number"
//                           min="1"
//                           max="10"
//                           value={config.slotConfig.maxSlotsPerInterval}
//                           onChange={(e) => handleSlotConfigChange('maxSlotsPerInterval', parseInt(e.target.value))}
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="config-column">
//                       <div className="form-group">
//                         <label>Buffer Time (minutes)</label>
//                         <input
//                           type="number"
//                           min="0"
//                           max="60"
//                           value={config.slotConfig.bufferTime}
//                           onChange={(e) => handleSlotConfigChange('bufferTime', parseInt(e.target.value))}
//                         />
//                       </div>
                      
//                       <div className="form-group checkbox-group">
//                         <input
//                           type="checkbox"
//                           id="isRecurring"
//                           checked={config.slotConfig.isRecurring}
//                           onChange={(e) => handleSlotConfigChange('isRecurring', e.target.checked)}
//                         />
//                         <label htmlFor="isRecurring">Recurring weekly schedule</label>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'preview' && (
//                 <div className="preview-section">
//                   <div className="preview-controls">
//                     <div className="form-group">
//                       <label>Preview Date</label>
//                       <input
//                         type="date"
//                         value={previewDate.toISOString().split('T')[0]}
//                         onChange={(e) => setPreviewDate(new Date(e.target.value))}
//                       />
//                     </div>
//                     <button onClick={generatePreview} className="generate-button">
//                       Generate Preview
//                     </button>
//                   </div>
                  
//                   {generatedSlots.length > 0 ? (
//                     <div className="slots-preview">
//                       <h4>Available Time Slots</h4>
//                       <div className="slots-grid">
//                         {generatedSlots.map((slot, index) => (
//                           <div key={index} className={`time-slot ${slot.available ? 'available' : 'booked'}`}>
//                             {slot.time}
//                             {!slot.available && <div className="slot-status">Booked</div>}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="empty-state">
//                       <Clock size={32} />
//                       <p>No slots generated yet. Select a date and click "Generate Preview".</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="modal-footer">
//           <button onClick={onClose} className="cancel-button">
//             Cancel
//           </button>
//           <button onClick={saveConfig} className="save-button">
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BusinessHoursConfig;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Calendar, Check, X, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './BusinessHoursConfig.css';

const daysOfWeek = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' }
];

const BusinessHoursConfig = () => {
  const token = localStorage.getItem('token');
  //const { businessId } = useParams();
  const businessId = 1; // Hardcoded for testing, replace with useParams() in production
  const [isOpen, setIsOpen] = useState(true);
  const [config, setConfig] = useState({
    regularHours: daysOfWeek.map(day => ({
      dayOfWeek: day.id,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: false
    })),
    slotConfig: {
      slotDuration: 30,
      maxSlotsPerInterval: 1,
      bufferTime: 0,
      isRecurring: true,
      startTime: '09:00',
      endTime: '17:00',
      slotPrice: 0.0
    },
    specialHours: []
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regular');
  const [previewDate, setPreviewDate] = useState(new Date());
  const [generatedSlots, setGeneratedSlots] = useState([]);

  useEffect(() => {
    if (isOpen && businessId) {
      fetchConfig();
    }
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, businessId]);

  const fetchConfig = async () => {
    try {
      // Initialize default config
      let fetchedConfig = {
        regularHours: daysOfWeek.map(day => ({
          dayOfWeek: day.id,
          openTime: '09:00',
          closeTime: '17:00',
          isClosed: false
        })),
        slotConfig: {
          slotDuration: 30,
          maxSlotsPerInterval: 1,
          bufferTime: 0,
          isRecurring: true,
          startTime: '09:00',
          endTime: '17:00',
          slotPrice: 0.0
        },
        specialHours: []
      };

      // Try to fetch slot configuration
      try {
        const slotConfigResponse = await fetch(`${API_BASE_URL}/api/slot-config/location/${businessId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (slotConfigResponse.ok) {
          const slotConfigData = await slotConfigResponse.json();
          fetchedConfig.slotConfig = {
            slotDuration: slotConfigData.slotDuration || 30,
            maxSlotsPerInterval: slotConfigData.maxSlotsPerInterval || 1,
            bufferTime: 0,
            isRecurring: true,
            startTime: slotConfigData.startTime || '09:00',
            endTime: slotConfigData.endTime || '17:00',
            slotPrice: slotConfigData.slotPrice || 0.0
          };
        }
      } catch (slotConfigError) {
        console.warn('Could not fetch slot configuration, using defaults:', slotConfigError.message);
      }

      // Try to fetch business hours
      try {
        const businessHoursResponse = await fetch(`${API_BASE_URL}/api/business-hours/${businessId}/weekly`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (businessHoursResponse.ok) {
          const businessHoursData = await businessHoursResponse.json();
          if (businessHoursData && businessHoursData.length > 0) {
            fetchedConfig.regularHours = businessHoursData;
          }
        }
      } catch (businessHoursError) {
        console.warn('Could not fetch business hours, using defaults:', businessHoursError.message);
      }

      setConfig(fetchedConfig);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching config:', error);
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      console.log('Saving slot configuration:', config.slotConfig);
      
      // Prepare slot config data
      const slotConfigData = {
        locationId: businessId, // Using businessId as locationId for now
        startTime: config.slotConfig.startTime,
        endTime: config.slotConfig.endTime,
        slotDuration: config.slotConfig.slotDuration,
        maxSlotsPerInterval: config.slotConfig.maxSlotsPerInterval,
        slotPrice: config.slotConfig.slotPrice
      };
      
      console.log('Slot config data being sent:', slotConfigData);
      
      // Save slot configuration
      const slotConfigResponse = await fetch(`${API_BASE_URL}/api/slot-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(slotConfigData)
      });
      
      console.log('Slot config response status:', slotConfigResponse.status);
      
      if (!slotConfigResponse.ok) {
        const errorText = await slotConfigResponse.text();
        console.error('Slot config error response:', errorText);
        throw new Error(`Failed to save slot config: ${errorText}`);
      }
      
      const slotConfigResult = await slotConfigResponse.json();
      console.log('Slot config saved successfully:', slotConfigResult);
      
      // Save business hours if needed
      if (config.regularHours && config.regularHours.length > 0) {
        const businessHoursData = config.regularHours.map(hour => ({
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed
        }));
        
        console.log('Business hours data being sent:', businessHoursData);
        
        const businessHoursResponse = await fetch(`${API_BASE_URL}/api/business-hours/${businessId}/weekly`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(businessHoursData)
        });
        
        if (!businessHoursResponse.ok) {
          const errorText = await businessHoursResponse.text();
          console.warn('Failed to save business hours:', errorText);
        } else {
          const businessHoursResult = await businessHoursResponse.json();
          console.log('Business hours saved successfully:', businessHoursResult);
        }
      }
      
      alert('Configuration saved successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving config:', error);
      alert(`Failed to save configuration: ${error.message}`);
    }
  };

  const generatePreview = async () => {
    try {
      const dateStr = previewDate.toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE_URL}/api/business-hours/generate-slots/${businessId}?date=${dateStr}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to generate slots');
      const slots = await response.json();
      setGeneratedSlots(slots);
    } catch (error) {
      console.error('Error generating slots:', error);
      alert('Failed to generate slots. Please check your configuration.');
    }
  };

  const handleTimeChange = (dayIndex, field, value) => {
    const updatedHours = [...config.regularHours];
    updatedHours[dayIndex][field] = value;
    setConfig({ ...config, regularHours: updatedHours });
  };

  const toggleDayClosed = (dayIndex) => {
    const updatedHours = [...config.regularHours];
    updatedHours[dayIndex].isClosed = !updatedHours[dayIndex].isClosed;
    setConfig({ ...config, regularHours: updatedHours });
  };

  const handleSlotConfigChange = (field, value) => {
    // Ensure slotPrice is always a valid number
    if (field === 'slotPrice') {
      value = Math.max(0, parseFloat(value) || 0);
    }
    
    setConfig({
      ...config,
      slotConfig: {
        ...config.slotConfig,
        [field]: value
      }
    });
  };

  const handleSpecialHoursChange = (index, field, value) => {
    const updatedHours = [...config.specialHours];
    updatedHours[index][field] = value;
    setConfig({ ...config, specialHours: updatedHours });
  };

  const addSpecialHours = () => {
    setConfig({
      ...config,
      specialHours: [
        ...config.specialHours,
        {
          date: new Date().toISOString().split('T')[0],
          openTime: '09:00',
          closeTime: '17:00',
          isClosed: false
        }
      ]
    });
  };

  const removeSpecialHours = (index) => {
    const updatedHours = [...config.specialHours];
    updatedHours.splice(index, 1);
    setConfig({ ...config, specialHours: updatedHours });
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="business-hours-modal">
      <div 
        className="modal-overlay" 
        onClick={handleOverlayClick}
        onMouseDown={(e) => e.preventDefault()}
      />
      
      <div className="modal-container">
        <div className="modal-header">
          <h2>Business Hours & Slot Configuration</h2>
          <button onClick={onClose} className="close-button">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="modal-content">
            <div className="tab-header">
              <button
                className={`tab-button ${activeTab === 'regular' ? 'active' : ''}`}
                onClick={() => setActiveTab('regular')}
              >
                Regular Hours
              </button>
              <button
                className={`tab-button ${activeTab === 'special' ? 'active' : ''}`}
                onClick={() => setActiveTab('special')}
              >
                Special Hours
              </button>
              <button
                className={`tab-button ${activeTab === 'slots' ? 'active' : ''}`}
                onClick={() => setActiveTab('slots')}
              >
                Slot Configuration
              </button>
              <button
                className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'regular' && (
                <div className="regular-hours-section">
                  <h3>Set your regular weekly hours</h3>
                  {config.regularHours.map((day, index) => (
                    <div key={index} className="day-row">
                      <div className="day-name">{daysOfWeek.find(d => d.id === day.dayOfWeek)?.name}</div>
                      <button
                        onClick={() => toggleDayClosed(index)}
                        className={`toggle-button ${day.isClosed ? 'closed' : 'open'}`}
                      >
                        {day.isClosed ? <X size={16} /> : <Check size={16} />}
                      </button>
                      {!day.isClosed && (
                        <div className="time-inputs">
                          <div className="time-input">
                            <Clock size={16} />
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                            />
                          </div>
                          <span>to</span>
                          <div className="time-input">
                            <Clock size={16} />
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'special' && (
                <div className="special-hours-section">
                  <div className="section-header">
                    <h3>Special Hours</h3>
                    <button onClick={addSpecialHours} className="add-button">
                      <Plus size={16} className="icon" /> Add Special Hours
                    </button>
                  </div>
                  
                  {config.specialHours.length === 0 ? (
                    <div className="empty-state">
                      <Calendar size={32} />
                      <p>No special hours configured. Add special hours for holidays or events.</p>
                    </div>
                  ) : (
                    <div className="special-hours-list">
                      {config.specialHours.map((special, index) => (
                        <div key={index} className="special-hour-item">
                          <div className="item-header">
                            <h4>Special Hours #{index + 1}</h4>
                            <button 
                              onClick={() => removeSpecialHours(index)} 
                              className="delete-button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="item-content">
                            <div className="form-group">
                              <label>Date</label>
                              <input
                                type="date"
                                value={special.date}
                                onChange={(e) => handleSpecialHoursChange(index, 'date', e.target.value)}
                              />
                            </div>
                            
                            <div className="time-range">
                              <div className="form-group">
                                <label>Open Time</label>
                                <input
                                  type="time"
                                  value={special.openTime}
                                  onChange={(e) => handleSpecialHoursChange(index, 'openTime', e.target.value)}
                                />
                              </div>
                              <span>to</span>
                              <div className="form-group">
                                <label>Close Time</label>
                                <input
                                  type="time"
                                  value={special.closeTime}
                                  onChange={(e) => handleSpecialHoursChange(index, 'closeTime', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="form-group checkbox-group">
                              <input
                                type="checkbox"
                                id={`special-closed-${index}`}
                                checked={special.isClosed}
                                onChange={(e) => handleSpecialHoursChange(index, 'isClosed', e.target.checked)}
                              />
                              <label htmlFor={`special-closed-${index}`}>Closed</label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'slots' && (
                <div className="slot-config-section">
                  <h3>Slot Configuration</h3>
                  
                  <div className="config-grid">
                    <div className="config-column">
                      <div className="form-group">
                        <label>Slot Duration (minutes)</label>
                        <select
                          value={config.slotConfig.slotDuration}
                          onChange={(e) => handleSlotConfigChange('slotDuration', parseInt(e.target.value))}
                        >
                          {[15, 30, 45, 60, 90, 120].map((duration) => (
                            <option key={duration} value={duration}>{duration} minutes</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Max Slots Per Interval</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={config.slotConfig.maxSlotsPerInterval}
                          onChange={(e) => handleSlotConfigChange('maxSlotsPerInterval', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Slot Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={config.slotConfig.slotPrice}
                          onChange={(e) => handleSlotConfigChange('slotPrice', parseFloat(e.target.value) || 0)}
                          placeholder="Enter price per slot"
                        />
                        <small className="price-info">
                          Current price: <strong>${config.slotConfig.slotPrice?.toFixed(2) || '0.00'}</strong> per slot
                        </small>
                      </div>
                    </div>
                    
                    <div className="config-column">
                      <div className="form-group">
                        <label>Buffer Time (minutes)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={config.slotConfig.bufferTime}
                          onChange={(e) => handleSlotConfigChange('bufferTime', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="form-group checkbox-group">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          checked={config.slotConfig.isRecurring}
                          onChange={(e) => handleSlotConfigChange('isRecurring', e.target.checked)}
                        />
                        <label htmlFor="isRecurring">Recurring weekly schedule</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="preview-section">
                  <div className="preview-controls">
                    <div className="form-group">
                      <label>Preview Date</label>
                      <input
                        type="date"
                        value={previewDate.toISOString().split('T')[0]}
                        onChange={(e) => setPreviewDate(new Date(e.target.value))}
                      />
                    </div>
                    <button onClick={generatePreview} className="generate-button">
                      Generate Preview
                    </button>
                  </div>
                  
                  {generatedSlots.length > 0 ? (
                    <div className="slots-preview">
                      <h4>Available Time Slots</h4>
                      <div className="slots-grid">
                        {generatedSlots.map((slot, index) => (
                          <div key={index} className={`time-slot ${slot.available ? 'available' : 'booked'}`}>
                            <div className="slot-time">{slot.time}</div>
                            {slot.price && (
                              <div className="slot-price">${slot.price}</div>
                            )}
                            {!slot.available && <div className="slot-status">Booked</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Clock size={32} />
                      <p>No slots generated yet. Select a date and click "Generate Preview".</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={saveConfig} className="save-button">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessHoursConfig;