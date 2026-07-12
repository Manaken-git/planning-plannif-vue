import { Planning } from '../types/planning';

export const mockPlanningData: Planning = {
  score: "0hard/-12soft",
  professeurs: [
    { id: 1, nom: "M. Dupont", prenom: "Jean", email: "jean.dupont@univ.fr", nb_heures: 8, maxHeuresParJour: 6 },
    { id: 2, nom: "Mme. Martin", prenom: "Sophie", email: "sophie.martin@univ.fr", nb_heures: 12, maxHeuresParJour: 6 },
    { id: 3, nom: "M. Durand", prenom: "Pierre", email: "pierre.durand@univ.fr", nb_heures: 4, maxHeuresParJour: 4 },
    { id: 4, nom: "Mme. Lefebvre", prenom: "Marie", email: "marie.lefebvre@univ.fr", nb_heures: 6, maxHeuresParJour: 6 }
  ],
  classes: [
    { id: 101, nom: "M1 Informatique" },
    { id: 102, nom: "M2 Informatique" },
    { id: 103, nom: "L3 MIAGE" }
  ],
  matieres: [
    { id: 201, nom: "Algorithmique Avancée", volumeHoraireAnnuel: 24 },
    { id: 202, nom: "Bases de Données NoSQL", volumeHoraireAnnuel: 16 },
    { id: 203, nom: "Développement React", volumeHoraireAnnuel: 20 },
    { id: 204, nom: "Architecture Systèmes", volumeHoraireAnnuel: 12 }
  ],
  matiereClasseConfigs: [
    {
      classe: { id: 101, nom: "M1 Informatique" },
      matiere: { id: 201, nom: "Algorithmique Avancée" },
      dateDebut: "2026-07-01",
      dateFin: "2026-07-31"
    },
    {
      classe: { id: 102, nom: "M2 Informatique" },
      matiere: { id: 202, nom: "Bases de Données NoSQL" },
      dateDebut: "2026-07-10",
      dateFin: "2026-07-20"
    },
    {
      classe: { id: 103, nom: "L3 MIAGE" },
      matiere: { id: 203, nom: "Développement React" },
      dateDebut: "2026-07-05",
      dateFin: "2026-07-25"
    }
  ],
  seances: [
    // Jour 1 (13 Juillet 2026)
    {
      id: 1001,
      professeur: { id: 1, nom: "M. Dupont" },
      classe: { id: 101, nom: "M1 Informatique" },
      matiere: { id: 201, nom: "Algorithmique Avancée" },
      creneau: { id: 501, debut: "2026-07-13T08:00:00", fin: "2026-07-13T10:00:00" },
      type: "COURS"
    },
    {
      id: 1002,
      professeur: { id: 1, nom: "M. Dupont" },
      classe: { id: 101, nom: "M1 Informatique" },
      matiere: { id: 201, nom: "Algorithmique Avancée" },
      creneau: { id: 502, debut: "2026-07-13T10:30:00", fin: "2026-07-13T12:30:00" },
      type: "TP"
    },
    {
      id: 1003,
      professeur: { id: 2, nom: "Mme. Martin" },
      classe: { id: 102, nom: "M2 Informatique" },
      matiere: { id: 202, nom: "Bases de Données NoSQL" },
      creneau: { id: 503, debut: "2026-07-13T09:00:00", fin: "2026-07-13T12:00:00" },
      type: "COURS"
    },
    {
      id: 1004,
      professeur: { id: 2, nom: "Mme. Martin" },
      classe: { id: 103, nom: "L3 MIAGE" },
      matiere: { id: 203, nom: "Développement React" },
      creneau: { id: 504, debut: "2026-07-13T14:00:00", fin: "2026-07-13T17:00:00" },
      type: "TP"
    },
    {
      id: 1005,
      professeur: { id: 3, nom: "M. Durand" },
      classe: { id: 103, nom: "L3 MIAGE" },
      matiere: { id: 204, nom: "Architecture Systèmes" },
      creneau: { id: 505, debut: "2026-07-13T14:00:00", fin: "2026-07-13T16:00:00" },
      type: "COURS"
    },

    // Jour 2 (14 Juillet 2026)
    {
      id: 1006,
      professeur: { id: 1, nom: "M. Dupont" },
      classe: { id: 101, nom: "M1 Informatique" },
      matiere: { id: 201, nom: "Algorithmique Avancée" },
      creneau: { id: 506, debut: "2026-07-14T09:00:00", fin: "2026-07-14T11:00:00" },
      type: "COURS"
    },
    {
      id: 1007,
      professeur: { id: 4, nom: "Mme. Lefebvre" },
      classe: { id: 102, nom: "M2 Informatique" },
      matiere: { id: 203, nom: "Développement React" },
      creneau: { id: 507, debut: "2026-07-14T13:30:00", fin: "2026-07-14T16:30:00" },
      type: "TP"
    }
  ]
};
