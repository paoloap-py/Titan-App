export const MUSCLE_GROUPS = {
  UPPER_CHEST: "Upper Chest",
  MID_CHEST: "Mid Chest",
  LOWER_CHEST: "Lower Chest",
  LATS: "Lats",
  UPPER_TRAPS: "Upper Traps",
  MID_TRAPS: "Mid Traps",
  ERECTORS: "Erectors",
  FRONT_DELT: "Front Deltoid",
  SIDE_DELT: "Side Deltoid",
  REAR_DELT: "Rear Deltoid",
  ROTATOR_CUFF: "Rotator Cuff",
  BICEP_LONG: "Biceps Long Head",
  BICEP_SHORT: "Biceps Short Head",
  BRACHIALIS: "Brachialis",
  TRICEP_LONG: "Triceps Long Head",
  TRICEP_LATERAL: "Triceps Lateral Head",
  TRICEP_MEDIAL: "Triceps Medial Head",
  FOREARMS: "Forearms",
  ABS: "Abs",
  OBLIQUES: "Obliques",
  QUADS: "Quads",
  HAMSTRINGS: "Hamstrings",
  GLUTES: "Glutes",
  GLUTE_MEDIUS: "Glute Medius",
  ADDUCTORS: "Adductors",
  GASTROCNEMIUS: "Gastrocnemius",
  SOLEUS: "Soleus",
} as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[keyof typeof MUSCLE_GROUPS];

// Map detailed muscles → react-body-highlighter muscle names
export const BODY_HIGHLIGHTER_MAP: Record<MuscleGroup, string> = {
  "Upper Chest": "chest",
  "Mid Chest": "chest",
  "Lower Chest": "chest",
  "Lats": "upper-back",
  "Upper Traps": "trapezius",
  "Mid Traps": "upper-back",
  "Erectors": "lower-back",
  "Front Deltoid": "front-deltoids",
  "Side Deltoid": "back-deltoids",
  "Rear Deltoid": "back-deltoids",
  "Rotator Cuff": "back-deltoids",
  "Biceps Long Head": "biceps",
  "Biceps Short Head": "biceps",
  "Brachialis": "biceps",
  "Triceps Long Head": "triceps",
  "Triceps Lateral Head": "triceps",
  "Triceps Medial Head": "triceps",
  "Forearms": "forearm",
  "Abs": "abs",
  "Obliques": "obliques",
  "Quads": "quadriceps",
  "Hamstrings": "hamstring",
  "Glutes": "gluteal",
  "Glute Medius": "abductors",
  "Adductors": "adductor",
  "Gastrocnemius": "calves",
  "Soleus": "calves",
};

interface MuscleMapping {
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
}

