import React from 'react';
import './List.css';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

const ScheduleList = ({ schedules, onViewDetails }) => {
  if (schedules.length === 0) {
    return (
      <div className="no-schedule">
        <div className="no-schedule-icon">
          <Calendar size={48} />
        </div>
        <p>No schedules available</p>
        <p className="no-schedule-subtext">Check back later or create a new schedule</p>
      </div>
    );
  }

  return (
    <div className="schedule-list">
      {schedules.map((schedule, index) => (
        <div key={index} className="schedule-item" onClick={() => onViewDetails(schedule)}>
          <div className="schedule-time-container">
            <div className="schedule-time">
              <Clock size={18} className="icon" />
              <span className="time">{schedule.time}</span>
            </div>
            <div className="schedule-date">
              <Calendar size={18} className="icon" />
              <span className="date">{schedule.date}</span>
            </div>
          </div>
          
          <div className="schedule-details">
            {schedule.title && <h3 className="schedule-title">{schedule.title}</h3>}
            {schedule.location && <p className="schedule-location">{schedule.location}</p>}
            {schedule.status && (
              <div className={`schedule-status ${schedule.status.toLowerCase()}`}>
                {schedule.status}
              </div>
            )}
          </div>
          
          <ChevronRight size={20} className="chevron-icon" />
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;