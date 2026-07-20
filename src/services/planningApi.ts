import type { Classe, Professeur, Seance, Matiere, Salle, Eleve, Planning } from '../types/planning';

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
