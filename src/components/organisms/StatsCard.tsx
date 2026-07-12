import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  children: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, children }) => {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <div className="stats-card-content">{children}</div>
    </div>
  );
};
