import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../atoms/Icon';
import { getMondayStr, getWeekLabel } from '../../utils/planningDateUtils';
import './WeekDatePicker.css';

interface WeekDatePickerProps {
  value: string;
  onChange: (monday: string) => void;
}

const toDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function WeekDatePicker({ value, onChange }: WeekDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => toDate(value || getMondayStr(toDateStr(new Date()))));

  useEffect(() => {
    if (value) setVisibleMonth(toDate(value));
  }, [value]);

  const days = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = new Date(first);
    const mondayIndex = (first.getDay() + 6) % 7;
    start.setDate(first.getDate() - mondayIndex);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const today = toDateStr(new Date());

  const selectDate = (date: Date) => {
    onChange(getMondayStr(toDateStr(date)));
    setIsOpen(false);
  };

  return (
    <div className="week-date-picker">
      <button className={`date-tab active ${isOpen ? 'is-open' : ''}`} type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        <Icon name="calendar" /> {getWeekLabel(value)}
      </button>
      {isOpen && <>
        <button className="date-picker-backdrop" type="button" aria-label="Fermer le calendrier" onClick={() => setIsOpen(false)} />
        <div className="date-picker-popover">
          <div className="date-picker-header">
            <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><Icon name="chevronLeft" /></button>
            <strong>{visibleMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><Icon name="chevronRight" /></button>
          </div>
          <div className="date-picker-weekdays">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="date-picker-days">
            {days.map((date) => {
              const dateStr = toDateStr(date);
              const inSelectedWeek = getMondayStr(dateStr) === value;
              return <button key={dateStr} type="button" className={`${date.getMonth() !== visibleMonth.getMonth() ? 'outside' : ''} ${dateStr === today ? 'today' : ''} ${inSelectedWeek ? 'selected-week' : ''}`} onClick={() => selectDate(date)}>{date.getDate()}</button>;
            })}
          </div>
          <button className="date-picker-today" type="button" onClick={() => selectDate(new Date())}><Icon name="calendarDays" /> Aller à aujourd'hui</button>
        </div>
      </>}
    </div>
  );
}
