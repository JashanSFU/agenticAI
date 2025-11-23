import { db } from "./db";
import { createId } from "./utils";

// Convert natural language date strings (e.g. "tomorrow", "next monday")
export function parseDate(input: string | null): Date | null {
  if (!input) return null;

  const lower = input.toLowerCase().trim();
  const today = new Date();

  // Basic keywords
  if (lower === "today") return today;
  if (lower === "tomorrow") {
    const d = new Date();
    d.setDate(today.getDate() + 1);
    return d;
  }

  // Weekdays ("next monday", "monday", etc.)
  const weekdays = [
    "sunday","monday","tuesday","wednesday","thursday","friday","saturday"
  ];

  for (let i = 0; i < 7; i++) {
    const name = weekdays[i];

    if (lower.includes(name)) {
      const date = new Date();
      const diff = (i - today.getDay() + 7) % 7;

      // “monday” (today or next upcoming)
      if (!lower.includes("next")) {
        date.setDate(today.getDate() + diff);
        return date;
      }

      // “next monday”
      date.setDate(today.getDate() + diff + 7);
      return date;
    }
  }

  // Full date (YYYY-MM-DD)
  if (/\d{4}-\d{2}-\d{2}/.test(lower)) {
    return new Date(lower);
  }

  return null;
}

// Parse vague time phrases ("morning", "afternoon", "after lunch")
export function parseTimePhrase(input: string | null): string | null {
  if (!input) return null;

  const lower = input.toLowerCase();
  if (lower.includes("morning")) return "09:00";
  if (lower.includes("noon")) return "12:00";
  if (lower.includes("lunch")) return "13:00";
  if (lower.includes("afternoon")) return "15:00";
  if (lower.includes("evening")) return "18:00";

  // Direct time "3pm" → 15:00
  const match = lower.match(/(\d{1,2})(am|pm)/);
  if (match) {
    let hour = parseInt(match[1]);
    const isPM = match[2] === "pm";
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:00`;
  }

  return null;
}

// Conflict detection
export function hasConflict(date: string, time: string) {
  return db.meetings.some(m => m.date === date && m.time === time);
}

// Suggest next available time (30 min increments)
export function findNextAvailable(date: string) {
  const hours = [9, 10, 11, 13, 14, 15, 16, 17];
  for (const h of hours) {
    const time = `${h.toString().padStart(2, "0")}:00`;
    if (!hasConflict(date, time)) return time;
  }
  return null; // fully booked
}
