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

export interface Classe {
  id: number;
  nom: string;
}

export interface Matiere {
  id: number;
  nom: string;
  volumeHoraireAnnuel?: number;
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
  type?: 'COURS' | 'TP' | 'EXAMEN';
}

export interface MatiereClasseConfig {
  classe: Classe | null;
  matiere: Matiere | null;
  dateDebut?: string;
  dateFin?: string;
}

export interface Planning {
  seances: Seance[];
  professeurs: Professeur[];
  classes: Classe[];
  matieres: Matiere[];
  matiereClasseConfigs: MatiereClasseConfig[];
  score?: {
    hard: number;
    soft: number;
    toString: () => string;
  } | string;
}
