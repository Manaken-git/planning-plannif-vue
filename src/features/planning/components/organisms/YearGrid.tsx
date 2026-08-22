import React, { useMemo } from 'react';
import type { Seance } from '../../types/planning';
import './YearGrid.css';

interface YearGridProps {
  year: number;
  seances: Seance[];
  selectedProfs: number[];
  selectedClasses: number[];
  selectedMatieres: number[];
  onSelectDay: (dateStr: string) => void;
}

const getDensityColor = (count: number) => {
  if (count === 0) return 'var(--bg)';
  if (count <= 2) return 'rgba(37, 99, 235, 0.15)';   // very light blue
  if (count <= 5) return 'rgba(37, 99, 235, 0.4)';    // light-medium blue
  if (count <= 10) return 'rgba(37, 99, 235, 0.7)';   // medium-dark blue
  return 'var(--primary)';                             // solid primary blue
};

export const YearGrid: React.FC<YearGridProps> = ({
  year,
  seances,
  selectedProfs,
  selectedClasses,
  selectedMatieres,
  onSelectDay
}) => {
  // Map sessions count per day
  const sessionsByDay = useMemo(() => {
    const map: Record<string, number> = {};

    seances.forEach((s) => {
      if (!s.creneau?.debut) return;
      const dateStr = s.creneau.debut.substring(0, 10);
      if (!dateStr.startsWith(String(year))) return;

      const isProfSelected = !s.professeur || selectedProfs.includes(s.professeur.id);
      const isClasseSelected = selectedClasses.includes(s.classe.id);
      const isMatiereSelected = selectedMatieres.includes(s.matiere.id);

      if (isProfSelected && isClasseSelected && isMatiereSelected) {
        map[dateStr] = (map[dateStr] || 0) + 1;
      }
    });

    return map;
  }, [seances, year, selectedProfs, selectedClasses, selectedMatieres]);

  // Generate calendar structures for all 12 months
  const months = useMemo(() => {
    const list = [];
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    for (let m = 0; m < 12; m++) {
      const firstDay = new Date(year, m, 1);
      const lastDay = new Date(year, m + 1, 0);
      const numDays = lastDay.getDate();

      let startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday
      startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust Monday = 0

      const days = [];
      // Padding cells
      for (let i = 0; i < startDayOfWeek; i++) {
        days.push({ dayNum: null, dateStr: null });
      }

      // Day cells
      for (let i = 1; i <= numDays; i++) {
        const mm = String(m + 1).padStart(2, '0');
        const dd = String(i).padStart(2, '0');
        days.push({
          dayNum: i,
          dateStr: `${year}-${mm}-${dd}`
        });
      }

      list.push({
        name: monthNames[m],
        monthIndex: m,
        days
      });
    }
    return list;
  }, [year]);

  const getTooltip = (dayName: string, count: number) => {
    if (count === 0) return `${dayName} : Aucun cours planifié`;
    return `${dayName} : ${count} ${count > 1 ? 'séances planifiées' : 'séance planifiée'}`;
  };

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="year-grid-container fade-in">
      {/* Legend Block */}
      <div className="year-legend-card">
        <span className="legend-label">Intensité des cours :</span>
        <div className="legend-items">
          <div className="legend-item"><span className="legend-color-box color-empty"></span> 0</div>
          <div className="legend-item"><span className="legend-color-box color-low"></span> 1 - 2</div>
          <div className="legend-item"><span className="legend-color-box color-medium"></span> 3 - 5</div>
          <div className="legend-item"><span className="legend-color-box color-high"></span> 6 - 10</div>
          <div className="legend-item"><span className="legend-color-box color-max"></span> 10+</div>
        </div>
        <p className="legend-instruction">Astuce : cliquez sur un jour coloré pour ouvrir son planning hebdomadaire.</p>
      </div>

      {/* 12 Months Grid */}
      <div className="year-months-grid">
        {months.map((month) => (
          <div key={month.name} className="mini-month-card">
            <h4>{month.name}</h4>
            <div className="mini-weekdays">
              {weekdays.map((w, idx) => (
                <span key={idx} className="mini-weekday">{w}</span>
              ))}
            </div>
            <div className="mini-days-grid">
              {month.days.map((day, idx) => {
                if (!day.dayNum || !day.dateStr) {
                  return <span key={`empty-${idx}`} className="mini-day-cell is-empty"></span>;
                }

                const count = sessionsByDay[day.dateStr] || 0;
                const bgColor = getDensityColor(count);
                const dayLabel = getDayLabel(day.dateStr);

                return (
                  <div
                    key={day.dateStr}
                    className={`mini-day-cell ${count > 0 ? 'has-events' : 'no-events'}`}
                    style={{ backgroundColor: bgColor }}
                    title={getTooltip(dayLabel, count)}
                    onClick={() => count > 0 && onSelectDay(day.dateStr)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default YearGrid;

