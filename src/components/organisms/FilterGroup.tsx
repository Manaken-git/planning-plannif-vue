import React from 'react';
import { FilterItem } from '../molecules/FilterItem';
import { Checkbox } from '../atoms/Checkbox';
import './FilterGroup.css';

interface FilterGroupProps {
  title: string;
  type: string;
  items: { id: number; name: string }[];
  selectedIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleItem: (id: number, checked: boolean) => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  type,
  items,
  selectedIds,
  onToggleAll,
  onToggleItem
}) => {
  const isAllChecked = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  return (
    <div className="filter-group">
      <h3>{title}</h3>
      <div className="filter-list">
        <Checkbox
          id={`all-${type}`}
          checked={isAllChecked}
          onChange={onToggleAll}
          label="Tout sélectionner"
          className="select-all-label"
        />
        {items.map((item) => (
          <FilterItem
            key={item.id}
            id={item.id.toString()}
            type={type}
            checked={selectedIds.includes(item.id)}
            onChange={(checked) => onToggleItem(item.id, checked)}
            label={item.name}
          />
        ))}
      </div>
    </div>
  );
};
