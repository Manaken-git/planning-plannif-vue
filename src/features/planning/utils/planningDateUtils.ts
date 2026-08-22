import type { Seance } from '../types/planning';

export function getMondayStr(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

export function getWeekLabel(mondayStr: string) {
  const monday = new Date(mondayStr);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return `Du ${format(monday)} au ${format(sunday)} ${sunday.getFullYear()}`;
}

export function getMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getSessionHours(seance: Seance) {
  if (!seance.creneau) return 0;

  const start = new Date(seance.creneau.debut);
  const end = new Date(seance.creneau.fin);
  const diffMs = end.getTime() - start.getTime();

  return diffMs / (1000 * 60 * 60);
}

