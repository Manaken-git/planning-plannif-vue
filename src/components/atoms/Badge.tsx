import React from 'react';
import './Badge.css';

export type BadgeType = 'ok' | 'warn' | 'err' | 'info';

interface BadgeProps {
  type: BadgeType;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ type, children, style }) => {
  return (
    <span className={`badge badge-${type}`} style={style}>
      {children}
    </span>
  );
};
