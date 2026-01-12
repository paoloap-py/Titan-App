export interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
  usedStraps?: boolean;
  isFinisher?: boolean;
  isAnchor?: boolean;
  isDropSet?: boolean;
  isRestPause?: boolean;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  targetRepRange: string;
  sets: ExerciseSet[];
  hasLongRest?: boolean;
  requiresStraps?: boolean;
  hasFinisherTarget?: boolean;
  hasAnchorTarget?: boolean;
  requiresDropSet?: boolean;
  requiresRestPause?: boolean;
  hasPRHit?: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  week: number;
  day: number;
  exercises: ExerciseEntry[];
  protocolId: string;
  warmupCompleted: boolean[];
  stretchingCompleted: boolean[];
  cardioCompleted?: boolean;
  hasPR?: boolean;
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
  targetDuration: number;
  warmup: string[];
  stretching: string[];
  exercises: string[];
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

export interface UserSettings {
  email: string;
  autoRemindExport: boolean;
  autoBackupAfterSession: boolean;
  lastExportMonth: number;
}

export interface ExercisePR {
  date: string;
  weight: number;
  reps: number;
  estimated1RM: number;
}

export interface BodyWeight {
  id: string;
  date: string;
  weight: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  armLeft?: number;
  armRight?: number;
  chest?: number;
  waist?: number;
  quadLeft?: number;
  quadRight?: number;
}

export interface Alert {
  id: string;
  type: 'deload' | 'plateau' | 'pr' | 'milestone' | 'volume-imbalance';
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  exercise?: string;
  muscleGroup?: string;
  createdAt: string;
}