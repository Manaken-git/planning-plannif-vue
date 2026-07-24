import React from 'react';
import { TimelineHeader } from '../molecules/TimelineHeader';
import { TimelineRow } from './TimelineRow';
import { formatProfName } from '../../types/planning';
import type { Seance, Professeur, Classe, Salle } from '../../types/planning';
import './TimelineContainer.css';

interface TimelineContainerProps {
  dateStr: string;
  groupMode: 'prof' | 'classe' | 'salle';
  professors: Professeur[];
  classes: Classe[];
  salles: Salle[];
  seances: Seance[];
  selectedProfs: number[];
  selectedClasses: number[];
  selectedMatieres: number[];
}

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  dateStr,
  groupMode,
  professors,
  classes,
  salles = [],
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

  // Pre-filter sessions based on sidebar selection
  const visibleSeances = seances.filter((seance) => {
    const isProfSelected = !seance.professeur || selectedProfs.includes(seance.professeur.id);
    const isClasseSelected = selectedClasses.includes(seance.classe.id);
    const isMatiereSelected = selectedMatieres.includes(seance.matiere.id);
    return isProfSelected && isClasseSelected && isMatiereSelected;
  });

  // If there are no sessions at all matching selection, don't show the day section
  if (visibleSeances.length === 0) return null;

  // Group visible sessions based on grouping mode
  let rows: { id: string | number; label: string; seances: Seance[] }[] = [];

  if (groupMode === 'prof') {
    const sessionsByProf = visibleSeances.reduce((acc, s) => {
      if (!s.professeur || !s.creneau) return acc;
      const id = s.professeur.id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(s);
      return acc;
    }, {} as Record<number, Seance[]>);

    rows = professors
      .filter((prof) => selectedProfs.includes(prof.id))
      .map((prof) => ({
        id: prof.id,
        label: formatProfName(prof),
        seances: sessionsByProf[prof.id] || []
      }))
      .filter((r) => r.seances.length > 0);
  } else if (groupMode === 'classe') {
    const sessionsByClasse = visibleSeances.reduce((acc, s) => {
      if (!s.classe || !s.creneau) return acc;
      const id = s.classe.id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(s);
      return acc;
    }, {} as Record<number, Seance[]>);

    rows = classes
      .filter((c) => selectedClasses.includes(c.id))
      .map((c) => ({
        id: c.id,
        label: c.nom,
        seances: sessionsByClasse[c.id] || []
      }))
      .filter((r) => r.seances.length > 0);
  } else if (groupMode === 'salle') {
    const sessionsBySalle = visibleSeances.reduce((acc, s) => {
      if (!s.creneau) return acc;
      const id = s.salle ? s.salle.id : -1;
      if (!acc[id]) acc[id] = [];
      acc[id].push(s);
      return acc;
    }, {} as Record<number, Seance[]>);

    const roomIdsInSessions = Object.keys(sessionsBySalle).map(Number);
    const activeRooms = [...salles];
    
    // Add any rooms found in sessions that are not in the main list
    roomIdsInSessions.forEach((salleId) => {
      if (salleId !== -1 && !activeRooms.some((r) => r.id === salleId)) {
        const roomFromSeance = visibleSeances.find((s) => s.salle?.id === salleId)?.salle;
        if (roomFromSeance) {
          activeRooms.push(roomFromSeance);
        } else {
          activeRooms.push({ id: salleId, nom: `Salle ${salleId}` });
        }
      }
    });

    rows = activeRooms.map((room) => ({
      id: room.id,
      label: room.nom || room.code || `Salle ${room.id}`,
      seances: sessionsBySalle[room.id] || []
    }));

    if (sessionsBySalle[-1] && sessionsBySalle[-1].length > 0) {
      rows.push({
        id: -1,
        label: 'Sans salle',
        seances: sessionsBySalle[-1]
      });
    }

    rows = rows.filter((r) => r.seances.length > 0);
  }

  // If no rows have active sessions, hide the container
  if (rows.length === 0) return null;

  const headerLabel = groupMode === 'prof' ? 'Professeur' : groupMode === 'classe' ? 'Classe' : 'Salle';

  return (
    <section className="day-section fade-in">
      <h2 className="day-title">{formatDate(dateStr)}</h2>
      <div className="timeline-container">
        <TimelineHeader label={headerLabel} />
        {rows.map((row) => (
          <TimelineRow
            key={row.id}
            rowLabel={row.label}
            seances={row.seances}
            groupMode={groupMode}
          />
        ))}
      </div>
    </section>
  );
};
