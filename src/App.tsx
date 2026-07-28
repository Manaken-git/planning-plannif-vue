import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { TimelineContainer } from './components/organisms/TimelineContainer';
import { DayGrid } from './components/organisms/DayGrid';
import { VacancesManager } from './components/organisms/VacancesManager';
import { FilterGroup } from './components/organisms/FilterGroup';
import { StatsCard } from './components/organisms/StatsCard';
import { StatsRow } from './components/molecules/StatsRow';
import { mockPlanningData } from './mock/planningData';
import { formatProfName, type Planning, type Seance } from './types/planning';
import type { BadgeType } from './components/atoms/Badge';
import { fetchAllPlanningData, solvePlanning } from './services/planningApi';

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

  // Advanced pagination/filtering states for large datasets
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [groupMode, setGroupMode] = useState<'prof' | 'classe' | 'salle'>('prof');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'vacances'>('timeline');
  const [profSearch, setProfSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [matiereSearch, setMatiereSearch] = useState('');

  // Fetch initial data from plannif-data API
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const data = await fetchAllPlanningData();
        const hasData =
          data.classes.length > 0 ||
          data.professeurs.length > 0 ||
          data.seances.length > 0 ||
          data.matieres.length > 0;

        if (hasData) {
          setPlanningData((prev) => ({
            ...prev,
            classes: data.classes.length > 0 ? data.classes : prev.classes,
            professeurs: data.professeurs.length > 0 ? data.professeurs : prev.professeurs,
            seances: data.seances.length > 0 ? data.seances : prev.seances,
            matieres: data.matieres.length > 0 ? data.matieres : prev.matieres,
            salles: data.salles.length > 0 ? data.salles : prev.salles,
            eleves: data.eleves.length > 0 ? data.eleves : prev.eleves,
          }));
          setToast({ message: "Données alimentées via le projet plannif-data (/planning-data/*) !", type: 'success' });
          setTimeout(() => setToast(null), 3500);
        }
      } catch (err) {
        console.warn("Impossible de charger les données plannif-data, utilisation du mode démo / mock", err);
      }
    };

    loadBackendData();
  }, []);

  // Initialize filter selections when planningData components change
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
        name: formatProfName(prof),
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

  // Filter stats results based on card search inputs
  const filteredProfStats = useMemo(() => {
    return profStats.filter((p) => p.name.toLowerCase().includes(profSearch.toLowerCase()));
  }, [profStats, profSearch]);

  const filteredClassStats = useMemo(() => {
    return classStats.filter((c) => c.name.toLowerCase().includes(classSearch.toLowerCase()));
  }, [classStats, classSearch]);

  const filteredMatiereStats = useMemo(() => {
    return matiereStats.filter((m) => m.name.toLowerCase().includes(matiereSearch.toLowerCase()));
  }, [matiereStats, matiereSearch]);

  // Adjust selectedDate if the loaded dataset doesn't contain it anymore
  useEffect(() => {
    if (selectedDate !== 'all' && dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  // Handlers for date pagination buttons
  const handlePrevDay = () => {
    if (selectedDate === 'all') return;
    const currentIndex = dates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    }
  };

  const handleNextDay = () => {
    if (selectedDate === 'all') return;
    const currentIndex = dates.indexOf(selectedDate);
    if (currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1]);
    }
  };

  // Select which dates are rendered based on selectedDate tab
  const renderedDates = useMemo(() => {
    if (selectedDate === 'all') return dates;
    return dates.includes(selectedDate) ? [selectedDate] : dates.slice(0, 1);
  }, [dates, selectedDate]);


  // Launch planning API call with local fallback simulation
  const handleLaunchPlanning = async () => {
    setIsPlanning(true);
    setToast({ message: "Lancement de la planification via GET /planning/solve...", type: 'info' });

    try {
      const result = await solvePlanning();

      if (Array.isArray(result)) {
        setPlanningData((prev) => ({
          ...prev,
          seances: result,
        }));
      } else if (result && typeof result === 'object') {
        setPlanningData((prev) => ({
          ...prev,
          ...result,
          seances: result.seances || prev.seances,
          score: result.score !== undefined ? result.score : prev.score,
        }));
      }

      setToast({ message: "Planification recalculée avec succès via /planning/solve !", type: 'success' });
    } catch (err) {
      console.warn("Échec de l'appel API /planning/solve, bascule sur le solveur simulé en local...", err);
      setToast({ message: "API /planning/solve non disponible. Simulation de la planification en cours...", type: 'info' });

      // Simulate solver calculation duration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Visual shuffling of seances to demonstrate solver repositioning
      const updatedSeances = [...planningData.seances];
      if (updatedSeances.length >= 2) {
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

  const handleSelectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setViewMode('timeline');
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
          items={planningData.professeurs.map((p) => ({ id: p.id, name: formatProfName(p) }))}
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

            {/* View Switcher Button Group */}
            <div className="view-switcher-group">
              <button
                className={`view-switch-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                onClick={() => setViewMode('timeline')}
                title="Affichage en Frise Chronologique"
              >
                📊 Frise
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Affichage en Grille Calendrier"
              >
                📅 Grille
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'vacances' ? 'active' : ''}`}
                onClick={() => setViewMode('vacances')}
                title="Gestion des Vacances"
              >
                🌴 Vacances
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD STATS GRID */}
        <section className="stats-grid">
          <StatsCard
            title="Alerte Professeurs"
            searchQuery={profSearch}
            onSearchChange={setProfSearch}
            searchPlaceholder="Filtrer profs..."
          >
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucun prof trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProfStats.map((stat) => (
                    <StatsRow
                      key={stat.id}
                      name={stat.name}
                      hours={stat.hours}
                      badgeType={stat.badgeType}
                      statusLabel={stat.statusLabel}
                    />
                  ))
                )}
              </tbody>
            </table>
          </StatsCard>

          <StatsCard
            title="Charge Classes"
            searchQuery={classSearch}
            onSearchChange={setClassSearch}
            searchPlaceholder="Filtrer classes..."
          >
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredClassStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucune classe trouvée
                    </td>
                  </tr>
                ) : (
                  filteredClassStats.map((stat) => (
                    <StatsRow
                      key={stat.id}
                      name={stat.name}
                      hours={stat.hours}
                      badgeType={stat.badgeType}
                      statusLabel={stat.statusLabel}
                    />
                  ))
                )}
              </tbody>
            </table>
          </StatsCard>

          <StatsCard
            title="Volume Matières"
            searchQuery={matiereSearch}
            onSearchChange={setMatiereSearch}
            searchPlaceholder="Filtrer matières..."
          >
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatiereStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Aucune matière trouvée
                    </td>
                  </tr>
                ) : (
                  filteredMatiereStats.map((stat) => (
                    <StatsRow
                      key={stat.id}
                      name={stat.name}
                      hours={stat.hours}
                      badgeType={stat.badgeType}
                      statusLabel={stat.statusLabel}
                    />
                  ))
                )}
              </tbody>
            </table>
          </StatsCard>

          <StatsCard title="Calendrier des Modules">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '8px' }}>
              Aucune contrainte de période définie.
            </p>
          </StatsCard>
        </section>

        {/* VIEWCONTROLS: GROUPING AND DATE NAVIGATION */}
        {viewMode === 'timeline' && (
          <section className="view-controls">
            <div className="control-group">
              <span className="control-label">Grouper par :</span>
              <div className="pill-selector">
                <button
                  className={`pill-btn ${groupMode === 'prof' ? 'active' : ''}`}
                  onClick={() => setGroupMode('prof')}
                >
                  👤 Professeurs
                </button>
                <button
                  className={`pill-btn ${groupMode === 'classe' ? 'active' : ''}`}
                  onClick={() => setGroupMode('classe')}
                >
                  👥 Classes
                </button>
                <button
                  className={`pill-btn ${groupMode === 'salle' ? 'active' : ''}`}
                  onClick={() => setGroupMode('salle')}
                >
                  🏫 Salles
                </button>
              </div>
            </div>

            {dates.length > 0 && (
              <div className="control-group date-navigator-group">
                <span className="control-label">Date :</span>
                <div className="date-navigator">
                  <button
                    className="nav-arrow-btn"
                    onClick={handlePrevDay}
                    disabled={selectedDate === 'all' || dates.indexOf(selectedDate) === 0}
                    title="Jour précédent"
                  >
                    ◀
                  </button>
                  <div className="date-tabs-container">
                    <button
                      className={`date-tab ${selectedDate === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedDate('all')}
                    >
                      Toutes les dates
                    </button>
                    {dates.map((dateStr) => {
                      const dateObj = new Date(dateStr);
                      const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      });
                      return (
                        <button
                          key={dateStr}
                          className={`date-tab ${selectedDate === dateStr ? 'active' : ''}`}
                          onClick={() => setSelectedDate(dateStr)}
                        >
                          {formattedDate}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="nav-arrow-btn"
                    onClick={handleNextDay}
                    disabled={selectedDate === 'all' || dates.indexOf(selectedDate) === dates.length - 1}
                    title="Jour suivant"
                  >
                    ▶
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* DETAILED GANTT TIMELINES OR COMPACT CALENDAR GRID */}
        {viewMode === 'timeline' ? (
          renderedDates.map((date) => (
            <TimelineContainer
              key={date}
              dateStr={date}
              groupMode={groupMode}
              professors={planningData.professeurs}
              classes={planningData.classes}
              salles={planningData.salles || []}
              seances={planningData.seances.filter((s) => s.creneau?.debut.startsWith(date))}
              selectedProfs={selectedProfs}
              selectedClasses={selectedClasses}
              selectedMatieres={selectedMatieres}
            />
          ))
        ) : viewMode === 'grid' ? (
          <DayGrid
            dates={dates}
            seances={planningData.seances}
            selectedProfs={selectedProfs}
            selectedClasses={selectedClasses}
            selectedMatieres={selectedMatieres}
            onSelectDay={handleSelectDay}
          />
        ) : (
          <VacancesManager onNotify={(msg, type) => {
            setToast({ message: msg, type });
            setTimeout(() => setToast(null), 3000);
          }} />
        )}
      </main>
    </div>
  );
}

export default App;
