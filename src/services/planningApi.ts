import type { Classe, Professeur, Seance, Matiere, Salle, Eleve, Planning, Vacances } from '../types/planning';

const DATA_BASE_URL = '/planning-data';
const SOLVER_BASE_URL = '/planning';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} pour ${url}`);
  }

  return response.json();
}

/**
 * Récupère la liste des classes depuis /planning-data/classes/list
 */
export async function fetchClasses(): Promise<Classe[]> {
  return fetchJson<Classe[]>(`${DATA_BASE_URL}/classes/list`);
}

/**
 * Récupère la liste des professeurs depuis /planning-data/profs/list
 */
export async function fetchProfesseurs(): Promise<Professeur[]> {
  return fetchJson<Professeur[]>(`${DATA_BASE_URL}/profs/list`);
}

/**
 * Récupère la liste des séances depuis /planning-data/seances/list
 */
export async function fetchSeances(): Promise<Seance[]> {
  return fetchJson<Seance[]>(`${DATA_BASE_URL}/seances/list`);
}

/**
 * Récupère la liste des matières depuis /planning-data/matieres/list
 */
export async function fetchMatieres(): Promise<Matiere[]> {
  return fetchJson<Matiere[]>(`${DATA_BASE_URL}/matieres/list`);
}

/**
 * Récupère la liste des salles depuis /planning-data/salles/list
 */
export async function fetchSalles(): Promise<Salle[]> {
  return fetchJson<Salle[]>(`${DATA_BASE_URL}/salles/list`);
}

/**
 * Récupère la liste des élèves depuis /planning-data/eleves/list
 */
export async function fetchEleves(): Promise<Eleve[]> {
  return fetchJson<Eleve[]>(`${DATA_BASE_URL}/eleves/list`);
}

export interface FetchedDataResult {
  classes: Classe[];
  professeurs: Professeur[];
  seances: Seance[];
  matieres: Matiere[];
  salles: Salle[];
  eleves: Eleve[];
}

/**
 * Charge l'ensemble des données d'entrée depuis le projet plannif-data
 */
export async function fetchAllPlanningData(): Promise<FetchedDataResult> {
  const [classes, professeurs, seances, matieres, salles, eleves] = await Promise.all([
    fetchClasses().catch((err) => { console.warn('Erreur chargement classes:', err); return []; }),
    fetchProfesseurs().catch((err) => { console.warn('Erreur chargement profs:', err); return []; }),
    fetchSeances().catch((err) => { console.warn('Erreur chargement seances:', err); return []; }),
    fetchMatieres().catch((err) => { console.warn('Erreur chargement matieres:', err); return []; }),
    fetchSalles().catch((err) => { console.warn('Erreur chargement salles:', err); return []; }),
    fetchEleves().catch((err) => { console.warn('Erreur chargement eleves:', err); return []; }),
  ]);

  return {
    classes,
    professeurs,
    seances,
    matieres,
    salles,
    eleves,
  };
}

/**
 * Déclenche le solveur via GET /planning/solve sans paramètres
 */
export async function solvePlanning(): Promise<Planning | Seance[] | any> {
  return fetchJson<any>(`${SOLVER_BASE_URL}/solve`);
}

/**
 * Récupère la liste des vacances scolaires
 */
export async function fetchVacances(): Promise<Vacances[]> {
  return fetchJson<Vacances[]>(`${DATA_BASE_URL}/vacances/list`);
}

/**
 * Enregistre une période de vacances
 */
export async function createVacances(vacances: Vacances): Promise<Vacances> {
  const url = `${DATA_BASE_URL}/vacances/create`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(vacances),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erreur HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Supprime une période de vacances
 */
export async function deleteVacances(id: number): Promise<void> {
  const url = `${DATA_BASE_URL}/vacances/delete/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la suppression`);
  }
}

export interface SavedPlanningHeader {
  id: number;
  nom: string;
  dateCreation: string;
}

/**
 * Récupère la liste des plannings sauvegardés dans le backend
 */
export async function fetchSavedPlannings(): Promise<SavedPlanningHeader[]> {
  return fetchJson<SavedPlanningHeader[]>(`${DATA_BASE_URL}/plannings/list`);
}

/**
 * Récupère le détail d'un planning sauvegardé dans le backend
 */
export async function fetchSavedPlanningDetails(id: number): Promise<any> {
  return fetchJson<any>(`${DATA_BASE_URL}/plannings/${id}`);
}

/**
 * Enregistre un planning actuel dans la base de données du backend
 */
export async function savePlanningBackend(planning: any): Promise<any> {
  const url = `${DATA_BASE_URL}/plannings/save`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(planning),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erreur HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Supprime un planning sauvegardé
 */
export async function deletePlanningBackend(id: number): Promise<void> {
  const url = `${DATA_BASE_URL}/plannings/delete/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la suppression`);
  }
}

