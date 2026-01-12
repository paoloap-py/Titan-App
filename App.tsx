import React, { useState, useEffect, useMemo, useRef } from 'react';
import Model from 'react-body-highlighter';
import { 
  History, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Trophy,
  X,
  Check,
  BarChart3,
  AlertTriangle,
  User,
  Settings2,
  ChevronRight,
  Flame,
  Clock,
  Zap,
  Accessibility,
  Weight,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { 
  WorkoutSession, 
  ExerciseEntry, 
  MaxStats, 
  Protocol, 
  UserSettings, 
  ExercisePR,
  BodyWeight,
  BodyMeasurement,
  Alert
} from './types';
import { getBodyHighlighterMuscles } from './muscleMapping';

const DEFAULT_PROTOCOLS: Protocol[] = [
  {
    id: 'titan-133',
    name: 'TITAN 133',
    description: '133 sets per week. Extreme Hypertrophy. 1% Intensity Rules.',
    accentColor: '#dc2626',
    weeklySetTarget: 133,
    rules: [
      'Enforce mechanical tension (Tonnage)',
      '0-1 RPE intensity',
      'Finisher (✋) 10s peak contraction',
      'Anchor (⚓) 30s deep stretch',
      'Compounds (⏱️) get 3 min rest, isolations 90s'
    ],
    days: [
      { 
        day: 1, 
        name: "Upper 1", 
        targetDuration: 95,
        warmup: ["Band Pull-Aparts", "Shoulder Dislocations", "Light Tricep Pushdowns", "Cat-Cow"],
        stretching: ["Doorway Stretch (60s)", "Wrist Stretch (60s)", "Child's Pose (60s)"],
        exercises: [
          "Meadows Row: 3 x 8–10 🎗️✋⚓⏱️", 
          "Machine Chest Press: 3 x 8–10 ✋⚓⏱️", 
          "Weighted Dips: 2 x 8–10 ⏱️", 
          "Cable Y-Raise: 2 x 12–15 🏳️", 
          "Reverse Cable Crossover: 3 x 12–15", 
          "Cable External Rotation: 2 x 15–20", 
          "Hanging Leg Raises: 2 x Failure", 
          "Dead Hang: 3 x Max Hold", 
          "Dragon Flag: 3 x Failure", 
          "Skull Crushers: 2 x 10–12 ⏳⚓"
        ]
      },
      { 
        day: 2, 
        name: "Upper 2", 
        targetDuration: 90,
        warmup: ["Dead Hangs", "Scapular Pull-ups", "Rotator Cuff Rotations", "Light Banded Curls"],
        stretching: ["Cross-Body Shoulder Stretch (60s)", "Child's Pose (60s)", "Puppy Pose (60s)"],
        exercises: [
          "Chest-Supported Dual-Cable Row: 3 x 10–12 🎗️✋⚓⏱️", 
          "One-Arm Cable Pulldown: 3 x 10–12 🎗️⏱️", 
          "Reverse Machine Fly: 3 x 12–15 ⏳", 
          "Seated Cable Chest Fly: 2 x 12–15 ⚓", 
          "Machine Preacher Curl: 3 x 8–10 ⏳⚓", 
          "Cable Kickbacks: 3 x 12–15 🏳️", 
          "Hanging Corner Raises: 2 x Failure", 
          "Cable Twist: 2 x 12–15", 
          "Wrist Curl: 2 x 15–20"
        ]
      },
      { 
        day: 3, 
        name: "Lower", 
        targetDuration: 92,
        warmup: ["Leg Swings", "BW Lunges", "Cossack Squats", "Glute Bridges"],
        stretching: ["Pigeon Pose (60s)", "Couch Stretch (60s)", "Calf Stretch (60s)"],
        exercises: [
          "Hack Squat: 3 x 6–8 ⚓⏱️", 
          "Pendulum Squat: 3 x 8–10 ⏱️", 
          "Walking Lunges: 4 x 10/leg ⏱️", 
          "RDL: 3 x 8–10 🎗️⚓⏱️", 
          "Leg Curl Singolo: 3 x 10–12 🏳️", 
          "Lying Leg Curl: 1 x 10–12 ⚓", 
          "Adductor Machine: 2 x 12–15", 
          "Abductor Machine: 2 x 12–15", 
          "Seated Calf Raise: 3 x 12–15 ⏳"
        ]
      },
      { 
        day: 4, 
        name: "FB 1", 
        targetDuration: 115,
        warmup: ["World's Greatest Stretch", "Thoracic Rotations", "Face Pulls", "Bird-Dogs"],
        stretching: ["Static Lunge Hold (60s)", "Hamstring Fold (60s)"],
        exercises: [
          "Chest-Supported Row: 3 x 8–10 🎗️⏱️", 
          "Leg Press: 3 x 10–12 ⏱️", 
          "Face Pulls: 3 x 12–15 ⏳", 
          "45° Back Extension: 4 x 12–15", 
          "Smith Incline Bench: 2 x 6–8 ⚓⏱️", 
          "Close Grip Bench: 3 x 8–10 ⏱️", 
          "Cable Lateral Raise: 3 x 12–15 🏳️", 
          "EZ Bar Curl: 3 x 8–10 ⏳", 
          "Reverse EZ-Bar Curl: 3 x 12–15", 
          "Cable Crunch: 3 x 12–15 ⏳", 
          "Seated Calf Raise: 2 x 12–15 ⏳"
        ]
      },
      { 
        day: 5, 
        name: "FB 2", 
        targetDuration: 105,
        warmup: ["Arm Circles", "Air Squats", "Wall Slides", "Band Disconnects"],
        stretching: ["Couch Stretch (60s)", "Doorway Stretch (60s)", "Child's Pose (60s)"],
        exercises: [
          "Dual-Cable EZ-Bar Lat Pulldown: 3 x 10–12 ✋⚓⏱️", 
          "Machine Shoulder Press: 4 x 8–10 ⏱️", 
          "Incline DB Press: 3 x 8–10 ⚓⏱️", 
          "High-to-Low Cable Fly: 2 x 12–15 🏳️", 
          "STANDING CALF RAISE: 3 x 12–15 ⏳", 
          "Bulgarian Split Squat: 3 x 8–10 ⏱️", 
          "Lying Leg Curl: 3 x 10–12 ⚓", 
          "Leg Extension: 2 x 12–15 🏳️⚓", 
          "Overhead Cable Ext: 3 x 10–12 ⏳⚓🎗️", 
          "Hammer Preacher Curl: 3 x 8–10 ⏳⚓"
        ]
      }
    ]
  }
];

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  accent: string; 
  icon?: React.ReactNode;
}> = ({ label, value, accent, icon }) => (
  <div className={`bg-[#0e0e0e] border border-white/5 p-6 rounded-3xl flex flex-col justify-between transition-all hover:border-white/10 group`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
      <div className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-black tracking-tighter" style={{ color: accent }}>{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<{ 
  sessions: WorkoutSession[]; 
  maxes: MaxStats; 
  protocol: Protocol; 
}> = ({ sessions, maxes, protocol }) => {
  const latestWeek = useMemo(() => sessions.length > 0 ? sessions[0].week : 1, [sessions]);
  
  const currentWeekSessions = useMemo(() => 
    sessions.filter(s => s.week === latestWeek), 
  [sessions, latestWeek]);

  const weeklyCardioCount = useMemo(() => 
    currentWeekSessions.filter(s => s.cardioCompleted).length, 
  [currentWeekSessions]);

  const weeklyStretchingCount = useMemo(() => 
    currentWeekSessions.filter(s => s.stretchingCompleted && s.stretchingCompleted.length > 0 && s.stretchingCompleted.every(v => v === true)).length, 
  [currentWeekSessions]);

  const weeklySessionCount = useMemo(() => 
    currentWeekSessions.filter(s => s.protocolId === protocol.id).length, 
  [currentWeekSessions, protocol.id]);

  const weeklyMuscles = useMemo(() => {
    const muscles = new Set<string>();
    currentWeekSessions.forEach(s => {
      s.exercises.forEach(ex => {
        getBodyHighlighterMuscles(ex.name).forEach(m => muscles.add(m));
      });
    });
    return Array.from(muscles).map(m => ({ name: m, muscles: [m] }));
  }, [currentWeekSessions]);

  const totalTonnage = useMemo(() => {
    return sessions.reduce((acc, s) => {
      const sessionTotal = s.exercises.reduce((exAcc, ex) => {
        const exerciseTotal = ex.sets.reduce((setAcc, set) => 
          setAcc + (set.completed ? (set.weight * set.reps) : 0), 0);
        return exAcc + exerciseTotal;
      }, 0);
      return acc + sessionTotal;
    }, 0) / 1000;
  }, [sessions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">COMMAND</h1>
          <p className="font-mono mt-2 tracking-[0.3em] text-xs font-bold uppercase text-zinc-500">Operational Dashboard</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="SESSIONS" value={`${weeklySessionCount}/5`} accent={protocol.accentColor} icon={<Target size={16} />} />
        <StatCard label="CARDIO" value={`${weeklyCardioCount}/5`} accent="#f97316" icon={<Zap size={16} />} />
        <StatCard label="STRETCHING" value={`${weeklyStretchingCount}/5`} accent="#f97316" icon={<Accessibility size={16} />} />
        <StatCard label="TOTAL TONNAGE" value={`${totalTonnage.toFixed(1)}t`} accent={protocol.accentColor} icon={<Weight size={16} />} />
        <StatCard label="MAX MEADOWS" value={`${maxes.meadowsRow}kg`} accent={protocol.accentColor} icon={<Trophy size={16} />} />
        <StatCard label="PROTOCOL" value={protocol.name} accent={protocol.accentColor} icon={<Settings2 size={16} />} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Weekly Muscle Coverage</h3>
              <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-tighter italic">Intensity indicates volume density</p>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black text-white bg-white/5 px-3 py-1 rounded-lg uppercase">Week {latestWeek}</span>
            </div>
          </div>
          <div className="flex justify-center gap-12 py-6 bg-black/40 rounded-[40px] border border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Anterior</span>
                <Model type="anterior" data={weeklyMuscles as any} highlightedColors={[protocol.accentColor]} style={{ width: '220px' }} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Posterior</span>
                <Model type="posterior" data={weeklyMuscles as any} highlightedColors={[protocol.accentColor]} style={{ width: '220px' }} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RestTimer: React.FC<{ seconds: number; color: string; onComplete: () => void; onCancel: () => void }> = ({ seconds, color, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const initialSeconds = useRef(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = (timeLeft / initialSeconds.current) * 100;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl p-10 max-w-xs w-full text-center space-y-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle 
              cx="96" 
              cy="96" 
              r="88" 
              fill="transparent" 
              stroke={timeLeft <= 3 ? '#ef4444' : color} 
              strokeWidth="8" 
              strokeDasharray={552.92} 
              strokeDashoffset={552.92 * (1 - progress / 100)} 
              strokeLinecap="round" 
              className="transition-all duration-1000 linear" 
            />
          </svg>
          <div className={`text-5xl font-black tracking-tighter font-mono transition-colors ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {formatDuration(timeLeft * 1000)}
          </div>
        </div>
        <button onClick={onCancel} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-all">ABORT</button>
      </div>
    </div>
  );
};

const WorkoutLogger: React.FC<{ 
  protocol: Protocol; 
  onSave: (session: WorkoutSession) => void; 
  currentWeek: number; 
  recommendedDay: number; 
  onStartRest: (s: number) => void;
}> = ({ protocol, onSave, currentWeek, recommendedDay, onStartRest }) => {
  const [week, setWeek] = useState(currentWeek);
  const [day, setDay] = useState(recommendedDay); 
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [warmupStatus, setWarmupStatus] = useState<boolean[]>([]);
  const [stretchingStatus, setStretchingStatus] = useState<boolean[]>([]);
  const [cardioCompleted, setCardioCompleted] = useState(false);
  const initialLoadRef = useRef(false);

  const loadTemplate = (templateDay: number) => {
    const template = protocol.days.find(t => t.day === templateDay);
    if (!template) return;
    setDay(templateDay);
    setWarmupStatus(new Array(template.warmup.length).fill(false));
    setStretchingStatus(new Array(template.stretching.length).fill(false));
    setCardioCompleted(false);
    
    setExercises(template.exercises.map(rawName => ({
      id: crypto.randomUUID(),
      name: rawName.split(':')[0].trim().toUpperCase(),
      targetRepRange: '8-10',
      sets: [{reps: 8, weight: 0, completed: false}],
      hasLongRest: rawName.includes('⏱️')
    })));
  };

  useEffect(() => { 
    if (!initialLoadRef.current) { 
      loadTemplate(recommendedDay); 
      initialLoadRef.current = true; 
    } 
  }, [recommendedDay, protocol]);

  const toggleComplete = (exId: string, setIdx: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const newSets = ex.sets.map((s, i) => i === setIdx ? { ...s, completed: !s.completed } : s);
      const justCompleted = newSets[setIdx].completed;
      if (justCompleted) onStartRest(ex