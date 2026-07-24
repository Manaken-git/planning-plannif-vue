import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  children,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Rechercher...'
}) => {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <h3>{title}</h3>
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
                ✕
              </button>
            )}
          </div>
        )}
      </div>
      <div className="stats-card-content">{children}</div>
    </div>
  );
};