export const EXERCISE_MUSCLE_MAP: Record<string, MuscleMapping> = {
  // UPPER 1
  "MEADOWS ROW": { primary: "Lats", secondary: ["Mid Traps", "Biceps Long Head"] },
  "MACHINE CHEST PRESS": { primary: "Mid Chest", secondary: ["Front Deltoid", "Triceps Lateral Head"] },
  "WEIGHTED DIPS": { primary: "Lower Chest", secondary: ["Triceps Lateral Head", "Front Deltoid"] },
  "CABLE Y-RAISE": { primary: "Side Deltoid", secondary: ["Rear Deltoid"] },
  "REVERSE CABLE CROSSOVER": { primary: "Rear Deltoid" },
  "CABLE EXTERNAL ROTATION": { primary: "Rotator Cuff" },
  "HANGING LEG RAISES": { primary: "Abs" },
  "DEAD HANG": { primary: "Forearms" },
  "DRAGON FLAG": { primary: "Abs", secondary: ["Obliques"] },
  "SKULL CRUSHERS": { primary: "Triceps Long Head" },
  
  // FB1
  "CHEST-SUPPORTED ROW": { primary: "Lats", secondary: ["Mid Traps", "Biceps Long Head"] },
  "LEG PRESS": { primary: "Quads", secondary: ["Glutes"] },
  "FACE PULLS": { primary: "Rear Deltoid", secondary: ["Mid Traps", "Rotator Cuff"] },
  "45° BACK EXTENSION": { primary: "Glutes", secondary: ["Hamstrings", "Erectors"] },
  "SMITH INCLINE BENCH": { primary: "Upper Chest", secondary: ["Front Deltoid", "Triceps Lateral Head"] },
  "CLOSE GRIP BENCH": { primary: "Triceps Lateral Head", secondary: ["Mid Chest"] },
  "CABLE LATERAL RAISE": { primary: "Side Deltoid" },
  "EZ BAR CURL": { primary: "Biceps Short Head", secondary: ["Biceps Long Head"] },
  "INCLINE DUMBBELL CURL": { primary: "Biceps Long Head", secondary: ["Biceps Short Head"] },
  "REVERSE EZ-BAR CURL": { primary: "Brachialis", secondary: ["Forearms"] },
  "CABLE CRUNCH": { primary: "Abs" },
  "SEATED CALF RAISE": { primary: "Soleus" },
  
  // UPPER 2
  "CHEST-SUPPORTED DUAL-CABLE ROW": { primary: "Lats", secondary: ["Mid Traps", "Biceps Long Head"] },
  "ONE-ARM CABLE PULLDOWN": { primary: "Lats" },
  "REVERSE MACHINE FLY": { primary: "Rear Deltoid", secondary: ["Mid Traps"] },
  "SEATED CABLE CHEST FLY": { primary: "Mid Chest" },
  "MACHINE PREACHER CURL": { primary: "Biceps Short Head", secondary: ["Biceps Long Head"] },
  "CABLE KICKBACKS": { primary: "Triceps Long Head" },
  "HANGING CORNER RAISES": { primary: "Obliques", secondary: ["Abs"] },
  "CABLE TWIST": { primary: "Obliques" },
  "WRIST CURL": { primary: "Forearms" },
  
  // LOWER
  "HACK SQUAT": { primary: "Quads", secondary: ["Glutes"] },
  "PENDULUM SQUAT": { primary: "Quads", secondary: ["Glutes"] },
  "WALKING LUNGES": { primary: "Glutes", secondary: ["Quads", "Hamstrings"] },
  "RDL": { primary: "Hamstrings", secondary: ["Glutes", "Erectors"] },
  "LEG CURL SINGOLO": { primary: "Hamstrings" },
  "LYING LEG CURL": { primary: "Hamstrings" },
  "ADDUCTOR MACHINE": { primary: "Adductors" },
  "ABDUCTOR MACHINE": { primary: "Glute Medius" },
  
  // FB2
  "DUAL-CABLE EZ-BAR LAT PULLDOWN": { primary: "Lats", secondary: ["Biceps Long Head"] },
  "DUMBBELL SHRUGS": { primary: "Upper Traps" },
  "MACHINE SHOULDER PRESS": { primary: "Front Deltoid", secondary: ["Side Deltoid", "Triceps Lateral Head"] },
  "INCLINE DB PRESS": { primary: "Upper Chest", secondary: ["Front Deltoid", "Triceps Lateral Head"] },
  "HIGH-TO-LOW CABLE FLY": { primary: "Lower Chest" },
  "STANDING CALF RAISE": { primary: "Gastrocnemius" },
  "BULGARIAN SPLIT SQUAT": { primary: "Quads", secondary: ["Glutes"] },
  "LEG EXTENSION": { primary: "Quads" },
  "OVERHEAD CABLE EXT": { primary: "Triceps Long Head" },
  "HAMMER PREACHER CURL": { primary: "Brachialis", secondary: ["Biceps Long Head"] },
  
  // Default legacy mappings
  "BENCH PRESS": { primary: "Mid Chest", secondary: ["Triceps Lateral Head", "Front Deltoid"] },
  "OVERHEAD PRESS": { primary: "Front Deltoid", secondary: ["Triceps Lateral Head", "Side Deltoid"] },
  "LATERAL RAISE": { primary: "Side Deltoid" },
  "TRICEP PUSHDOWN": { primary: "Triceps Lateral Head" },
  "DEADLIFT": { primary: "Erectors", secondary: ["Hamstrings", "Glutes", "Lats"] },
  "LAT PULLDOWN": { primary: "Lats", secondary: ["Biceps Long Head"] },
  "SEATED ROW": { primary: "Mid Traps", secondary: ["Lats", "Biceps Long Head"] },
  "BICEP CURLS": { primary: "Biceps Long Head", secondary: ["Biceps Short Head"] },
  "SQUAT": { primary: "Quads", secondary: ["Glutes", "Erectors"] }
};

// Internal utility for smarter matching
const findMapping = (exerciseName: string): MuscleMapping | null => {
  const key = exerciseName.toUpperCase().trim();
  // Exact match
  if (EXERCISE_MUSCLE_MAP[key]) return EXERCISE_MUSCLE_MAP[key];
  
  // Partial matches (e.g. "MEADOWS ROWS" matching "MEADOWS ROW")
  const partialMatch = Object.keys(EXERCISE_MUSCLE_MAP).find(k => 
    key.includes(k) || k.includes(key)
  );
  if (partialMatch) return EXERCISE_MUSCLE_MAP[partialMatch];

  // Specific keyword fallback
  if (key.includes("ROW")) return EXERCISE_MUSCLE_MAP["SEATED ROW"];
  if (key.includes("PRESS")) return EXERCISE_MUSCLE_MAP["MACHINE SHOULDER PRESS"];
  if (key.includes("SQUAT")) return EXERCISE_MUSCLE_MAP["SQUAT"];
  if (key.includes("CURL")) return EXERCISE_MUSCLE_MAP["BICEP CURLS"];
  if (key.includes("LAT")) return EXERCISE_MUSCLE_MAP["LAT PULLDOWN"];
  
  return null;
};

// Get muscles in react-body-highlighter format
export const getBodyHighlighterMuscles = (exerciseName: string): string[] => {
  const mapping = findMapping(exerciseName);
  if (!mapping) return [];
  
  const muscles = new Set<string>();
  if (BODY_HIGHLIGHTER_MAP[mapping.primary]) {
    muscles.add(BODY_HIGHLIGHTER_MAP[mapping.primary]);
  }
  if (mapping.secondary) {
    mapping.secondary.forEach(m => {
      if (BODY_HIGHLIGHTER_MAP[m]) muscles.add(BODY_HIGHLIGHTER_MAP[m]);
    });
  }
  return Array.from(muscles);
};

// Get exercise data for react-body-highlighter
export const getExerciseData = (exerciseName: string) => ({
  name: exerciseName,
  muscles: getBodyHighlighterMuscles(exerciseName),
});

// Get detailed muscle info for display
export const getDetailedMuscles = (exerciseName: string): { primary: string; secondary: string[] } | null => {
  const mapping = findMapping(exerciseName);
  if (!mapping) return null;
  return {
    primary: mapping.primary,
    secondary: mapping.secondary || [],
  };
};