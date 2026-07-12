import React from 'react';
import './TimelineHeader.css';

export const TimelineHeader: React.FC = () => {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 to 18

  return (
    <div className="timeline-header">
      <div className="timeline-label-col">Professeur</div>
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
