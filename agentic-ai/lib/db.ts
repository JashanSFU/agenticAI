// lib/db.ts

export type Meeting = {
  id: string;
  title: string;
  date: string;        // "2025-11-25"
  time: string;        // "13:00"
  attendees: string[];
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;        // ISO date: "2025-11-30"
  projectId?: string;      // optional link to a project / goal
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type JournalEntry = {
  id: string;
  date: string;            // ISO date only, e.g. "2025-11-23"
  content: string;
  mood?: "great" | "good" | "okay" | "bad" | "awful";
  topics?: string[];       // detected / tagged topics
  createdAt: string;
};

export type Habit = {
  id: string;
  name: string;            // "Gym", "Deep Work", "No Sugar"
  description?: string;
  targetPerWeek?: number;  // e.g. 3 times / week
  createdAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;            // ISO date "2025-11-23"
  value?: number;          // e.g. minutes, reps, etc
  note?: string;
};

export type GraphNode = {
  id: string;
  type: "note" | "task" | "meeting" | "habit" | "journal" | "person" | "project" | "goal" | "generic";
  refId?: string;          // ID in its own table, e.g. Task.id
  label: string;           // human-readable label
};

export type GraphEdge = {
  id: string;
  from: string;            // GraphNode.id
  to: string;              // GraphNode.id
  kind:
    | "related-to"
    | "mentioned-in"
    | "depends-on"
    | "part-of"
    | "duplicate-of"
    | "causes"
    | "blocks";
};

export const db = {
  meetings: [] as Meeting[],
  tasks: [] as Task[],
  leads: [] as any[],
  contacts: [] as any[],

  notes: [] as Note[],
  journal: [] as JournalEntry[],
  habits: [] as Habit[],
  habitLogs: [] as HabitLog[],

  graphNodes: [] as GraphNode[],
  graphEdges: [] as GraphEdge[],

  memoryVectors: [] as MemoryVector[],
};

export type MemoryVector = {
  id: string;
  refType: "note" | "task" | "journal" | "habit" | "meeting";
  refId: string;          // original entity ID
  embedding: number[];    // vector
  text: string;           // original text
};

db.memoryVectors = [] as MemoryVector[];
