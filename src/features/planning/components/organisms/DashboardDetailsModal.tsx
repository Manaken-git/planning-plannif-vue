import { Icon } from '../atoms/Icon';
import type { IconName } from '../atoms/Icon';
import { useEffect } from 'react';
import './DashboardDetailsModal.css';

export interface DashboardDetailItem {
  id: number;
  name: string;
  value: string;
  status: string;
  progress?: number;
  tone?: 'success' | 'warning' | 'danger' | 'info';
}

interface DashboardDetailsModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  icon: IconName;
  items: DashboardDetailItem[];
  emptyMessage?: string;
  actionLabel?: string;
  onAction?: () => void;
  onSelect?: (id: number) => void;
  onClose: () => void;
}

export function DashboardDetailsModal({ isOpen, title, subtitle, icon, items, emptyMessage = 'Aucune donnée disponible.', actionLabel, onAction, onSelect, onClose }: DashboardDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return <div className="dashboard-detail-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="dashboard-detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <header className="dashboard-detail-header">
        <span className="dashboard-detail-icon"><Icon name={icon} /></span>
        <div><h2 id="detail-modal-title">{title}</h2><p>{subtitle}</p></div>
        <button className="detail-close" type="button" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
      </header>
      <div className="dashboard-detail-summary"><strong>{items.length}</strong><span>élément{items.length > 1 ? 's' : ''}</span></div>
      <div className="dashboard-detail-list">
        {items.length === 0 ? <div className="dashboard-detail-empty"><Icon name={icon} /><strong>Aucun élément</strong><p>{emptyMessage}</p></div> : items.map((item) => <button key={item.id} className="dashboard-detail-row" type="button" onClick={() => onSelect?.(item.id)} disabled={!onSelect}>
          <span className={`detail-status-dot ${item.tone || 'info'}`} />
          <span className="detail-row-main"><strong>{item.name}</strong>{item.progress !== undefined && <span className="detail-progress"><i style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} /></span>}</span>
          <span className="detail-row-value">{item.value}</span>
          <span className={`detail-row-status ${item.tone || 'info'}`}>{item.status}</span>
          {onSelect && <Icon name="chevronRight" />}
        </button>)}
      </div>
      <footer className="dashboard-detail-footer"><span><Icon name="info" /> Cliquez sur une ligne pour l’afficher dans le planning.</span>{actionLabel && <button type="button" onClick={onAction}>{actionLabel}</button>}</footer>
    </section>
  </div>;
}
