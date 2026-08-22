import React from 'react';
import { Checkbox } from '../atoms/Checkbox';
import './FilterItem.css';

interface FilterItemProps {
  id: string;
  type: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const FilterItem: React.FC<FilterItemProps> = ({
  id,
  type,
  checked,
  onChange,
  label
}) => {
  const subjectColors = ['#3b82f6', '#22d3ee', '#34d399', '#a855f7', '#f59e0b', '#f43f5e'];
  const decoratedLabel = type === 'matiere' ? (
    <span className="filter-subject-label"><i style={{ backgroundColor: subjectColors[(Number(id) - 1) % subjectColors.length] }} />{label}</span>
  ) : label;

  return (
    <div className="filter-item">
      <Checkbox
        id={`${type}-${id}`}
        checked={checked}
        onChange={onChange}
        label={decoratedLabel}
      />
    </div>
  );
};

