import React, { useState } from 'react';
import { FilterItem } from '../molecules/FilterItem';
import { Checkbox } from '../atoms/Checkbox';
import { Icon } from '../atoms/Icon';
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
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllChecked =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  const handleToggleAllVisible = (checked: boolean) => {
    // If search query is present, we toggle only the filtered ones
    if (searchQuery) {
      filteredItems.forEach((item) => {
        const isCurrentlyChecked = selectedIds.includes(item.id);
        if (checked !== isCurrentlyChecked) {
          onToggleItem(item.id, checked);
        }
      });
    } else {
      onToggleAll(checked);
    }
  };

  return (
    <div className={`filter-group ${isOpen ? 'is-open' : 'is-closed'}`}>
      <div className="filter-group-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{title} ({selectedIds.length}/{items.length})</h3>
        <span className={`collapse-icon ${isOpen ? 'is-open' : ''}`}><Icon name="chevronDown" /></span>
      </div>

      {isOpen && (
        <div className="filter-group-body">
          {items.length > 5 && (
            <div className="search-box-container">
              <input
                type="text"
                placeholder={`Rechercher un ${title.toLowerCase().substring(0, title.length - 1)}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                    <Icon name="close" />
                </button>
              )}
            </div>
          )}

          <div className="filter-list">
            <Checkbox
              id={`all-${type}`}
              checked={isAllChecked}
              onChange={handleToggleAllVisible}
              label={searchQuery ? "Tout sélectionner (filtrés)" : "Tout sélectionner"}
              className="select-all-label"
            />
            
            <div className="filter-scroll-container">
              {filteredItems.length === 0 ? (
                <div className="no-filter-results">Aucun résultat</div>
              ) : (
                filteredItems.map((item) => (
                  <FilterItem
                    key={item.id}
                    id={item.id.toString()}
                    type={type}
                    checked={selectedIds.includes(item.id)}
                    onChange={(checked) => onToggleItem(item.id, checked)}
                    label={item.name}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


