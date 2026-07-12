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
  return (
    <div className="filter-item">
      <Checkbox
        id={`${type}-${id}`}
        checked={checked}
        onChange={onChange}
        label={label}
      />
    </div>
  );
};
