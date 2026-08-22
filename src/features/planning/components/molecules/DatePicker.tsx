import { useMemo, useState } from 'react';
import { Icon } from '../atoms/Icon';
import './WeekDatePicker.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function DatePicker({ value, onChange, placeholder = 'Choisir une date', ariaLabel }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => value ? parseDate(value) : new Date());
  const days = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);
  const today = formatValue(new Date());

  const selectDate = (date: Date) => {
    onChange(formatValue(date));
    setVisibleMonth(date);
    setIsOpen(false);
  };

  return <div className="week-date-picker single-date-picker">
    <button className={`custom-date-input ${isOpen ? 'is-open' : ''}`} type="button" onClick={() => setIsOpen((open) => !open)} aria-label={ariaLabel} aria-expanded={isOpen}><Icon name="calendar" /><span>{value ? parseDate(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : placeholder}</span><Icon name="chevronDown" /></button>
    {isOpen && <>
      <button className="date-picker-backdrop" type="button" aria-label="Fermer le calendrier" onClick={() => setIsOpen(false)} />
      <div className="date-picker-popover">
        <div className="date-picker-header"><button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><Icon name="chevronLeft" /></button><strong>{visibleMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong><button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><Icon name="chevronRight" /></button></div>
        <div className="date-picker-weekdays">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="date-picker-days">{days.map((date) => { const dateStr = formatValue(date); return <button key={dateStr} type="button" className={`${date.getMonth() !== visibleMonth.getMonth() ? 'outside' : ''} ${dateStr === today ? 'today' : ''} ${dateStr === value ? 'selected-date' : ''}`} onClick={() => selectDate(date)}>{date.getDate()}</button>; })}</div>
        <button className="date-picker-today" type="button" onClick={() => selectDate(new Date())}><Icon name="calendarDays" /> Aujourd'hui</button>
      </div>
    </>}
  </div>;
}
