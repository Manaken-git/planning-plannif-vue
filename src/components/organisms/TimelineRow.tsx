import React from 'react';
import { formatProfName, type Seance } from '../../types/planning';
import './TimelineRow.css';

interface TimelineRowProps {
  rowLabel: string;
  seances: Seance[];
  groupMode: 'prof' | 'classe' | 'salle';
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
  rowLabel,
  seances,
  groupMode
}) => {
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

  // Sessions are pre-filtered at parent level
  const visibleSeances = seances;


  return (
    <div className="timeline-row">
      <div className="row-label" title={rowLabel}>{rowLabel}</div>
      <div className="row-content">
        {/* Grid helper lines */}
        {Array.from({ length: 11 }).map((_, idx) => (
          <div key={idx} className="grid-line"></div>
        ))}

        {/* Sessions */}
        {visibleSeances.map((seance) => {
          if (!seance.creneau) return null;
          const offset = calculateOffset(seance.creneau.debut);
          const width = calculateWidth(seance.creneau.debut, seance.creneau.fin);

          const startT = formatTime(seance.creneau.debut);
          const endT = formatTime(seance.creneau.fin);

          const profName = formatProfName(seance.professeur) || 'Non assigné';
          const className = seance.classe.nom;
          const roomName = seance.salle?.nom || seance.salle?.code || 'Sans salle';
          const subjectName = seance.matiere.nom;

          // Dynamic secondary text inside the block
          let displayInfo = '';
          if (groupMode === 'prof') {
            displayInfo = `${className} • ${roomName}`;
          } else if (groupMode === 'classe') {
            displayInfo = `${profName} • ${roomName}`;
          } else {
            displayInfo = `${profName} • ${className}`;
          }

          const tooltip = `Matière : ${subjectName}\nEnseignant : ${profName}\nClasse : ${className}\nSalle : ${roomName}\nHoraire : ${startT} - ${endT}`;

          return (
            <div
              key={seance.id}
              className={`session-bar group-mode-${groupMode}`}
              style={{ left: `${offset}%`, width: `${width}%` }}
              title={tooltip}
            >
              <div className="session-title">{subjectName}</div>
              <div className="session-info">{displayInfo}</div>
              <div className="session-time">
                {startT} - {endT}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

