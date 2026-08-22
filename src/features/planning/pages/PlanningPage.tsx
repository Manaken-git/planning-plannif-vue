import { useState, useEffect, useMemo } from 'react';
import './PlanningPage.css';
import { WeekGrid } from '../components/organisms/WeekGrid';
import { MonthGrid } from '../components/organisms/MonthGrid';
import { YearGrid } from '../components/organisms/YearGrid';
import { VacancesManager } from '../components/organisms/VacancesManager';
import { SavedPlanningsModal } from '../components/organisms/SavedPlanningsModal';
import { FilterGroup } from '../components/organisms/FilterGroup';
import { StatsCard } from '../components/organisms/StatsCard';
import { DashboardDetailsModal } from '../components/organisms/DashboardDetailsModal';
import { Icon } from '../components/atoms/Icon';
import { WeekDatePicker } from '../components/molecules/WeekDatePicker';
import { mockPlanningData } from '../mock/planningData';
import { formatProfName, type Planning } from '../types/planning';
import type { BadgeType } from '../components/atoms/Badge';
import {
  getMondayStr,
  getMonthLabel,
  getSessionHours,
} from '../utils/planningDateUtils';
import {
  fetchAllPlanningData,
  solvePlanning,
  savePlanningBackend,
  fetchSavedPlanningDetails
} from '../services/planningApi';

