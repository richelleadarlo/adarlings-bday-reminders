/** Birthday data model and utility functions */

export interface Birthday {
  id: string;
  name: string;
  /** Stored as ISO date string (YYYY-MM-DD) */
  date: string;
}

const STORAGE_KEY = "adarlings-birthdays";

/** Load birthdays from localStorage */
export function loadBirthdays(): Birthday[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Save birthdays to localStorage */
export function saveBirthdays(birthdays: Birthday[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
}

/** Calculate days remaining until the next occurrence of a birthday */
export function getDaysUntilBirthday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bday = new Date(dateStr);
  // Next occurrence this year
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  // If that date has already passed this year, use next year
  if (next < today) {
    next.setFullYear(today.getFullYear() + 1);
  }

  const diff = next.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** Calculate age based on birthdate */
export function getAge(dateStr: string): number {
  const today = new Date();
  const bday = new Date(dateStr);
  let age = today.getFullYear() - bday.getFullYear();
  const monthDiff = today.getMonth() - bday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bday.getDate())) {
    age--;
  }
  return age;
}

/** Sort birthdays by soonest upcoming */
export function sortByUpcoming(birthdays: Birthday[]): Birthday[] {
  return [...birthdays].sort(
    (a, b) => getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date)
  );
}
