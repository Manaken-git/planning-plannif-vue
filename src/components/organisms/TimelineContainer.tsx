import React from 'react';
import { TimelineHeader } from '../molecules/TimelineHeader';
import { TimelineRow } from './TimelineRow';
import type { Seance, Professeur } from '../../types/planning';
import './TimelineContainer.css';

interface TimelineContainerProps {
  dateStr: string;
  professors: Professeur[];
  seances: Seance[];
  selectedProfs: number[];
  selectedClasses: number[];
  selectedMatieres: number[];
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  dateStr,
  professors,
  seances,
  selectedProfs,
  selectedClasses,
  selectedMatieres
}) => {
  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Group sessions by professeur for this day
  const sessionsByProf = seances.reduce((acc, seance) => {
    if (!seance.professeur || !seance.creneau) return acc;
    const profId = seance.professeur.id;
    if (!acc[profId]) acc[profId] = [];
    acc[profId].push(seance);
    return acc;
  }, {} as Record<number, Seance[]>);

  // Filter professors that are selected in filters AND have sessions on this day
  const activeProfs = professors.filter((prof) => {
    const isSelected = selectedProfs.includes(prof.id);
    const profSessions = sessionsByProf[prof.id] || [];
    return isSelected && profSessions.length > 0;
  });

  if (activeProfs.length === 0) return null;

  return (
    <section className="day-section fade-in">
      <h2 className="day-title">{formatDate(dateStr)}</h2>
      <div className="timeline-container">
        <TimelineHeader />
        {activeProfs.map((prof) => (
          <TimelineRow
            key={prof.id}
            prof={prof}
            seances={sessionsByProf[prof.id] || []}
            selectedClasses={selectedClasses}
            selectedMatieres={selectedMatieres}
          />
        ))}
      </div>
    </section>
  );
};
