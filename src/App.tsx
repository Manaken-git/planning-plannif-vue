import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { WeekGrid } from './components/organisms/WeekGrid';
import { MonthGrid } from './components/organisms/MonthGrid';
import { YearGrid } from './components/organisms/YearGrid';
import { VacancesManager } from './components/organisms/VacancesManager';
import { SavedPlanningsModal } from './components/organisms/SavedPlanningsModal';
import { FilterGroup } from './components/organisms/FilterGroup';
import { StatsCard } from './components/organisms/StatsCard';
import { StatsRow } from './components/molecules/StatsRow';
import { mockPlanningData } from './mock/planningData';
import { formatProfName, type Planning, type Seance } from './types/planning';
import type { BadgeType } from './components/atoms/Badge';
import {
  fetchAllPlanningData,
  solvePlanning,
  savePlanningBackend,
  fetchSavedPlanningDetails
} from './services/planningApi';

// Helper to get Monday ISO date string for a given date (starts on Monday)
const getMondayStr = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday to get Monday
  const monday = new Date(date.setDate(diff));
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to get week label "Du 12/02 au 18/02 2026"
const getWeekLabel = (mondayStr: string) => {
  const monday = new Date(mondayStr);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const format = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `Du ${format(monday)} au ${format(sunday)} ${sunday.getFullYear()}`;
};



// Helper to calculate session duration in hours
const getSessionHours = (seance: Seance) => {
  if (!seance.creneau) return 0;
  const start = new Date(seance.creneau.debut);
  const end = new Date(seance.creneau.fin);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // MS to Hours
};

