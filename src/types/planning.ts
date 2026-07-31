export interface Professeur {
  id: number;
  nom: string;
  prenom?: string;
  email?: string;
  nb_heures?: number;
  maxHeuresParJour?: number;
  maxHeuresParSemaine?: number;
  maxHeuresParSeance?: number;
}

export function formatProfName(prof?: Professeur | null): string {
  if (!prof) return '';
  return prof.prenom ? `${prof.prenom} ${prof.nom}` : prof.nom;
}

export interface Classe {
  id: number;
  nom: string;
}

export interface Matiere {
  id: number;
  nom: string;
}

export interface Eleve {
  id: number;
  nom: string;
  prenom?: string;
  classe?: Classe | null;
}

export interface Salle {
  id: number;
  code?: string;
  nom?: string;
  capacite?: number;
  type?: string;
}

export interface Creneau {
  id: number;
  debut: string; // ISO LocalDateTime string e.g. "2026-07-13T08:00:00"
  fin: string;   // ISO LocalDateTime string e.g. "2026-07-13T09:30:00"
}

export interface Seance {
  id: number;
  professeur: Professeur | null;
  classe: Classe;
  matiere: Matiere;
  creneau: Creneau | null;
  salle?: Salle | null;
  type?: 'COURS' | 'TP' | 'EXAMEN' | string;
}

export interface MatiereClasseConfig {
  id?: number;
  classeId: number;
  classeNom: string;
  matiereId: number;
  matiereNom: string;
  dateDebut?: string; // ISO LocalDate string e.g. "2026-01-01"
  dateFin?: string;   // ISO LocalDate string e.g. "2026-06-30"
  volumeHorairePeriode?: number;
}

export interface Score {
  hardScore: number;
  softScore: number;
  feasible?: boolean;
  zero?: boolean;
  initScore?: number;
  solutionInitialized?: boolean;
}

export interface Planning {
  seances: Seance[];
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  salles?: Salle[];
  eleves?: Eleve[];
  matiereClasseConfigs: MatiereClasseConfig[];
  score?: Score | string;
}

export interface Vacances {
  id?: number;
  nom: string;
  dateDebut: string; // ISO LocalDate string e.g. "2026-01-01"
  dateFin: string;   // ISO LocalDate string e.g. "2026-01-08"
}
