import React, { useState, useMemo } from 'react';
import { formatProfName } from '../../types/planning';
import type { Seance } from '../../types/planning';
import './MonthGrid.css';

interface MonthGridProps {
  monthStr: string; // YYYY-MM
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

export const MonthGrid: React.FC<MonthGridProps> = ({
  monthStr,
  seances,
  selectedProfs,
  selectedClasses,
  selectedMatieres
}) => {
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const [year, month] = useMemo(() => {
    const [y, m] = monthStr.split('-').map(Number);
    return [y || new Date().getFullYear(), m || new Date().getMonth() + 1];
  }, [monthStr]);

  // Generate grid cells for the month
  const gridCells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const numDays = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    let startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust Monday = 0

    const cells = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 2, prevMonthLastDay - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      cells.push({
        date: d,
        dateStr: `${yyyy}-${mm}-${dd}`,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(year, month - 1, i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      cells.push({
        date: d,
        dateStr: `${yyyy}-${mm}-${dd}`,
        isCurrentMonth: true
      });
    }

    // Next month padding
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month, i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        cells.push({
          date: d,
          dateStr: `${yyyy}-${mm}-${dd}`,
          isCurrentMonth: false
        });
      }
    }

    return cells;
  }, [year, month]);

  // Map to get filtered sessions for any day
  const sessionsByDay = useMemo(() => {
    const map: Record<string, Seance[]> = {};

    seances.forEach((s) => {
      if (!s.creneau?.debut) return;
      const dateStr = s.creneau.debut.substring(0, 10);
      
      const isProfSelected = !s.professeur || selectedProfs.includes(s.professeur.id);
      const isClasseSelected = selectedClasses.includes(s.classe.id);
      const isMatiereSelected = selectedMatieres.includes(s.matiere.id);

      if (isProfSelected && isClasseSelected && isMatiereSelected) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(s);
      }
    });

    // Sort chronologically
    Object.keys(map).forEach((dateKey) => {
      map[dateKey].sort((a, b) => {
        if (!a.creneau || !b.creneau) return 0;
        return a.creneau.debut.localeCompare(b.creneau.debut);
      });
    });

    return map;
  }, [seances, selectedProfs, selectedClasses, selectedMatieres]);

  // Selected date detail sessions
  const detailSessions = useMemo(() => {
    if (!selectedDateStr) return [];
    return sessionsByDay[selectedDateStr] || [];
  }, [selectedDateStr, sessionsByDay]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateStr) return '';
    const d = new Date(selectedDateStr);
    const raw = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDateStr]);

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className={`month-view-layout ${selectedDateStr ? 'has-drawer' : ''} fade-in`}>
      {/* Month Calendar Grid Wrapper */}
      <div className="month-calendar-wrapper">
        <div className="month-weekdays">
          {weekdays.map((w) => (
            <div key={w} className="weekday-header">{w}</div>
          ))}
        </div>

        <div className="month-days-grid">
          {gridCells.map((cell) => {
            const daySessions = sessionsByDay[cell.dateStr] || [];
            const count = daySessions.length;
            const isToday = new Date().toDateString() === cell.date.toDateString();
            const isSelected = selectedDateStr === cell.dateStr;

            return (
              <div
                key={cell.dateStr}
                className={`month-day-cell ${cell.isCurrentMonth ? 'in-month' : 'out-month'} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${count > 0 ? 'has-events' : ''}`}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                title={count > 0 ? `${count} séance${count > 1 ? 's' : ''} — ouvrir le détail` : 'Aucune séance'}
              >
                <div className="cell-header">
                  <span className="cell-day-num">{cell.date.getDate()}</span>
                  {count > 0 && <span className="cell-event-badge"><strong>{count}</strong><small>séances</small></span>}
                </div>

                <div className="cell-events-pills">
                  {daySessions.slice(0, 3).map((s) => {
                    const time = s.creneau ? formatTime(s.creneau.debut) : '';
                    const subjectColor = getSubjectColor(s.matiere.id);
                    return (
                      <div
                        key={s.id}
                        className="cell-event-pill"
                        style={{ borderLeftColor: subjectColor }}
                      >
                        <span className="pill-time">{time}</span>
                        <span className="pill-subject" title={s.matiere.nom}>{s.matiere.nom}</span>
                      </div>
                    );
                  })}
                  {count > 3 && (
                    <div className="cell-events-more">
                      + {count - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Details Drawer */}
      {selectedDateStr && (
        <div className="month-details-drawer slide-in-right">
          <div className="drawer-header">
            <h3>Détails du jour</h3>
            <button className="drawer-close-btn" onClick={() => setSelectedDateStr(null)}>x</button>
          </div>
          <div className="drawer-date-title">{selectedDateLabel}</div>

          <div className="drawer-body">
            {detailSessions.length === 0 ? (
              <div className="drawer-empty-state">Aucun cours planifié pour cette journée.</div>
            ) : (
              <div className="drawer-sessions-list">
                {detailSessions.map((seance) => {
                  if (!seance.creneau) return null;
                  const start = formatTime(seance.creneau.debut);
                  const end = formatTime(seance.creneau.fin);
                  const prof = formatProfName(seance.professeur) || 'Non assigné';
                  const room = seance.salle?.nom || seance.salle?.code || 'N/A';
                  const subjectColor = getSubjectColor(seance.matiere.id);

                  return (
                    <div
                      key={seance.id}
                      className="drawer-session-card"
                      style={{ borderLeftColor: subjectColor }}
                    >
                      <div className="card-time-slot">{start} - {end}</div>
                      <h4 className="card-subject-title">{seance.matiere.nom}</h4>
                      <div className="card-metadata">
                        <span className="meta-tag tag-class">Classe {seance.classe.nom}</span>
                        <span className="meta-tag tag-room">Salle {room}</span>
                      </div>
                      <div className="card-prof-name">Enseignant : {prof}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

