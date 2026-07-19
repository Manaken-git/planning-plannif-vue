import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { TimelineContainer } from './components/organisms/TimelineContainer';
import { FilterGroup } from './components/organisms/FilterGroup';
import { StatsCard } from './components/organisms/StatsCard';
import { StatsRow } from './components/molecules/StatsRow';
import { mockPlanningData } from './mock/planningData';
import type { Planning, Seance } from './types/planning';
import type { BadgeType } from './components/atoms/Badge';

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

// Helper to calculate session duration in hours
const getSessionHours = (seance: Seance) => {
  if (!seance.creneau) return 0;
  const start = new Date(seance.creneau.debut);
  const end = new Date(seance.creneau.fin);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // MS to Hours
};

function App() {
  // State
  const [planningData, setPlanningData] = useState<Planning>(mockPlanningData);
  const [selectedProfs, setSelectedProfs] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [selectedMatieres, setSelectedMatieres] = useState<number[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize filter selections
  useEffect(() => {
    setSelectedProfs(planningData.professeurs.map((p) => p.id));
    setSelectedClasses(planningData.classes.map((c) => c.id));
    setSelectedMatieres(planningData.matieres.map((m) => m.id));
  }, [planningData.professeurs, planningData.classes, planningData.matieres]);

  // Extract dates
  const dates = useMemo(() => getUniqueDates(planningData.seances), [planningData.seances]);

  // Dynamic Dashboard Stats Calculations (based on all planning data)
  const profStats = useMemo(() => {
    const hoursMap: Record<number, number> = {};
    planningData.professeurs.forEach((p) => { hoursMap[p.id] = 0; });
    planningData.seances.forEach((s) => {
      if (s.professeur) {
        hoursMap[s.professeur.id] = (hoursMap[s.professeur.id] || 0) + getSessionHours(s);
      }
    });

    return planningData.professeurs.map((prof) => {
      const hours = hoursMap[prof.id] || 0;
      const target = prof.nb_heures || 0;
      let badgeType: BadgeType = 'ok';
      let statusLabel = 'OK';

      if (target > 0) {
        if (hours === target) {
          badgeType = 'ok';
          statusLabel = 'OK';
        } else if (hours < target) {
          badgeType = 'warn';
          statusLabel = 'SOUS-ALLOUÉ';
        } else {
          badgeType = 'err';
          statusLabel = 'SURCHARGÉ';
        }
      }

      return {
        id: prof.id,
        name: prof.nom,
        hours,
        badgeType,
        statusLabel
      };
    });
  }, [planningData]);

  const classStats = useMemo(() => {
    const hoursMap: Record<number, number> = {};
    planningData.classes.forEach((c) => { hoursMap[c.id] = 0; });
    planningData.seances.forEach((s) => {
      if (s.classe) {
        hoursMap[s.classe.id] = (hoursMap[s.classe.id] || 0) + getSessionHours(s);
      }
    });

    return planningData.classes.map((classe) => {
      const hours = hoursMap[classe.id] || 0;
      return {
        id: classe.id,
        name: classe.nom,
        hours,
        badgeType: (hours > 0 ? 'ok' : 'warn') as BadgeType,
        statusLabel: hours > 0 ? 'OK' : 'VIDE'
      };
    });
  }, [planningData]);

  const matiereStats = useMemo(() => {
    const hoursMap: Record<number, number> = {};
    planningData.matieres.forEach((m) => { hoursMap[m.id] = 0; });
    planningData.seances.forEach((s) => {
      if (s.matiere) {
        hoursMap[s.matiere.id] = (hoursMap[s.matiere.id] || 0) + getSessionHours(s);
      }
    });

    return planningData.matieres.map((matiere) => {
      const hours = hoursMap[matiere.id] || 0;
      return {
        id: matiere.id,
        name: matiere.nom,
        hours,
        badgeType: (hours > 0 ? 'ok' : 'warn') as BadgeType,
        statusLabel: hours > 0 ? 'OK' : 'VIDE'
      };
    });
  }, [planningData]);

  // Launch planning API call with local fallback simulation
  const handleLaunchPlanning = async () => {
    setIsPlanning(true);
    setToast({ message: "Lancement de la planification via l'API ordonnanceur...", type: 'info' });

    try {
      const response = await fetch('http://localhost:8080/planning/solve', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du calcul de planification par le serveur.');
      }

      const updatedPlanning: Planning = await response.json();
      setPlanningData(updatedPlanning);
      setToast({ message: "Planification recalculée avec succès via l'API !", type: 'success' });
    } catch (err) {
      console.warn("Échec de l'appel API, bascule sur le solveur simulé en local...", err);
      setToast({ message: "API non disponible. Simulation de la planification en cours...", type: 'info' });

      // Simulate solver calculation duration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Visual shuffling of seances to demonstrate solver repositioning
      const updatedSeances = [...planningData.seances];
      if (updatedSeances.length >= 2) {
        // Swap creneaux of two randomly chosen sessions to physically move bars on the Gantt chart
        const count = Math.min(3, Math.floor(updatedSeances.length / 2));
        for (let i = 0; i < count; i++) {
          const idx1 = Math.floor(Math.random() * updatedSeances.length);
          let idx2 = Math.floor(Math.random() * updatedSeances.length);
          while (idx1 === idx2 && updatedSeances.length > 1) {
            idx2 = Math.floor(Math.random() * updatedSeances.length);
          }
          const c1 = updatedSeances[idx1].creneau;
          const c2 = updatedSeances[idx2].creneau;
          if (c1 && c2) {
            updatedSeances[idx1] = { ...updatedSeances[idx1], creneau: c2 };
            updatedSeances[idx2] = { ...updatedSeances[idx2], creneau: c1 };
          }
        }
      }

      // Generate a new soft score as mock solver result
      const randomSoft = -Math.floor(Math.random() * 8);
      const updatedScore = `0hard/${randomSoft}soft`;

      setPlanningData((prev) => ({
        ...prev,
        seances: updatedSeances,
        score: updatedScore
      }));

      setToast({ message: "Planification réussie (Simulation locale terminée) !", type: 'success' });
    } finally {
      setIsPlanning(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Filter handlers
  const handleToggleProfAll = (checked: boolean) => {
    setSelectedProfs(checked ? planningData.professeurs.map((p) => p.id) : []);
  };

  const handleToggleProfItem = (id: number, checked: boolean) => {
    setSelectedProfs((prev) =>
      checked ? [...prev, id] : prev.filter((pId) => pId !== id)
    );
  };

  const handleToggleClasseAll = (checked: boolean) => {
    setSelectedClasses(checked ? planningData.classes.map((c) => c.id) : []);
  };

  const handleToggleClasseItem = (id: number, checked: boolean) => {
    setSelectedClasses((prev) =>
      checked ? [...prev, id] : prev.filter((cId) => cId !== id)
    );
  };

  const handleToggleMatiereAll = (checked: boolean) => {
    setSelectedMatieres(checked ? planningData.matieres.map((m) => m.id) : []);
  };

  const handleToggleMatiereItem = (id: number, checked: boolean) => {
    setSelectedMatieres((prev) =>
      checked ? [...prev, id] : prev.filter((mId) => mId !== id)
    );
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type} fade-in`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✗'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR FILTERS */}
      <aside className="sidebar">
        <h2>Filtres</h2>
        <FilterGroup
          title="Professeurs"
          type="prof"
          items={planningData.professeurs.map((p) => ({ id: p.id, name: p.nom }))}
          selectedIds={selectedProfs}
          onToggleAll={handleToggleProfAll}
          onToggleItem={handleToggleProfItem}
        />
        <FilterGroup
          title="Classes"
          type="classe"
          items={planningData.classes.map((c) => ({ id: c.id, name: c.nom }))}
          selectedIds={selectedClasses}
          onToggleAll={handleToggleClasseAll}
          onToggleItem={handleToggleClasseItem}
        />
        <FilterGroup
          title="Matières"
          type="matiere"
          items={planningData.matieres.map((m) => ({ id: m.id, name: m.nom }))}
          selectedIds={selectedMatieres}
          onToggleAll={handleToggleMatiereAll}
          onToggleItem={handleToggleMatiereItem}
        />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header>
          <h1>Tableau de Bord du Planning</h1>
          <div className="header-actions">
            <button
              className={`planning-btn ${isPlanning ? 'loading' : ''}`}
              onClick={handleLaunchPlanning}
              disabled={isPlanning}
            >
              {isPlanning ? (
                <>
                  <span className="spinner"></span>
                  Planification...
                </>
              ) : (
                'Lancer la planification'
              )}
            </button>
            <div className="score">
              Score: {typeof planningData.score === 'string' ? planningData.score : '0hard/0soft'}
            </div>
          </div>
        </header>

        {/* DASHBOARD STATS GRID */}
        <section className="stats-grid">
          <StatsCard title="Alerte Professeurs">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {profStats.map((stat) => (
                  <StatsRow
                    key={stat.id}
                    name={stat.name}
                    hours={stat.hours}
                    badgeType={stat.badgeType}
                    statusLabel={stat.statusLabel}
                  />
                ))}
              </tbody>
            </table>
          </StatsCard>

          <StatsCard title="Charge Classes">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {classStats.map((stat) => (
                  <StatsRow
                    key={stat.id}
                    name={stat.name}
                    hours={stat.hours}
                    badgeType={stat.badgeType}
                    statusLabel={stat.statusLabel}
                  />
                ))}
              </tbody>
            </table>
          </StatsCard>

          <StatsCard title="Volume Matières">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {matiereStats.map((stat) => (
                  <StatsRow
                    key={stat.id}
                    name={stat.name}
                    hours={stat.hours}
                    badgeType={stat.badgeType}
                    statusLabel={stat.statusLabel}
                  />
                ))}
              </tbody>
            </table>
          </StatsCard>

          <StatsCard title="Calendrier des Modules">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Aucune contrainte de période définie.
            </p>
          </StatsCard>
        </section>

        {/* GANTT DAY TIMELINES */}
        {dates.map((date) => (
          <TimelineContainer
            key={date}
            dateStr={date}
            professors={planningData.professeurs}
            seances={planningData.seances.filter((s) => s.creneau?.debut.startsWith(date))}
            selectedProfs={selectedProfs}
            selectedClasses={selectedClasses}
            selectedMatieres={selectedMatieres}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
