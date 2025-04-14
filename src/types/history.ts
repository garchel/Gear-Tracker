export type StateHistoryEntry = {
  equipmentId: string;
  equipmentStateId: string;
  timestamp: string; // ISO date string
};

export type PositionHistoryEntry = {
  equipmentId: string;
  position: [number, number]; // [latitude, longitude]
  timestamp: string; // ISO date string
};

export type HistoryEntry = {
  date: Date;
  state: string;
  stateName: string;
  position: [number, number] | null;
};

export type GroupedHistory = {
  date: string; // Data formatada (dia/mês)
  entries: HistoryEntry[];
};