// Helper to format score object or string
const formatScore = (score: any): string => {
  if (!score) return '0hard/0soft';
  if (typeof score === 'string') return score;
  if (typeof score === 'object') {
    const hard = score.hardScore !== undefined ? score.hardScore : (score.hard !== undefined ? score.hard : 0);
    const soft = score.softScore !== undefined ? score.softScore : (score.soft !== undefined ? score.soft : 0);
    return `${hard}hard/${soft}soft`;
  }
  return '0hard/0soft';
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
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year' | 'vacances'>('week');
  const [profSearch, setProfSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [matiereSearch, setMatiereSearch] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

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


  // Derived state for unique weeks from current seances
  const uniqueWeeks = useMemo(() => {
    const weeks = new Set<string>();
    planningData.seances.forEach((s) => {
      if (s.creneau?.debut) {
        weeks.add(getMondayStr(s.creneau.debut.substring(0, 10)));
      }
    });
    return Array.from(weeks).sort();
  }, [planningData.seances]);

  // Derived unique months (YYYY-MM)
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    planningData.seances.forEach((s) => {
      if (s.creneau?.debut) {
        monthsSet.add(s.creneau.debut.substring(0, 7)); // YYYY-MM
      }
    });
    return Array.from(monthsSet).sort();
  }, [planningData.seances]);

  // Derived unique years (number YYYY)
  const uniqueYears = useMemo(() => {
    const yearsSet = new Set<number>();
    planningData.seances.forEach((s) => {
      if (s.creneau?.debut) {
        yearsSet.add(new Date(s.creneau.debut).getFullYear());
      }
    });
    return Array.from(yearsSet).sort();
  }, [planningData.seances]);

  // Auto-adjust selectedWeek if not matching current weeks
  useEffect(() => {
    if (uniqueWeeks.length > 0) {
      if (!selectedWeek || !uniqueWeeks.includes(selectedWeek)) {
        setSelectedWeek(uniqueWeeks[0]);
      }
    }
  }, [uniqueWeeks, selectedWeek]);

  // Auto-adjust selectedMonthStr if not matching current months
  useEffect(() => {
    if (uniqueMonths.length > 0) {
      if (!selectedMonthStr || !uniqueMonths.includes(selectedMonthStr)) {
        setSelectedMonthStr(uniqueMonths[0]);
      }
    }
  }, [uniqueMonths, selectedMonthStr]);

  // Auto-adjust selectedYear if not matching current years
  useEffect(() => {
    if (uniqueYears.length > 0) {
      if (!selectedYear || !uniqueYears.includes(selectedYear)) {
        setSelectedYear(uniqueYears[0]);
      }
    }
  }, [uniqueYears, selectedYear]);

  // Handlers for week pagination
  const handlePrevWeek = () => {
    const idx = uniqueWeeks.indexOf(selectedWeek);
    if (idx > 0) {
      setSelectedWeek(uniqueWeeks[idx - 1]);
    }
  };

  const handleNextWeek = () => {
    const idx = uniqueWeeks.indexOf(selectedWeek);
    if (idx < uniqueWeeks.length - 1) {
      setSelectedWeek(uniqueWeeks[idx + 1]);
    }
  };

  // Handlers for month pagination
  const handlePrevMonth = () => {
    const idx = uniqueMonths.indexOf(selectedMonthStr);
    if (idx > 0) {
      setSelectedMonthStr(uniqueMonths[idx - 1]);
    }
  };

  const handleNextMonth = () => {
    const idx = uniqueMonths.indexOf(selectedMonthStr);
    if (idx < uniqueMonths.length - 1) {
      setSelectedMonthStr(uniqueMonths[idx + 1]);
    }
  };

  // Handlers for year pagination
  const handlePrevYear = () => {
    const idx = uniqueYears.indexOf(selectedYear);
    if (idx > 0) {
      setSelectedYear(uniqueYears[idx - 1]);
    }
  };

  const handleNextYear = () => {
    const idx = uniqueYears.indexOf(selectedYear);
    if (idx < uniqueYears.length - 1) {
      setSelectedYear(uniqueYears[idx + 1]);
    }
  };

  // Helper to format month label "Février 2026"
  const getMonthLabel = (mStr: string) => {
    const [y, m] = mStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  // Callback to select week when clicking day in Year view heatmap
  const handleSelectDayFromYear = (dateStr: string) => {
    const mondayStr = getMondayStr(dateStr);
    setSelectedWeek(mondayStr);
    setViewMode('week');
  };

  // Handler to save the current generated schedule
  const handleSaveCurrentPlanning = async (name: string) => {
    if (!planningData.seances || planningData.seances.length === 0) {
      setToast({ message: "Impossible d'enregistrer un planning vide !", type: 'error' });
      setTimeout(() => setToast(null), 3500);
      throw new Error("Planning vide");
    }

    // 1. Gather all unique creneaux
    const creneauxMap = new Map<number, any>();
    planningData.seances.forEach((s) => {
      if (s.creneau) {
        creneauxMap.set(s.creneau.id, {
          id: s.creneau.id,
          debut: s.creneau.debut,
          fin: s.creneau.fin,
          semaineType: 'SEMAINE_1'
        });
      }
    });

    // 2. Map current seances to SeanceSaveDTO format
    const seancesSave = planningData.seances.map((s) => ({
      id: null,
      professeurId: s.professeur?.id || null,
      classeId: s.classe.id,
      matiereId: s.matiere.id,
      salleId: s.salle?.id || null,
      creneauId: s.creneau?.id || null,
      type: s.type || 'COURS'
    }));

    const payload = {
      id: null,
      nom: name,
      dateCreation: new Date().toISOString(),
      seances: seancesSave,
      creneaux: Array.from(creneauxMap.values())
    };

    await savePlanningBackend(payload);
    setToast({ message: `Planning "${name}" enregistré avec succès !`, type: 'success' });
    setTimeout(() => setToast(null), 3500);
  };

  // Handler to load a saved schedule and reconstruct objects in client state
  const handleLoadPlanning = async (id: number) => {
    const savedPlanning = await fetchSavedPlanningDetails(id);
    if (!savedPlanning || !savedPlanning.seances) {
      throw new Error("Planning invalide");
    }

    const reconstructedSeances = savedPlanning.seances.map((sDto: any) => {
      const professeur = planningData.professeurs.find(
        (p) => formatProfName(p) === sDto.professeurNomComplet
      ) || null;

      const classe = planningData.classes.find(
        (c) => c.nom === sDto.classeNom
      ) || { id: Math.floor(Math.random() * -1000), nom: sDto.classeNom };

      const matiere = planningData.matieres.find(
        (m) => m.nom === sDto.matiereNom
      ) || { id: Math.floor(Math.random() * -1000), nom: sDto.matiereNom };

      const salle = planningData.salles?.find(
        (s) => s.code === sDto.salleCode || s.nom === sDto.salleCode
      ) || null;

      const creneau = sDto.debut && sDto.fin ? {
        id: Math.floor(Math.random() * 1000000),
        debut: sDto.debut,
        fin: sDto.fin
      } : null;

      return {
        id: sDto.id,
        professeur,
        classe,
        matiere,
        creneau,
        salle,
        type: 'COURS'
      };
    });

    setPlanningData((prev) => ({
      ...prev,
      seances: reconstructedSeances,
      score: '0hard/0soft'
    }));

    setToast({ message: `Planning "${savedPlanning.nom}" chargé avec succès !`, type: 'success' });
    setTimeout(() => setToast(null), 3500);
  };


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
            <button
              className="planning-btn secondary-btn"
              onClick={() => setIsSavedModalOpen(true)}
              title="Gérer les plannings sauvegardés"
            >
              📁 Plannings
            </button>
            <div className="score">
              Score: {formatScore(planningData.score)}
            </div>

            {/* View Switcher Button Group */}
            <div className="view-switcher-group">
              <button
                className={`view-switch-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
                title="Affichage Hebdomadaire"
              >
                🗓️ Semaine
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
                title="Affichage Mensuel"
              >
                📅 Mois
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'year' ? 'active' : ''}`}
                onClick={() => setViewMode('year')}
                title="Affichage Annuel"
              >
                📊 Année
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

        {viewMode === 'week' && uniqueWeeks.length > 0 && (
          <section className="view-controls">
            <div className="control-group date-navigator-group" style={{ width: '100%' }}>
              <span className="control-label">Semaine :</span>
              <div className="date-navigator" style={{ width: '100%' }}>
                <button
                  className="nav-arrow-btn"
                  onClick={handlePrevWeek}
                  disabled={uniqueWeeks.indexOf(selectedWeek) === 0}
                  title="Semaine précédente"
                >
                  ◀
                </button>
                <div className="date-tabs-container">
                  {uniqueWeeks.map((weekStr) => (
                    <button
                      key={weekStr}
                      className={`date-tab ${selectedWeek === weekStr ? 'active' : ''}`}
                      onClick={() => setSelectedWeek(weekStr)}
                    >
                      {getWeekLabel(weekStr)}
                    </button>
                  ))}
                </div>
                <button
                  className="nav-arrow-btn"
                  onClick={handleNextWeek}
                  disabled={uniqueWeeks.indexOf(selectedWeek) === uniqueWeeks.length - 1}
                  title="Semaine suivante"
                >
                  ▶
                </button>
              </div>
            </div>
          </section>
        )}

        {viewMode === 'month' && uniqueMonths.length > 0 && (
          <section className="view-controls">
            <div className="control-group date-navigator-group" style={{ width: '100%' }}>
              <span className="control-label">Mois :</span>
              <div className="date-navigator" style={{ width: '100%' }}>
                <button
                  className="nav-arrow-btn"
                  onClick={handlePrevMonth}
                  disabled={uniqueMonths.indexOf(selectedMonthStr) === 0}
                  title="Mois précédent"
                >
                  ◀
                </button>
                <div className="date-tabs-container">
                  {uniqueMonths.map((mStr) => (
                    <button
                      key={mStr}
                      className={`date-tab ${selectedMonthStr === mStr ? 'active' : ''}`}
                      onClick={() => setSelectedMonthStr(mStr)}
                    >
                      {getMonthLabel(mStr)}
                    </button>
                  ))}
                </div>
                <button
                  className="nav-arrow-btn"
                  onClick={handleNextMonth}
                  disabled={uniqueMonths.indexOf(selectedMonthStr) === uniqueMonths.length - 1}
                  title="Mois suivant"
                >
                  ▶
                </button>
              </div>
            </div>
          </section>
        )}

        {viewMode === 'year' && uniqueYears.length > 0 && (
          <section className="view-controls">
            <div className="control-group date-navigator-group" style={{ width: '100%' }}>
              <span className="control-label">Année :</span>
              <div className="date-navigator" style={{ width: '100%' }}>
                <button
                  className="nav-arrow-btn"
                  onClick={handlePrevYear}
                  disabled={uniqueYears.indexOf(selectedYear) === 0}
                  title="Année précédente"
                >
                  ◀
                </button>
                <div className="date-tabs-container">
                  {uniqueYears.map((yr) => (
                    <button
                      key={yr}
                      className={`date-tab ${selectedYear === yr ? 'active' : ''}`}
                      onClick={() => setSelectedYear(yr)}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
                <button
                  className="nav-arrow-btn"
                  onClick={handleNextYear}
                  disabled={uniqueYears.indexOf(selectedYear) === uniqueYears.length - 1}
                  title="Année suivante"
                >
                  ▶
                </button>
              </div>
            </div>
          </section>
        )}

        {/* DETAILED VIEW RENDER BRANCHES */}
        {viewMode === 'week' ? (
          selectedWeek ? (
            <WeekGrid
              weekStartStr={selectedWeek}
              seances={planningData.seances}
              selectedProfs={selectedProfs}
              selectedClasses={selectedClasses}
              selectedMatieres={selectedMatieres}
            />
          ) : (
            <div className="modal-empty-state fade-in" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              Aucune semaine disponible dans le planning actuel.
            </div>
          )
        ) : viewMode === 'month' ? (
          selectedMonthStr ? (
            <MonthGrid
              monthStr={selectedMonthStr}
              seances={planningData.seances}
              selectedProfs={selectedProfs}
              selectedClasses={selectedClasses}
              selectedMatieres={selectedMatieres}
            />
          ) : (
            <div className="modal-empty-state fade-in" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              Aucun mois disponible dans le planning actuel.
            </div>
          )
        ) : viewMode === 'year' ? (
          selectedYear ? (
            <YearGrid
              year={selectedYear}
              seances={planningData.seances}
              selectedProfs={selectedProfs}
              selectedClasses={selectedClasses}
              selectedMatieres={selectedMatieres}
              onSelectDay={handleSelectDayFromYear}
            />
          ) : (
            <div className="modal-empty-state fade-in" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              Aucune année disponible dans le planning actuel.
            </div>
          )
        ) : (
          <VacancesManager onNotify={(msg, type) => {
            setToast({ message: msg, type });
            setTimeout(() => setToast(null), 3000);
          }} />
        )}
      </main>

      {/* SAVED PLANNINGS MANAGEMENT MODAL */}
      <SavedPlanningsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadPlanning={handleLoadPlanning}
        onSaveCurrentPlanning={handleSaveCurrentPlanning}
      />
    </div>
  );
}

export default App;
