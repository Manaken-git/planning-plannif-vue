import React, { useState, useEffect } from 'react';
import { fetchVacances, createVacances, deleteVacances } from '../../services/planningApi';
import type { Vacances } from '../../types/planning';
import './VacancesManager.css';

interface VacancesManagerProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const VacancesManager: React.FC<VacancesManagerProps> = ({ onNotify }) => {
  const [vacancesList, setVacancesList] = useState<Vacances[]>([]);
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const loadVacances = async () => {
    setLoading(true);
    try {
      const data = await fetchVacances();
      setVacancesList(data);
    } catch (err) {
      console.error(err);
      onNotify("Impossible de charger le calendrier des vacances.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !dateDebut || !dateFin) {
      onNotify("Tous les champs sont obligatoires.", "error");
      return;
    }

    if (new Date(dateFin) < new Date(dateDebut)) {
      onNotify("La date de fin ne peut pas être antérieure à la date de début.", "error");
      return;
    }

    try {
      const payload: Vacances = {
        nom: nom.trim(),
        dateDebut,
        dateFin
      };
      await createVacances(payload);
      onNotify("Période de vacances enregistrée avec succès !", "success");
      setNom('');
      setDateDebut('');
      setDateFin('');
      loadVacances();
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || "Erreur lors de la création.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette période de vacances ?")) {
      return;
    }

    try {
      await deleteVacances(id);
      onNotify("Période de vacances supprimée avec succès !", "success");
      loadVacances();
    } catch (err) {
      console.error(err);
      onNotify("Erreur lors de la suppression.", "error");
    }
  };

  return (
    <div className="vacances-manager fade-in">
      <div className="vacances-header-row">
        <h2>Gestion du Calendrier des Vacances</h2>
        <p className="subtitle">Définissez les périodes de fermeture de l'établissement scolaires pour le solver.</p>
      </div>

      <div className="vacances-grid">
        {/* Form Card */}
        <div className="vacances-card form-card">
          <h3>Ajouter des vacances</h3>
          <form onSubmit={handleSubmit} className="vacances-form">
            <div className="form-group">
              <label htmlFor="nom">Nom de l'événement</label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Vacances de la Toussaint"
                required
              />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="dateDebut">Date de début</label>
                <input
                  id="dateDebut"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateFin">Date de fin</label>
                <input
                  id="dateFin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Enregistrer
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="vacances-card list-card">
          <h3>Périodes enregistrées</h3>
          {loading ? (
            <div className="loading-placeholder">
              <span className="spinner"></span> Chargement...
            </div>
          ) : vacancesList.length === 0 ? (
            <div className="empty-placeholder">
              🌴 Aucune période de vacances enregistrée.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="vacances-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancesList.map((vac) => {
                    const startFormatted = new Date(vac.dateDebut).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    const endFormatted = new Date(vac.dateFin).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    return (
                      <tr key={vac.id}>
                        <td className="vac-name">{vac.nom}</td>
                        <td>{startFormatted}</td>
                        <td>{endFormatted}</td>
                        <td>
                          <button
                            onClick={() => vac.id && handleDelete(vac.id)}
                            className="delete-btn"
                            title="Supprimer cette période"
                          >
                            🗑️ Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
