import React, { useMemo } from 'react';
import { formatProfName } from '../../types/planning';
import type { Seance } from '../../types/planning';
import { Icon } from '../atoms/Icon';
import type { IconName } from '../atoms/Icon';
import './WeekGrid.css';

interface WeekGridProps {
  weekStartStr: string; // ISO date of the Monday (YYYY-MM-DD)
  seances: Seance[];
  selectedProfs: number[];
  selectedClasses: number[];
  selectedMatieres: number[];
  density?: 'session' | 'compact';
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
  return colors[(subjectId - 1) % colors.length];
};

const getSubjectIcon = (subjectName: string): IconName => {
  const name = subjectName.toLowerCase();
  if (name.includes('math')) return 'calculator';
  if (name.includes('phys') || name.includes('bio')) return 'atom';
  if (name.includes('anglais') || name.includes('français')) return 'languages';
  if (name.includes('histoire')) return 'landmark';
  if (name.includes('géo')) return 'globe';
  return 'book';
};

export const WeekGrid: React.FC<WeekGridProps> = ({
  weekStartStr,
  seances,
  selectedProfs,
  selectedClasses,
  selectedMatieres,
  density = 'session'
}) => {
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Generate a complete seven-day week, including empty weekend columns.
  const activeDays = useMemo(() => {
    const start = new Date(weekStartStr);
    const list = [];

    for (let i = 0; i < 7; i++) {
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
  }, [weekStartStr]);

  const busiestDate = useMemo(() => {
    return activeDays.reduce((best, day) => {
      const count = seances.filter((session) => session.creneau?.debut.startsWith(day.dateStr)).length;
      return count > best.count ? { date: day.dateStr, count } : best;
    }, { date: '', count: 0 }).date;
  }, [activeDays, seances]);

  return (
    <div className={`week-grid-container fade-in density-${density}`}>
      <div className="week-grid-scroll">
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
              className={`week-day-column ${isToday ? 'is-today' : ''} ${day.dateStr === busiestDate ? 'is-focus' : ''} ${daySeances.length === 0 ? 'is-empty' : ''}`}
            >
              <div className="week-day-header">
                <span className="week-day-title">{day.label}{isToday && <strong className="today-marker">Aujourd'hui</strong>}</span>
                <span className="week-day-badge">
                  {daySeances.length} {daySeances.length > 1 ? 'séances' : 'séance'}
                </span>
              </div>

              <div className="week-day-body">
                {daySeances.length === 0 ? (
                  <div className="week-empty-message"><span className="week-empty-icon"><Icon name="calendar" /></span><span>Aucune séance</span><small>Profitez de ce créneau libre.</small></div>
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
                        <Icon name="more" className="session-more-icon" />
                        <div className="week-session-time">
                          {startTime} - {endTime}
                        </div>
                        <div className="week-session-heading"><span className="session-subject-icon" style={{ color: subjectColor, backgroundColor: `${subjectColor}18` }}><Icon name={getSubjectIcon(seance.matiere.nom)} /></span><div className="week-session-subject">{seance.matiere.nom}</div></div>
                        <div className="week-session-details">
                          <span className="week-session-tag tag-class">Classe {className}</span>
                          <span className="week-session-tag tag-room">Salle {roomName}</span>
                        </div>
                        <div className="week-session-prof">
                          {profName}
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
    </div>
  );
};

