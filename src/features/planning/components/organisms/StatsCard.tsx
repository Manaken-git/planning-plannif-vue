import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  tone?: 'alert' | 'success' | 'info' | 'purple';
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  icon,
  tone = 'purple',
  children,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Rechercher...'
}) => {
  return (
    <div className={`stats-card stats-card-${tone}`}>
      <div className="stats-card-header">
        <div className="stats-card-heading">
          {icon && <span className="stats-card-icon" aria-hidden="true">{icon}</span>}
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        {onSearchChange !== undefined && (
          <div className="stats-search-container">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="stats-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="stats-search-clear"
                onClick={() => onSearchChange('')}
              >
                x
              </button>
            )}
          </div>
        )}
      </div>
      <div className="stats-card-content">{children}</div>
    </div>
  );
};


