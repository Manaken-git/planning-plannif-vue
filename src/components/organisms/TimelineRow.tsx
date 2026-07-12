import React from 'react';
import type { Seance, Professeur } from '../../types/planning';
import './TimelineRow.css';

interface TimelineRowProps {
  prof: Professeur;
  seances: Seance[];
}

export const TimelineRow: React.FC<TimelineRowProps> = ({ prof, seances }) => {
  const calculateOffset = (startStr: string) => {
    const start = new Date(startStr);
    const startHour = start.getHours() + start.getMinutes() / 60.0;
    return ((startHour - 8.0) / 11.0) * 100.0;
  };

  const calculateWidth = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return (diffMinutes / (11.0 * 60.0)) * 100.0;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="timeline-row">
      <div className="row-label">{prof.nom}</div>
      <div className="row-content">
        {/* Grid helper lines */}
        {Array.from({ length: 11 }).map((_, idx) => (
          <div key={idx} className="grid-line"></div>
        ))}

        {/* Sessions */}
        {seances.map((seance) => {
          if (!seance.creneau) return null;
          const offset = calculateOffset(seance.creneau.debut);
          const width = calculateWidth(seance.creneau.debut, seance.creneau.fin);

          return (
            <div
              key={seance.id}
              className="session-bar"
              style={{ left: `${offset}%`, width: `${width}%` }}
              title={`${seance.matiere.nom} - ${seance.classe.nom}`}
            >
              <div className="session-title">{seance.matiere.nom}</div>
              <div className="session-info">{seance.classe.nom}</div>
              <div className="session-time">
                {formatTime(seance.creneau.debut)} - {formatTime(seance.creneau.fin)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
