import React, { useMemo } from 'react';
import { formatProfName } from '../../types/planning';
import type { Seance } from '../../types/planning';
import './WeekGrid.css';

interface WeekGridProps {
  weekStartStr: string; // ISO date of the Monday (YYYY-MM-DD)
  seances: Seance[];
  selectedProfs: number[];
  selectedClasses: number[];
  selectedMatieres: number[];
}

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

export const WeekGrid: React.FC<WeekGridProps> = ({
  weekStartStr,
  seances,
  selectedProfs,
  selectedClasses,
  selectedMatieres
}) => {
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Determine if there are sessions scheduled on Saturday or Sunday in this week
  const hasWeekendClasses = useMemo(() => {
    const start = new Date(weekStartStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return seances.some((s) => {
      if (!s.creneau?.debut) return false;
      const date = new Date(s.creneau.debut);
      if (date >= start && date < end) {
        const day = date.getDay(); // 0 is Sunday, 6 is Saturday
        return day === 0 || day === 6;
      }
      return false;
    });
  }, [seances, weekStartStr]);

  // Generate days of the week to display (5 for weekdays, 7 if weekend classes are present)
  const activeDays = useMemo(() => {
    const start = new Date(weekStartStr);
    const limit = hasWeekendClasses ? 7 : 5;
    const list = [];

    for (let i = 0; i < limit; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Capitalize first letter of weekday
      const rawLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

      list.push({
        date: d,
        dateStr,
        label
      });
    }
    return list;
  }, [weekStartStr, hasWeekendClasses]);

  return (
    <div className="week-grid-container fade-in">
      <div className="week-grid-columns">
        {activeDays.map((day) => {
          // Filter and sort sessions for this specific day
          const daySeances = seances
            .filter((s) => s.creneau?.debut.startsWith(day.dateStr))
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

          const isToday = new Date().toDateString() === day.date.toDateString();

          return (
            <div
              key={day.dateStr}
              className={`week-day-column ${isToday ? 'is-today' : ''} ${daySeances.length === 0 ? 'is-empty' : ''}`}
            >
              <div className="week-day-header">
                <span className="week-day-title">{day.label}</span>
                <span className="week-day-badge">
                  {daySeances.length} {daySeances.length > 1 ? 'séances' : 'séance'}
                </span>
              </div>

              <div className="week-day-body">
                {daySeances.length === 0 ? (
                  <div className="week-empty-message">Aucun cours</div>
                ) : (
                  daySeances.map((seance) => {
                    if (!seance.creneau) return null;
                    const startTime = formatTime(seance.creneau.debut);
                    const endTime = formatTime(seance.creneau.fin);
                    const profName = formatProfName(seance.professeur) || 'Non assigné';
                    const className = seance.classe.nom;
                    const roomName = seance.salle?.nom || seance.salle?.code || 'N/A';
                    const subjectColor = getSubjectColor(seance.matiere.id);

                    return (
                      <div
                        key={seance.id}
                        className="week-session-card"
                        style={{ borderLeftColor: subjectColor }}
                        title={`${seance.matiere.nom}\nEnseignant : ${profName}\nClasse : ${className}\nSalle : ${roomName}`}
                      >
                        <div className="week-session-time">
                          🕒 {startTime} - {endTime}
                        </div>
                        <div className="week-session-subject">{seance.matiere.nom}</div>
                        <div className="week-session-details">
                          <span className="week-session-tag tag-class">👥 {className}</span>
                          <span className="week-session-tag tag-room">🏫 {roomName}</span>
                        </div>
                        <div className="week-session-prof">
                          👤 {profName}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
