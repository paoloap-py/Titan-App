export interface ExercisePR {
  date: string;
  weight: number;
  reps: number;
  estimated1RM: number;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  completed?: boolean;
  isDropSet?: boolean;
  isRestPause?: boolean;
  isFinisher?: boolean; 
  isAnchor?: boolean; 
  usedStraps?: boolean;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
  targetRepRange: string;
  hasLongRest?: boolean; 
  requiresStraps?: boolean; 
  hasFinisherTarget?: boolean; 
  hasAnchorTarget?: boolean; 
  requiresDropSet?: boolean; 
  requiresRestPause?: boolean; 
  hasPRHit?: boolean; // Tracking if a PR was hit for this exercise in current session
}

export interface WorkoutSession {
  id: string;
  date: string;
  week: number;
  day: number; 
  exercises: ExerciseEntry[];
  isDeload?: boolean;
  protocolId: string;
  hasPR?: boolean; // Flag to indicate if session contains any PRs
  warmupCompleted?: boolean[];
  stretchingCompleted?: boolean[];
  cardioCompleted: boolean;
}

export interface UserSettings {
  email: string;
  autoRemindExport: boolean;
  autoBackupAfterSession: boolean;
  lastExportMonth: number; // 0-11
}

export interface MaxStats {
  meadowsRow: number;
  machinePress: number;
  hackSquat: number;
  rdl: number;
  smithIncline: number;
}

export interface ProtocolDay {
  day: number;
  name: string;
  exercises: string[];
  warmup: string[];
  stretching: string[];
  targetDuration: number;
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  weeklySetTarget: number;
  rules: string[];
  days: ProtocolDay[];
}

export interface BodyWeight {
  id: string;
  date: string; // ISO date string
  weight: number; // kg
}

export interface BodyMeasurement {
  id: string;
  date: string; // ISO date string
  armLeft?: number; // cm
  armRight?: number;
  chest?: number;
  waist?: number;
  quadLeft?: number;
  quadRight?: number;
}

export interface Alert {
  id: string;
  type: 'deload' | 'plateau' | 'volume-imbalance';
  severity: 'warning' | 'danger';
  title: string;
  message: string;
  exercise?: string;
  muscleGroup?: string;
  createdAt: string;
}
