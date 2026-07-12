import React from 'react';
import './App.css';
import { TimelineContainer } from './components/organisms/TimelineContainer';
import { mockPlanningData } from './mock/planningData';
import type { Seance, Professeur } from './types/planning';

// Helper to extract unique dates from seances
const getUniqueDates = (seances: Seance[]) => {
  const dates = new Set<string>();
  seances.forEach((s) => {
    if (s.creneau && s.creneau.debut) {
      dates.add(s.creneau.debut.substring(0, 10)); // YYYY-MM-DD
    }
  });
  return Array.from(dates).sort();
};

function App() {
  const dates = getUniqueDates(mockPlanningData.seances);
  return (
    <>
      {dates.map((date) => (
        <TimelineContainer
          key={date}
          dateStr={date}
          professors={mockPlanningData.professeurs}
          seances={mockPlanningData.seances.filter((s) => s.creneau?.debut.startsWith(date))}
        />
      ))}
    </>
  );
}

export default App;


