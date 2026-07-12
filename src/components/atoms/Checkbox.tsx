import React from 'react';
import './Checkbox.css';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  className = ''
}) => {
  return (
    <label className={`checkbox-container ${className}`} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox-custom"></span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};
