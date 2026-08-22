import React from 'react';
import './TimelineHeader.css';

interface TimelineHeaderProps {
  label?: string;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ label = 'Professeur' }) => {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 to 18

  return (
    <div className="timeline-header">
      <div className="timeline-label-col">{label}</div>
      <div className="timeline-slots-container">
        {hours.map((hour) => (
          <div key={hour} className="timeline-slot">
            {hour}h
          </div>
        ))}
      </div>
    </div>
  );
};