function PlanningPage() {
  // State
  const [planningData, setPlanningData] = useState<Planning>(mockPlanningData);
  const [selectedProfs, setSelectedProfs] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [selectedMatieres, setSelectedMatieres] = useState<number[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Advanced pagination/filtering states for large datasets
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year' | 'vacances'>('week');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [scheduleDensity, setScheduleDensity] = useState<'session' | 'compact'>('session');
  const [detailView, setDetailView] = useState<'alerts' | 'classes' | 'subjects' | 'constraints' | null>(null);

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
        target,
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

  const dashboardSummary = useMemo(() => {
    const alerts = profStats.filter((prof) => prof.badgeType !== 'ok');
    const activeClasses = classStats.filter((classe) => classe.hours > 0).length;
    const classBalance = classStats.length ? Math.round((activeClasses / classStats.length) * 100) : 0;
    const plannedHours = matiereStats.reduce((total, matiere) => total + matiere.hours, 0);
    const targetHours = planningData.professeurs.reduce((total, prof) => total + (prof.nb_heures || 0), 0);
    const subjectVolume = targetHours ? Math.min(100, Math.round((plannedHours / targetHours) * 100)) : 0;

    return { alerts, activeClasses, classBalance, subjectVolume };
  }, [profStats, classStats, matiereStats, planningData.professeurs]);

  const detailConfig = useMemo(() => {
    if (!detailView) return null;
    if (detailView === 'alerts') return {
      title: 'Alertes professeurs', subtitle: 'Charge planifiée comparée à l’objectif contractuel', icon: 'bell' as const,
      items: dashboardSummary.alerts.map((prof) => ({ id: prof.id, name: prof.name, value: `${prof.hours.toFixed(1)} h / ${prof.target.toFixed(1)} h`, status: prof.statusLabel, progress: prof.target ? (prof.hours / prof.target) * 100 : 0, tone: prof.badgeType === 'ok' ? 'success' as const : prof.badgeType === 'err' ? 'danger' as const : 'warning' as const }))
    };
    if (detailView === 'classes') {
      const maxHours = Math.max(1, ...classStats.map((classe) => classe.hours));
      return { title: 'Détail des classes', subtitle: 'Répartition des heures par classe', icon: 'users' as const, items: classStats.map((classe) => ({ id: classe.id, name: classe.name, value: `${classe.hours.toFixed(1)} h`, status: classe.statusLabel, progress: (classe.hours / maxHours) * 100, tone: classe.hours > 0 ? 'success' as const : 'danger' as const })) };
    }
    if (detailView === 'subjects') {
      const maxHours = Math.max(1, ...matiereStats.map((matiere) => matiere.hours));
      return { title: 'Volume des matières', subtitle: 'Heures planifiées pour chaque matière', icon: 'book' as const, items: matiereStats.map((matiere) => ({ id: matiere.id, name: matiere.name, value: `${matiere.hours.toFixed(1)} h`, status: matiere.statusLabel, progress: (matiere.hours / maxHours) * 100, tone: matiere.hours > 0 ? 'info' as const : 'warning' as const })) };
    }
    return { title: 'Contraintes et périodes', subtitle: 'Périodes pédagogiques configurées pour les modules', icon: 'calendarDays' as const, items: planningData.matiereClasseConfigs.map((config, index) => ({ id: config.id || index + 1, name: `${config.matiereNom} · ${config.classeNom}`, value: config.volumeHorairePeriode ? `${config.volumeHorairePeriode} h` : 'Volume libre', status: config.dateDebut && config.dateFin ? `${config.dateDebut} → ${config.dateFin}` : 'Sans période', tone: 'info' as const })) };
  }, [detailView, dashboardSummary.alerts, classStats, matiereStats, planningData.matiereClasseConfigs]);


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

  // Initialize the calendar from available data, then allow free date navigation.
  useEffect(() => {
    if (!selectedWeek && uniqueWeeks.length > 0) {
      setSelectedWeek(uniqueWeeks[0]);
    }
  }, [uniqueWeeks, selectedWeek]);

  // Auto-adjust selectedMonthStr if not matching current months
  useEffect(() => {
    if (!selectedMonthStr && uniqueMonths.length > 0) {
      setSelectedMonthStr(uniqueMonths[0]);
    }
  }, [uniqueMonths, selectedMonthStr]);

  // Handlers for week pagination
  const shiftDate = (dateStr: string, days: number) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handlePrevWeek = () => {
    if (selectedWeek) setSelectedWeek(shiftDate(selectedWeek, -7));
  };

  const handleNextWeek = () => {
    if (selectedWeek) setSelectedWeek(shiftDate(selectedWeek, 7));
  };

  // Handlers for month pagination
  const handlePrevMonth = () => {
    const [year, month] = selectedMonthStr.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonthStr(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonthStr.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonthStr(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  // Handlers for year pagination
  const handlePrevYear = () => {
    setSelectedYear((year) => year - 1);
  };

  const handleNextYear = () => {
    setSelectedYear((year) => year + 1);
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
        SemaineType: 'SEMAINE_1'
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

  const handleResetFilters = () => {
    setSelectedProfs(planningData.professeurs.map((p) => p.id));
    setSelectedClasses(planningData.classes.map((c) => c.id));
    setSelectedMatieres(planningData.matieres.map((m) => m.id));
  };

  const handleDetailSelect = (id: number) => {
    if (!detailView || detailView === 'constraints') return;

    const matchingSession = planningData.seances.find((session) => {
      if (detailView === 'alerts') return session.professeur?.id === id;
      if (detailView === 'classes') return session.classe.id === id;
      return session.matiere.id === id;
    });

    if (!matchingSession?.creneau?.debut) {
      setToast({ message: 'Aucune séance planifiée pour cet élément.', type: 'info' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (detailView === 'alerts') {
      setSelectedProfs([id]);
      setSelectedClasses(planningData.classes.map((classe) => classe.id));
      setSelectedMatieres(planningData.matieres.map((matiere) => matiere.id));
    } else if (detailView === 'classes') {
      setSelectedClasses([id]);
      setSelectedProfs(planningData.professeurs.map((professeur) => professeur.id));
      setSelectedMatieres(planningData.matieres.map((matiere) => matiere.id));
    } else {
      setSelectedMatieres([id]);
      setSelectedProfs(planningData.professeurs.map((professeur) => professeur.id));
      setSelectedClasses(planningData.classes.map((classe) => classe.id));
    }

    setSelectedWeek(getMondayStr(matchingSession.creneau.debut.slice(0, 10)));
    setViewMode('week');
    setDetailView(null);
    setToast({ message: 'Élément sélectionné et affiché dans le planning.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
    setTimeout(() => {
      const calendar = document.querySelector('.week-grid-container');
      calendar?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      calendar?.animate([
        { boxShadow: '0 0 0 1px rgba(56, 189, 248, .9), 0 0 40px rgba(56, 189, 248, .42)' },
        { boxShadow: 'var(--shadow)' },
      ], { duration: 1400, easing: 'ease-out' });
    }, 80);
  };



  return (
    <div className={`app-container ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type} fade-in`}>
          <span className="toast-icon">
            {toast.type === 'success' && 'OK'}
            {toast.type === 'error' && 'X'}
            {toast.type === 'info' && <Icon name="info" />}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR FILTERS */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark"><Icon name="cube" /></div>
          <button className="sidebar-menu-btn" type="button" aria-label={isSidebarCollapsed ? 'Ouvrir les filtres' : 'Fermer les filtres'} onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}>
            <Icon name="menu" />
          </button>
        </div>
        <div className="sidebar-filters-scroll"><div className="sidebar-title-row">
          <h2>Filtres</h2>
          <button className="reset-filter-btn" type="button" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        </div>
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
        </div>
        <div className="sidebar-footer">
          <div className="active-filter-pill"><Icon name="flag" /> Filtres actifs <strong>{Number(selectedProfs.length > 0) + Number(selectedClasses.length > 0) + Number(selectedMatieres.length > 0)}</strong></div>
          <button type="button" onClick={() => { setSelectedProfs([]); setSelectedClasses([]); setSelectedMatieres([]); }}><Icon name="close" /> Effacer</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="planning-header">
          <div className="planning-title-block">
            <h1>Tableau de Bord du Planning</h1>
            <p>Pilotage de votre établissement</p>
          </div>
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
                <><Icon name="rocket" /> Lancer la planification</>
              )}
            </button>
            <button
              className="planning-btn secondary-btn"
              onClick={() => setIsSavedModalOpen(true)}
              title="Gérer les plannings sauvegardés"
            >
              <Icon name="grid" /> Plannings
            </button>
            {/* View Switcher Button Group */}
            <div className="view-switcher-group">
              <button
                className={`view-switch-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
                title="Affichage Hebdomadaire"
              >
                <Icon name="calendarDays" /> Semaine
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
                title="Affichage Mensuel"
              >
                <Icon name="calendar" /> Mois
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'year' ? 'active' : ''}`}
                onClick={() => setViewMode('year')}
                title="Affichage Annuel"
              >
                <Icon name="calendar" /> Année
              </button>
              <button
                className={`view-switch-btn ${viewMode === 'vacances' ? 'active' : ''}`}
                onClick={() => setViewMode('vacances')}
                title="Gestion des vacances"
              >
                <Icon name="users" /> Vacances
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD STATS GRID */}
        <section className="stats-grid">
          <StatsCard title="Alertes professeurs" subtitle="Disponibilités à vérifier" icon={<Icon name="bell" />} tone="alert">
            <div className="kpi-line"><strong>{dashboardSummary.alerts.length}</strong><span className="kpi-status">Attention</span></div>
            <div className="kpi-list">
              {dashboardSummary.alerts.slice(0, 2).map((prof, index) => <div key={prof.id}><span><i className={index ? 'dot-warning' : 'dot-danger'} />{prof.name}</span><em>{prof.statusLabel.toLowerCase()}</em></div>)}
              {dashboardSummary.alerts.length === 0 && <div><span><i />Aucune alerte</span><em>Tout va bien</em></div>}
            </div>
            <button className="kpi-link" type="button" onClick={() => setDetailView('alerts')}>Voir toutes les alertes</button>
          </StatsCard>

          <StatsCard title="Charge des classes" subtitle="Équilibre hebdomadaire" icon={<Icon name="users" />} tone="success">
            <div className="kpi-line"><strong>{dashboardSummary.classBalance}%</strong><span className="kpi-status">Équilibrée</span></div>
            <div className="kpi-progress"><span style={{ width: `${dashboardSummary.classBalance}%` }} /></div>
            <div className="kpi-list compact"><div><span><i />Classes planifiées</span><em>{dashboardSummary.activeClasses} classes</em></div><div><span><i className="dot-danger" />Classes vides</span><em>{classStats.length - dashboardSummary.activeClasses} classe</em></div></div>
            <button className="kpi-link" type="button" onClick={() => setDetailView('classes')}>Voir le détail des classes</button>
          </StatsCard>

          <StatsCard title="Volume des matières" subtitle="Heures planifiées / cible" icon={<Icon name="book" />} tone="info">
            <div className="kpi-line"><strong>{dashboardSummary.subjectVolume}%</strong><span className="kpi-status">Bon niveau</span></div>
            <div className="kpi-progress"><span style={{ width: `${dashboardSummary.subjectVolume}%` }} /></div>
            <div className="kpi-list compact subjects">{matiereStats.slice(0, 3).map((matiere) => <div key={matiere.id}><span>{matiere.name}</span><em>{matiere.hours.toFixed(0)} h</em></div>)}</div>
            <button className="kpi-link" type="button" onClick={() => setDetailView('subjects')}>Voir toutes les matières</button>
          </StatsCard>

          <StatsCard title="Calendrier des modules" subtitle="Contraintes et périodes" icon={<Icon name="calendarDays" />} tone="purple">
            <div className="kpi-line"><strong>0</strong><span className="kpi-status">Aucune contrainte</span></div>
            <p className="kpi-empty">Aucune contrainte de période définie.</p>
            <button className="kpi-link" type="button" onClick={() => setDetailView('constraints')}>Gérer les contraintes</button>
          </StatsCard>
        </section>

        {viewMode === 'week' && selectedWeek && (
          <section className="view-controls week-toolbar">
            <div className="control-group date-navigator-group" style={{ width: '100%' }}>
              <div className="date-navigator" style={{ width: '100%' }}>
                <button
                  className="nav-arrow-btn"
                  onClick={handlePrevWeek}
                  title="Semaine précédente"
                >
                  <Icon name="chevronLeft" />
                </button>
                <WeekDatePicker value={selectedWeek} onChange={setSelectedWeek} />
                <button
                  className="nav-arrow-btn"
                  onClick={handleNextWeek}
                  title="Semaine suivante"
                >
                  <Icon name="chevronRight" />
                </button>
                <button className="today-btn" type="button" onClick={() => setSelectedWeek(getMondayStr(new Date().toISOString().slice(0, 10)))}>Aujourd'hui</button>
                <div className="view-options">
                  <button type="button" className={`density-toggle ${scheduleDensity === 'compact' ? 'active' : ''}`} aria-pressed={scheduleDensity === 'compact'} title={scheduleDensity === 'session' ? 'Passer en vue compacte' : 'Passer en vue détaillée'} onClick={() => setScheduleDensity((density) => density === 'session' ? 'compact' : 'session')}>
                    <Icon name="list" /><span>{scheduleDensity === 'session' ? 'Vue détaillée' : 'Vue compacte'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {viewMode === 'month' && selectedMonthStr && (
          <section className="view-controls">
            <div className="control-group date-navigator-group" style={{ width: '100%' }}>
              <span className="control-label">Mois :</span>
              <div className="date-navigator" style={{ width: '100%' }}>
                <button
                  className="nav-arrow-btn"
                  onClick={handlePrevMonth}
                  title="Mois précédent"
                >
                  <Icon name="chevronLeft" />
                </button>
                <div className="date-tabs-container"><span className="date-tab active">{getMonthLabel(selectedMonthStr)}</span></div>
                <button
                  className="nav-arrow-btn"
                  onClick={handleNextMonth}
                  title="Mois suivant"
                >
                  <Icon name="chevronRight" />
                </button>
              </div>
            </div>
          </section>
        )}

        {viewMode === 'year' && selectedYear > 0 && (
          <section className="view-controls">
            <div className="control-group date-navigator-group" style={{ width: '100%' }}>
              <span className="control-label">Année :</span>
              <div className="date-navigator" style={{ width: '100%' }}>
                <button
                  className="nav-arrow-btn"
                  onClick={handlePrevYear}
                  title="Année précédente"
                >
                  <Icon name="chevronLeft" />
                </button>
                <div className="date-tabs-container"><span className="date-tab active">{selectedYear}</span></div>
                <button
                  className="nav-arrow-btn"
                  onClick={handleNextYear}
                  title="Année suivante"
                >
                  <Icon name="chevronRight" />
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
              density={scheduleDensity}
            />
          ) : (
            <div className="modal-empty-state fade-in" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              AucunSemaine disponible dans le planning actuel.
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
              AucuMois disponible dans le planning actuel.
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
              AucunAnnée disponible dans le planning actuel.
            </div>
          )
        ) : (
          <VacancesManager onNotify={(msg, type) => {
            setToast({ message: msg, type });
            setTimeout(() => setToast(null), 3000);
          }} />
        )}
        <footer className="planning-data-footer">
          <div className="footer-filter-chips"><button className="chip-prof" type="button" onClick={() => setSelectedProfs([])}>Professeurs ({selectedProfs.length}) <Icon name="close" /></button><button className="chip-class" type="button" onClick={() => setSelectedClasses([])}>Classes ({selectedClasses.length}) <Icon name="close" /></button><button className="chip-subject" type="button" onClick={() => setSelectedMatieres([])}>Matières ({selectedMatieres.length}) <Icon name="close" /></button></div>
          <div className="footer-note"><Icon name="info" /> Les séances sont affichées en heure locale de l’établissement.</div>
        </footer>
      </main>

      {/* SAVEPlannings MANAGEMENT MODAL */}
      {detailConfig && <DashboardDetailsModal
        isOpen
        title={detailConfig.title}
        subtitle={detailConfig.subtitle}
        icon={detailConfig.icon}
        items={detailConfig.items}
        emptyMessage={detailView === 'constraints' ? 'Aucune contrainte de période n’est encore configurée.' : undefined}
        actionLabel={detailView === 'constraints' ? 'Configurer les périodes' : undefined}
        onAction={detailView === 'constraints' ? () => { setDetailView(null); setViewMode('vacances'); } : undefined}
        onSelect={detailView !== 'constraints' ? handleDetailSelect : undefined}
        onClose={() => setDetailView(null)}
      />}
      <SavedPlanningsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadPlanning={handleLoadPlanning}
        onSaveCurrentPlanning={handleSaveCurrentPlanning}
      />
    </div>
  );
}

export default PlanningPage;



