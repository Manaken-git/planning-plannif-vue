import React from 'react';
import { Badge } from '../atoms/Badge';
import type { BadgeType } from '../atoms/Badge';
import './StatsRow.css';

interface StatsRowProps {
  name: string;
  hours: number;
  badgeType: BadgeType;
  statusLabel: string;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  name,
  hours,
  badgeType,
  statusLabel
}) => {
  return (
    <tr className="stats-row">
      <td className="stats-name">{name}</td>
      <td className="stats-hours">{hours.toFixed(1)}h</td>
      <td className="stats-badge-cell">
        <Badge type={badgeType}>{statusLabel}</Badge>
      </td>
    </tr>
  );
};

