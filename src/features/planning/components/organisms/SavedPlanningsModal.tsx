import React, { useState, useEffect } from 'react';
import { fetchSavedPlannings, deletePlanningBackend, type SavedPlanningHeader } from '../../services/planningApi';
import { Icon } from '../atoms/Icon';
import './SavedPlanningsModal.css';

interface SavedPlanningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlanning: (id: number) => Promise<void>;
  onSaveCurrentPlanning: (name: string) => Promise<void>;
}

export const SavedPlanningsModal: React.FC<SavedPlanningsModalProps> = ({
  isOpen,
  onClose,
  onLoadPlanning,
  onSaveCurrentPlanning
}) => {
  const [plannings, setPlannings] = useState<SavedPlanningHeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved plannings from backend
  const loadPlannings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSavedPlannings();
      // Sort by creation date descending
      const sorted = data.sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
      setPlannings(sorted);
    } catch (err) {
      console.error('Erreur lors du chargement des plannings :', err);
      setError('Impossible de charger la liste des plannings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPlannings();
      // Set default name with current timestamp
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setSaveName(`Planning du ${dateStr} à ${timeStr}`);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await onSaveCurrentPlanning(saveName.trim());
      await loadPlannings();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde :', err);
      setError('Erreur lors de l\'enregistrement du planning.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le planning "${name}" ?`)) {
      return;
    }

    try {
      await deletePlanningBackend(id);
      setPlannings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
      setError('Impossible de supprimer le planning.');
    }
  };

  const handleLoad = async (id: number) => {
    setLoading(true);
    try {
      await onLoadPlanning(id);
      onClose();
    } catch (err) {
      console.error('Erreur lors du chargement :', err);
      setError('Erreur lors du chargement du planning.');
    } finally {
      setLoading(false);
    }
  };

  const formatCreationDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gestion des Plannings</h2>
          <button className="modal-close-btn" onClick={onClose} title="Fermer">x</button>
        </div>

        <div className="modal-body">
          {error && <div className="modal-alert-error">{error}</div>}

          {/* Form to save current schedule */}
          <section className="modal-section save-section">
            <h3>Enregistrer le planning actuel</h3>
            <form onSubmit={handleSave} className="save-form">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Nom du planning..."
                maxLength={50}
                required
                disabled={saving}
              />
              <button type="submit" className="save-btn" disabled={saving || !saveName.trim()}>
                {saving ? (
                  <>
                    <span className="spinner"></span>
                    Enregistrement...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </button>
            </form>
          </section>

          {/* List of saved schedules */}
          <section className="modal-section list-section">
            <h3>Plannings enregistrés ({plannings.length})</h3>
            
            {loading ? (
              <div className="modal-loader">
                <span className="spinner"></span>
                Chargement des plannings...
              </div>
            ) : plannings.length === 0 ? (
              <div className="modal-empty-state">Aucun planning sauvegardé dans la base de données.</div>
            ) : (
              <div className="plannings-table-container">
                <table className="plannings-table">
                  <thead>
                    <tr>
                      <th>Nom du Planning</th>
                      <th>Date de Création</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plannings.map((p) => (
                      <tr key={p.id} className="planning-row">
                        <td className="planning-name-cell" title={p.nom}>
                          {p.nom}
                        </td>
                        <td className="planning-date-cell">
                          {formatCreationDate(p.dateCreation)}
                        </td>
                        <td className="planning-actions-cell">
                          <button
                            className="btn-action load-btn"
                            onClick={() => handleLoad(p.id)}
                            title="Charger ce planning"
                          >
                            Charger
                          </button>
                          <button
                            className="btn-action planning-delete-btn"
                            onClick={() => handleDelete(p.id, p.nom)}
                            title="Supprimer définitivement"
                          >
                            <Icon name="trash" /> <span>Supprimer</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

