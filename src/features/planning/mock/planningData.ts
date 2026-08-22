import type { Planning } from '../types/planning';

export const mockPlanningData: Planning = {
  score: "0hard/0soft",
  professeurs: [
    { id: 1, nom: "Martin", prenom: "Jean", nb_heures: 6, maxHeuresParJour: 6 },
    { id: 2, nom: "Bernard", prenom: "Sophie", nb_heures: 8, maxHeuresParJour: 6 },
    { id: 3, nom: "Petit", prenom: "Thomas", nb_heures: 12, maxHeuresParJour: 8 },
    { id: 4, nom: "Robert", prenom: "Claire", nb_heures: 14, maxHeuresParJour: 8 },
    { id: 5, nom: "Richard", prenom: "Luc", nb_heures: 12, maxHeuresParJour: 8 },
    { id: 6, nom: "Durand", prenom: "Marie", nb_heures: 2, maxHeuresParJour: 4 },
    { id: 7, nom: "Dubois", prenom: "Pierre", nb_heures: 8, maxHeuresParJour: 6 },
    { id: 8, nom: "Moreau", prenom: "Julie", nb_heures: 4, maxHeuresParJour: 4 },
    { id: 9, nom: "Laurent", prenom: "Antoine", nb_heures: 8, maxHeuresParJour: 6 },
    { id: 10, nom: "Simon", prenom: "Élodie", nb_heures: 6, maxHeuresParJour: 6 }
  ],
  classes: [
    { id: 1, nom: "6ème 1" },
    { id: 2, nom: "6ème 2" },
    { id: 3, nom: "5ème 1" },
    { id: 4, nom: "5ème 2" },
    { id: 5, nom: "4ème 1" },
    { id: 6, nom: "4ème 2" },
    { id: 7, nom: "3ème 1" },
    { id: 8, nom: "3ème 2" },
    { id: 9, nom: "2nde 1" },
    { id: 10, nom: "2nde 2" }
  ],
  matieres: [
    { id: 1, nom: "Mathématiques" },
    { id: 2, nom: "Physique" },
    { id: 3, nom: "Français" },
    { id: 4, nom: "Anglais" },
    { id: 5, nom: "Histoire" },
    { id: 6, nom: "Géographie" }
  ],
  matiereClasseConfigs: [],
  seances: [
    // LUNDI 12 FEVRIER 2026
    {
      id: 1,
      professeur: { id: 5, nom: "M. Richard" },
      classe: { id: 6, nom: "4ème 2" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 101, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 2,
      professeur: { id: 5, nom: "M. Richard" },
      classe: { id: 6, nom: "4ème 2" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 102, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 3,
      professeur: { id: 5, nom: "M. Richard" },
      classe: { id: 3, nom: "5ème 1" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 103, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 4,
      professeur: { id: 5, nom: "M. Richard" },
      classe: { id: 1, nom: "6ème 1" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 104, debut: "2026-02-12T15:15:00", fin: "2026-02-12T17:15:00" }
    },
    {
      id: 5,
      professeur: { id: 7, nom: "M. Dubois" },
      classe: { id: 5, nom: "4ème 1" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 105, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 6,
      professeur: { id: 7, nom: "M. Dubois" },
      classe: { id: 3, nom: "5ème 1" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 106, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 7,
      professeur: { id: 7, nom: "M. Dubois" },
      classe: { id: 2, nom: "6ème 2" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 107, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 8,
      professeur: { id: 8, nom: "Mme Moreau" },
      classe: { id: 1, nom: "6ème 1" },
      matiere: { id: 4, nom: "Anglais" },
      creneau: { id: 108, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 9,
      professeur: { id: 8, nom: "Mme Moreau" },
      classe: { id: 7, nom: "3ème 1" },
      matiere: { id: 4, nom: "Anglais" },
      creneau: { id: 109, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 10,
      professeur: { id: 9, nom: "M. Laurent" },
      classe: { id: 3, nom: "5ème 1" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 110, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 11,
      professeur: { id: 9, nom: "M. Laurent" },
      classe: { id: 8, nom: "3ème 2" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 111, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 12,
      professeur: { id: 9, nom: "M. Laurent" },
      classe: { id: 10, nom: "2nde 2" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 112, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 13,
      professeur: { id: 9, nom: "M. Laurent" },
      classe: { id: 10, nom: "2nde 2" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 113, debut: "2026-02-12T15:15:00", fin: "2026-02-12T17:15:00" }
    },
    {
      id: 14,
      professeur: { id: 10, nom: "Mme Simon" },
      classe: { id: 7, nom: "3ème 1" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 114, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 15,
      professeur: { id: 10, nom: "Mme Simon" },
      classe: { id: 9, nom: "2nde 1" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 115, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 16,
      professeur: { id: 10, nom: "Mme Simon" },
      classe: { id: 9, nom: "2nde 1" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 116, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 17,
      professeur: { id: 2, nom: "Mme Bernard" },
      classe: { id: 1, nom: "6ème 1" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 117, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 18,
      professeur: { id: 2, nom: "Mme Bernard" },
      classe: { id: 4, nom: "5ème 2" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 118, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 19,
      professeur: { id: 2, nom: "Mme Bernard" },
      classe: { id: 4, nom: "5ème 2" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 119, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 20,
      professeur: { id: 2, nom: "Mme Bernard" },
      classe: { id: 9, nom: "2nde 1" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 120, debut: "2026-02-12T15:15:00", fin: "2026-02-12T17:15:00" }
    },
    {
      id: 21,
      professeur: { id: 3, nom: "M. Petit" },
      classe: { id: 2, nom: "6ème 2" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 121, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 22,
      professeur: { id: 3, nom: "M. Petit" },
      classe: { id: 5, nom: "4ème 1" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 122, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 23,
      professeur: { id: 3, nom: "M. Petit" },
      classe: { id: 6, nom: "4ème 2" },
      matiere: { id: 2, nom: "Physique" },
      creneau: { id: 123, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 24,
      professeur: { id: 3, nom: "M. Petit" },
      classe: { id: 7, nom: "3ème 1" },
      matiere: { id: 5, nom: "Histoire" },
      creneau: { id: 124, debut: "2026-02-12T15:15:00", fin: "2026-02-12T17:15:00" }
    },
    {
      id: 25,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 4, nom: "5ème 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 125, debut: "2026-02-12T08:00:00", fin: "2026-02-12T10:00:00" }
    },
    {
      id: 26,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 2, nom: "6ème 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 126, debut: "2026-02-12T10:15:00", fin: "2026-02-12T12:15:00" }
    },
    {
      id: 27,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 1, nom: "6ème 1" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 127, debut: "2026-02-12T13:00:00", fin: "2026-02-12T15:00:00" }
    },
    {
      id: 28,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 4, nom: "5ème 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 128, debut: "2026-02-12T15:15:00", fin: "2026-02-12T17:15:00" }
    },

    // MARDI 13 FEVRIER 2026
    {
      id: 29,
      professeur: { id: 5, nom: "M. Richard" },
      classe: { id: 2, nom: "6ème 2" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 129, debut: "2026-02-13T08:00:00", fin: "2026-02-13T10:00:00" }
    },
    {
      id: 30,
      professeur: { id: 5, nom: "M. Richard" },
      classe: { id: 3, nom: "5ème 1" },
      matiere: { id: 3, nom: "Français" },
      creneau: { id: 130, debut: "2026-02-13T10:15:00", fin: "2026-02-13T12:15:00" }
    },
    {
      id: 31,
      professeur: { id: 6, nom: "Mme Durand" },
      classe: { id: 6, nom: "4ème 2" },
      matiere: { id: 4, nom: "Anglais" },
      creneau: { id: 131, debut: "2026-02-13T08:00:00", fin: "2026-02-13T10:00:00" }
    },
    {
      id: 32,
      professeur: { id: 1, nom: "M. Martin" },
      classe: { id: 5, nom: "4ème 1" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 132, debut: "2026-02-13T08:00:00", fin: "2026-02-13T10:00:00" }
    },
    {
      id: 33,
      professeur: { id: 1, nom: "M. Martin" },
      classe: { id: 5, nom: "4ème 1" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 133, debut: "2026-02-13T10:15:00", fin: "2026-02-13T12:15:00" }
    },
    {
      id: 34,
      professeur: { id: 1, nom: "M. Martin" },
      classe: { id: 8, nom: "3ème 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 134, debut: "2026-02-13T13:00:00", fin: "2026-02-13T15:00:00" }
    },
    {
      id: 35,
      professeur: { id: 3, nom: "M. Petit" },
      classe: { id: 7, nom: "3ème 1" },
      matiere: { id: 5, nom: "Histoire" },
      creneau: { id: 135, debut: "2026-02-13T08:00:00", fin: "2026-02-13T10:00:00" }
    },
    {
      id: 36,
      professeur: { id: 3, nom: "M. Petit" },
      classe: { id: 8, nom: "3ème 2" },
      matiere: { id: 5, nom: "Histoire" },
      creneau: { id: 136, debut: "2026-02-13T10:15:00", fin: "2026-02-13T12:15:00" }
    },
    {
      id: 37,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 8, nom: "3ème 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 137, debut: "2026-02-13T08:00:00", fin: "2026-02-13T10:00:00" }
    },
    {
      id: 38,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 10, nom: "2nde 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 138, debut: "2026-02-13T10:15:00", fin: "2026-02-13T12:15:00" }
    },
    {
      id: 39,
      professeur: { id: 4, nom: "Mme Robert" },
      classe: { id: 10, nom: "2nde 2" },
      matiere: { id: 1, nom: "Mathématiques" },
      creneau: { id: 139, debut: "2026-02-13T13:00:00", fin: "2026-02-13T15:00:00" }
    },

    // MERCREDI 14 FEVRIER 2026
    {
      id: 40,
      professeur: { id: 7, nom: "M. Dubois" },
      classe: { id: 9, nom: "2nde 1" },
      matiere: { id: 6, nom: "Géographie" },
      creneau: { id: 140, debut: "2026-02-14T08:00:00", fin: "2026-02-14T10:00:00" }
    }
  ]
};

