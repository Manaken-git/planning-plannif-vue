import React from 'react';
import { formatProfName } from '../../types/planning';
import type { Seance } from '../../types/planning';
import './DayGrid.css';

interface DayGridProps {
  dates: string[];
  seances: Seance[];
  selectedProfs: number[];
  selectedClasses: number[];
  selectedMatieres: number[];
  onSelectDay: (dateStr: string) => void;
}

// Generates a consistent aesthetic color based on the subject ID
const getSubjectColor = (subjectId: number) => {
  const colors = [
    '#2563eb', // Royal Blue
    '#8b5cf6', // Violet/Purple
    '#10b981', // Emerald Green
    '#f59e0b', // Amber/Orange
    '#ef4444', // Rose Red
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#14b8a6', // Teal
  ];
  return colors[subjectId % colors.length];
};

export const DayGrid: React.FC<DayGridProps> = ({
  dates,
  seances,
  selectedProfs,
  selectedClasses,
  selectedMatieres,
  onSelectDay
}) => {
  const formatDateHeader = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="day-grid-container fade-in">
      {dates.map((dateStr) => {
        // Filter and sort sessions for this day
        const daySeances = seances
          .filter((s) => s.creneau?.debut.startsWith(dateStr))
          .filter((s) => {
            const isProfSelected = !s.professeur || selectedProfs.includes(s.professeur.id);
            const isClasseSelected = selectedClasses.includes(s.classe.id);
            const isMatiereSelected = selectedMatieres.includes(s.matiere.id);
            return isProfSelected && isClasseSelected && isMatiereSelected;
          })
          .sort((a, b) => {
            if (!a.creneau || !b.creneau) return 0;
            return a.creneau.debut.localeCompare(b.creneau.debut);
          });

        const sessionCount = daySeances.length;

        return (
          <div
            key={dateStr}
            className={`day-card ${sessionCount > 0 ? 'has-sessions' : 'is-empty'}`}
            onClick={() => onSelectDay(dateStr)}
          >
            <div className="day-card-header">
              <div className="day-card-date-info">
                <span className="day-card-dayname">
                  {formatDateHeader(dateStr).split(' ')[0]}
                </span>
                <span className="day-card-date">
                  {formatDateHeader(dateStr).split(' ').slice(1).join(' ')}
                </span>
              </div>
              <span className={`day-card-badge ${sessionCount > 0 ? 'active' : ''}`}>
                {sessionCount} {sessionCount > 1 ? 'cours' : 'cours'}
              </span>
            </div>

            <div className="day-card-body">
              {sessionCount === 0 ? (
                <div className="empty-day-message">Aucun cours planifié</div>
              ) : (
                <div className="day-sessions-list">
                  {daySeances.map((seance) => {
                    if (!seance.creneau) return null;
                    const startTime = formatTime(seance.creneau.debut);
                    const endTime = formatTime(seance.creneau.fin);
                    const profName = formatProfName(seance.professeur) || 'Non assigné';
                    const className = seance.classe.nom;
                    const roomName = seance.salle?.nom || seance.salle?.code || '';
                    const subjectColor = getSubjectColor(seance.matiere.id);

                    return (
                      <div
                        key={seance.id}
                        className="grid-session-item"
                        style={{ borderLeftColor: subjectColor }}
                        title={`${seance.matiere.nom}\nEnseignant : ${profName}\nClasse : ${className}\nSalle : ${roomName || 'N/A'}\nHoraire : ${startTime} - ${endTime}`}
                      >
                        <div className="grid-session-header">
                          <span className="grid-session-time">{startTime} - {endTime}</span>
                          {roomName && <span className="grid-session-room">{roomName}</span>}
                        </div>
                        <div className="grid-session-title">{seance.matiere.nom}</div>
                        <div className="grid-session-details">
                          <span className="grid-session-class">{className}</span>
                          <span className="grid-session-dot">•</span>
                          <span className="grid-session-prof">{profName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="day-card-footer">
              <span className="details-link">Voir le détail ➔</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
