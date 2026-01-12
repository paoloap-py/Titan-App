import React, { useState, useEffect, useMemo, useRef } from 'react';
import Model from 'react-body-highlighter';
import { 
  History, 
  LayoutDashboard, 
  Plus, 
  TrendingUp, 
  Trash2, 
  Zap, 
  Trophy,
  Clock,
  Link as LinkIcon,
  Info,
  Flame,
  BarChart3,
  X,
  Check,
  Download,
  Activity,
  TimerReset,
  Focus,
  PlusCircle,
  Search,
  Settings2,
  AlertTriangle,
  Award,
  User,
  Anchor,
  Square,
  ChevronRight,
  Database,
  FileUp,
  Calendar,
  Ruler,
  Star,
  ZapOff,
  Target,
  ArrowUpRight,
  Circle,
  Footprints,
  ChevronDown,
  ChevronUp,
  Save,
  Accessibility
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  WorkoutSession, 
  ExerciseEntry, 
  MaxStats, 
  ExerciseSet, 
  Protocol, 
  UserSettings, 
  ExercisePR,
  BodyWeight,
  BodyMeasurement,
  Alert
} from './types';
import { getBodyHighlighterMuscles, getExerciseData, getDetailedMuscles } from './muscleMapping';

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
  },
  {
    id: 'standard-ppl',
    name: 'PUSH PULL LEGS',
    description: 'Classic 6-day split. Progressive overload. 3-4 RIR.',
    accentColor: '#2563eb',
    weeklySetTarget: 72,
    rules: [
      'Standard progressive overload',
      '90-120s rest periods',
      'Maintain 2-3 RIR on main lifts'
    ],
    days: [
      { day: 1, name: "Push", targetDuration: 60, warmup: [], stretching: [], exercises: ["Bench Press", "Overhead Press", "Incline DB Press", "Lateral Raise", "Tricep Pushdown"]},
      { day: 2, name: "Pull", targetDuration: 60, warmup: [], stretching: [], exercises: ["Deadlift", "Lat Pulldown", "Seated Row", "Face Pulls", "Bicep Curls"]},
      { day: 3, name: "Legs", targetDuration: 60, warmup: [], stretching: [], exercises: ["Squat", "Leg Press", "Leg Curl", "Calf Raise"]}
    ]
  }
];

const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const generateAlerts = (sessions: WorkoutSession[], protocol: Protocol): Alert[] => {
  const alerts: Alert[] = [];
  if (sessions.length === 0) return [];
  
  const currentWeek = sessions[0]?.week || 0;

  if (currentWeek >= 6) {
    alerts.push({
      id: 'deload-warning-fatigue', type: 'deload', severity: 'warning', title: 'DELOAD RECOMMENDED',
      message: `System operational for ${currentWeek} weeks. Cycle intensity down to prevent burnout.`,
      createdAt: new Date().toISOString()
    });
  }

  const exerciseHistory: Record<string, number[]> = {};
  sessions.forEach(s => {
    s.exercises.forEach(ex => {
      const maxW = Math.max(...ex.sets.map(set => set.weight));
      if (maxW > 0) {
        if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
        exerciseHistory[ex.name].push(maxW);
      }
    });
  });

  Object.entries(exerciseHistory).forEach(([name, weights]) => {
    if (weights.length >= 3) {
      const w1 = weights[0];
      const w2 = weights[1];
      const w3 = weights[2];

      if (w1 < w2 && w2 < w3) {
        alerts.push({
          id: `deload-${name}`, type: 'deload', severity: 'warning', title: 'FORCE LOSS DETECTED',
          message: `${name} output dropping (W: ${w1} < ${w2} < ${w3}). System-wide deload advised.`,
          exercise: name, createdAt: new Date().toISOString()
        });
      }

      if (Math.abs(w1 - w2) <= 2.5 && Math.abs(w2 - w3) <= 2.5) {
        alerts.push({
          id: `plateau-${name}`, type: 'plateau', severity: 'danger', title: 'STAGNATION DETECTED',
          message: `${name} has stalled for 3 sessions. Increase mechanical tension or switch variation.`,
          exercise: name, createdAt: new Date().toISOString()
        });
      }
    }
  });

  const latestSession = sessions[0];
  if (latestSession && latestSession.day >= 4) {
    const minTargets: Record<string, number> = {
      chest: 10, back: 12, shoulders: 8, biceps: 8, triceps: 8, quads: 10, hamstrings: 8, glutes: 8, calves: 6, core: 6
    };
    const currentWeekVol: Record<string, number> = {
      chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0
    };

    sessions.filter(s => s.week === latestSession.week).forEach(s => {
      s.exercises.forEach(ex => {
        const muscles = getBodyHighlighterMuscles(ex.name);
        const setWeight = ex.sets.length;
        muscles.forEach(m => {
          if (['chest'].includes(m)) currentWeekVol.chest += setWeight;
          else if (['upper-back', 'trapezius', 'lower-back'].includes(m)) currentWeekVol.back += setWeight;
          else if (['front-deltoids', 'back-deltoids'].includes(m)) currentWeekVol.shoulders += setWeight;
          else if (['biceps'].includes(m)) currentWeekVol.biceps += setWeight;
          else if (['triceps'].includes(m)) currentWeekVol.triceps += setWeight;
          else if (['quadriceps'].includes(m)) currentWeekVol.quads += setWeight;
          else if (['hamstring'].includes(m)) currentWeekVol.hamstrings += setWeight;
          else if (['gluteal', 'abductors', 'adductor'].includes(m)) currentWeekVol.glutes += setWeight;
          else if (['calves'].includes(m)) currentWeekVol.calves += setWeight;
          else if (['abs', 'obliques'].includes(m)) currentWeekVol.core += setWeight;
        });
      });
    });

    Object.entries(minTargets).forEach(([muscle, target]) => {
      if (currentWeekVol[muscle] < target * 0.8) {
        alerts.push({
          id: `imbalance-${muscle}`, type: 'volume-imbalance', severity: 'warning', title: 'VOLUME DEFICIT',
          message: `${muscle.toUpperCase()} volume is under 80% of minimum growth requirement for Day ${latestSession.day}.`,
          muscleGroup: muscle, createdAt: new Date().toISOString()
        });
      }
    });
  }

  return alerts;
};

const getRollingAverageBody = (weights: BodyWeight[]) => {
  if (weights.length === 0) return null;
  const sorted = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const last7 = sorted.slice(0, 7);
  const avg = last7.reduce((acc, w) => acc + w.weight, 0) / last7.length;
  return avg.toFixed(1);
};

const getWeightChangeBody = (weights: BodyWeight[]) => {
  if (weights.length < 2) return null;
  const sorted = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cutoff = new Date(new Date(sorted[0].date).getTime() - 30 * 24 * 60 * 60 * 1000);
  const olderWeights = sorted.filter(w => new Date(w.date) <= cutoff);
  if (olderWeights.length === 0) return null;
  const change = sorted[0].weight - olderWeights[0].weight;
  return change.toFixed(1);
};

const StatCard: React.FC<{ mini?: boolean; label: string; value: string; accent: string; subValue?: string; subColor?: string }> = ({ mini, label, value, accent, subValue, subColor }) => (
  <div className={`bg-[#0e0e0e] border border-white/5 p-6 rounded-3xl ${mini ? '' : 'flex-1'}`}>
    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-black tracking-tighter" style={{ color: accent }}>{value}</p>
      {subValue && (
        <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: subColor }}>{subValue}</span>
      )}
    </div>
  </div>
);

const Dashboard: React.FC<{ 
  sessions: WorkoutSession[]; 
  maxes: MaxStats; 
  protocol: Protocol; 
  onProtocolChange: (id: string) => void;
  protocols: Protocol[];
  dismissedAlerts: string[];
  onDismissAlert: (id: string) => void;
}> = ({ sessions, maxes, protocol, onProtocolChange, protocols, dismissedAlerts, onDismissAlert }) => {
  const alerts = useMemo(() => 
    generateAlerts(sessions.filter(s => s.protocolId === protocol.id), protocol)
      .filter(a => !dismissedAlerts.includes(a.id)),
  [sessions, protocol, dismissedAlerts]);
  
  const currentWeekSessions = useMemo(() => {
    if (sessions.length === 0) return [];
    const latestWeek = sessions[0].week;
    return sessions.filter(s => s.week === latestWeek);
  }, [sessions]);

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

  const weeklyCardioCount = useMemo(() => {
    const latestWeek = sessions[0]?.week || 0;
    const currentWeekData = sessions.filter(s => s.week === latestWeek && s.protocolId === protocol.id);
    return currentWeekData.filter(s => s.cardioCompleted).length;
  }, [sessions, protocol.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div><h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">COMMAND</h1><p className="font-mono mt-2 tracking-[0.3em] text-xs font-bold uppercase text-zinc-500">Operational Dashboard</p></div>
        <div className="flex bg-[#0e0e0e] p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
          {protocols.map(p => (
            <button key={p.id} onClick={() => onProtocolChange(p.id)} className={`whitespace-nowrap flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${protocol.id === p.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>{p.name}</button>
          ))}
        </div>
      </header>

      {alerts.length > 0 && (
        <div className="space-y-3">{alerts.map(alert => (
          <div key={alert.id} className={`flex items-start gap-4 p-6 rounded-3xl border transition-all ${alert.severity === 'danger' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-red-500/20'}`}><AlertTriangle className={alert.severity === 'danger' ? 'text-red-500' : 'text-yellow-500'} size={24} />
            <div className="flex-1"><h4 className="font-black uppercase text-sm tracking-tight text-white">{alert.title}</h4><p className="text-xs text-gray-400 mt-1">{alert.message}</p></div>
            <button onClick={() => onDismissAlert(alert.id)} className="text-gray-500 hover:text-white"><X size={20} /></button>
          </div>
        ))}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="SESSIONS" value={`${sessions.length}`} accent={protocol.accentColor} />
        <StatCard label="CARDIO" value={`${weeklyCardioCount}/5`} accent="#f97316" />
        <StatCard label="TOTAL TONNAGE" value={`${totalTonnage.toFixed(1)}t`} accent={protocol.accentColor} />
        <StatCard label="MAX MEADOWS" value={`${maxes.meadowsRow}kg`} accent={protocol.accentColor} />
        <StatCard label="PROTOCOL" value={protocol.name} accent={protocol.accentColor} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Weekly Muscle Coverage</h3>
              <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-tighter italic">Intensity indicates volume density</p>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black text-white bg-white/5 px-3 py-1 rounded-lg uppercase">Week {sessions[0]?.week || 1}</span>
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
    if (timeLeft <= 0) { onComplete(); return; }
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
            <circle cx="96" cy="96" r="88" fill="transparent" stroke={color} strokeWidth="8" strokeDasharray={552.92} strokeDashoffset={552.92 * (1 - progress / 100)} strokeLinecap="round" className="transition-all duration-1000 linear" />
          </svg>
          <div className="text-5xl font-black tracking-tighter text-white font-mono">{formatDuration(timeLeft * 1000)}</div>
        </div>
        <button onClick={onCancel} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-all">ABORT</button>
      </div>
    </div>
  );
};

const PRToast: React.FC<{ exercise: string; new1RM: number; improvement: number; onDismiss: () => void; }> = ({ exercise, new1RM, improvement, onDismiss }) => {
  useEffect(() => { const timer = setTimeout(onDismiss, 4000); return () => clearTimeout(timer); }, [onDismiss]);
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10 duration-500 bg-gradient-to-r from-yellow-500 to-orange-500 min-w-[320px]">
      <Trophy size={28} className="text-black" />
      <div className="flex-1"><p className="font-black text-sm uppercase tracking-tight text-black leading-none">{exercise}</p><p className="text-[11px] text-black/80 font-bold mt-1 uppercase tracking-tighter">New 1RM: {new1RM}kg (+{improvement}kg)</p></div>
      <button onClick={onDismiss} className="text-black"><X size={16} /></button>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'reports' | 'body' | 'settings' | 'history'>('dashboard');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPrs] = useState<Record<string, ExercisePR[]>>({});
  const [maxes, setMaxes] = useState<MaxStats>({ meadowsRow: 0, machinePress: 0, hackSquat: 0, rdl: 0, smithIncline: 0 });
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [activeProtocolId, setActiveProtocolId] = useState(localStorage.getItem('titan_protocol') || 'titan-133');
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ email: 'paolo.perrone@gmail.com', autoRemindExport: true, autoBackupAfterSession: true, lastExportMonth: new Date().getMonth() });
  const [bodyWeights, setBodyWeights] = useState<BodyWeight[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [prToast, setPrToast] = useState<{ exercise: string; new1RM: number; improvement: number } | null>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('titan_sessions');
    const savedMaxes = localStorage.getItem('titan_maxes');
    const savedPrs = localStorage.getItem('titan_prs_v1');
    const savedProtocols = localStorage.getItem('titan_protocols_v4'); 
    const savedSettings = localStorage.getItem('titan_settings_v1');
    const savedWeights = localStorage.getItem('titan_bodyweights');
    const savedMeasurements = localStorage.getItem('titan_measurements');
    const savedDismissed = localStorage.getItem('titan_dismissed_alerts');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedMaxes) setMaxes(JSON.parse(savedMaxes));
    if (savedPrs) setPrs(JSON.parse(savedPrs));
    if (savedWeights) setBodyWeights(JSON.parse(savedWeights));
    if (savedMeasurements) setBodyMeasurements(JSON.parse(savedMeasurements));
    if (savedDismissed) setDismissedAlerts(JSON.parse(savedDismissed));
    if (savedProtocols) setProtocols(JSON.parse(savedProtocols)); else setProtocols(DEFAULT_PROTOCOLS);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_sessions', JSON.stringify(sessions));
    localStorage.setItem('titan_maxes', JSON.stringify(maxes));
    localStorage.setItem('titan_prs_v1', JSON.stringify(prs));
    localStorage.setItem('titan_protocol', activeProtocolId);
    localStorage.setItem('titan_protocols_v4', JSON.stringify(protocols));
    localStorage.setItem('titan_settings_v1', JSON.stringify(settings));
    localStorage.setItem('titan_bodyweights', JSON.stringify(bodyWeights));
    localStorage.setItem('titan_measurements', JSON.stringify(bodyMeasurements));
    localStorage.setItem('titan_dismissed_alerts', JSON.stringify(dismissedAlerts));
  }, [sessions, maxes, prs, activeProtocolId, protocols, settings, bodyWeights, bodyMeasurements, dismissedAlerts]);

  const activeProtocol = useMemo(() => protocols.find(p => p.id === activeProtocolId) || protocols[0] || DEFAULT_PROTOCOLS[0], [activeProtocolId, protocols]);

  const autoBackup = () => {
    const keys = [
      'titan_sessions', 'titan_maxes', 'titan_prs_v1', 'titan_protocols_v4',
      'titan_settings_v1', 'titan_bodyweights', 'titan_measurements', 'titan_dismissed_alerts'
    ];
    const backup: { exportDate: string; data: Record<string, any> } = {
      exportDate: new Date().toISOString(),
      data: {}
    };
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          backup.data[key] = JSON.parse(val);
        } catch (e) {
          console.error(`Failed to parse ${key}`);
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan-auto-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddSession = (session: WorkoutSession) => {
    setSessions(prev => [session, ...prev]);
    const newMaxes = { ...maxes };
    session.exercises.forEach(ex => {
      const weight = Math.max(...ex.sets.map(s => s.weight));
      const n = ex.name.toLowerCase();
      if (n.includes('meadows')) newMaxes.meadowsRow = Math.max(newMaxes.meadowsRow, weight);
      if (n.includes('machine press')) newMaxes.machinePress = Math.max(newMaxes.machinePress, weight);
      if (n.includes('hack squat')) newMaxes.hackSquat = Math.max(newMaxes.hackSquat, weight);
      if (n.includes('rdl')) newMaxes.rdl = Math.max(newMaxes.rdl, weight);
      if (n.includes('smith incline')) newMaxes.smithIncline = Math.max(newMaxes.smithIncline, weight);
    });
    setMaxes(newMaxes);
    setActiveTab('dashboard');
    if (settings.autoBackupAfterSession) {
      setTimeout(autoBackup, 500);
    }
  };

  const checkPR = (exercise: string, weight: number, reps: number) => {
    const key = exercise.toUpperCase();
    const history = prs[key] || [];
    const best1RM = history.length > 0 ? Math.max(...history.map(p => p.estimated1RM)) : 0;
    const current1RM = calculate1RM(weight, reps);
    if (current1RM > best1RM && current1RM > 0) {
      const improvement = best1RM === 0 ? current1RM : current1RM - best1RM;
      setPrs(prev => ({ ...prev, [key]: [...(prev[key] || []), { date: new Date().toISOString(), weight, reps, estimated1RM: current1RM }] }));
      setPrToast({ exercise, new1RM: current1RM, improvement });
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 pb-24 lg:pb-0 lg:pl-64">
      {timerSeconds !== null && <RestTimer seconds={timerSeconds} color={activeProtocol.accentColor} onComplete={() => setTimerSeconds(null)} onCancel={() => setTimerSeconds(null)} />}
      {prToast && <PRToast exercise={prToast.exercise} new1RM={prToast.new1RM} improvement={prToast.improvement} onDismiss={() => setPrToast(null)} />}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/5 flex justify-around p-2 z-50 lg:top-0 lg:left-0 lg:h-full lg:w-64 lg:flex-col lg:justify-start lg:border-r lg:border-t-0 lg:p-6 shadow-2xl select-none">
        <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="COMMAND" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'log'} onClick={() => setActiveTab('log')} icon={<Plus />} label="LOG" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 />} label="REPORTS" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'body'} onClick={() => setActiveTab('body')} icon={<User />} label="BODY" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label="ARCHIVE" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 />} label="SYSTEM" accent={activeProtocol.accentColor} />
      </nav>
      <main className="max-w-6xl mx-auto p-4 lg:p-10">
        {activeTab === 'dashboard' && <Dashboard sessions={sessions} maxes={maxes} protocol={activeProtocol} onProtocolChange={setActiveProtocolId} protocols={protocols} dismissedAlerts={dismissedAlerts} onDismissAlert={(id) => setDismissedAlerts(prev => [...prev, id])} />}
        {activeTab === 'log' && <WorkoutLogger protocol={activeProtocol} prs={prs} sessions={sessions} onSave={handleAddSession} currentWeek={sessions[0]?.week || 1} recommendedDay={(sessions[0]?.day % activeProtocol.days.length) + 1 || 1} onStartRest={(s) => setTimerSeconds(s)} onPRCheck={checkPR} />}
        {activeTab === 'history' && <HistoryView sessions={sessions} onDelete={(id) => setSessions(prev => prev.filter(s => s.id !== id))} protocols={protocols} />}
        {activeTab === 'reports' && <ReportsView sessions={sessions} prs={prs} protocol={activeProtocol} />}
        {activeTab === 'body' && <BodyStatsView bodyWeights={bodyWeights} bodyMeasurements={bodyMeasurements} onAddWeight={(w) => setBodyWeights(prev => [...prev, w])} onAddMeasurement={(m) => setBodyMeasurements(prev => [...prev, m])} onDeleteWeight={(id) => setBodyWeights(prev => prev.filter(w => w.id !== id))} onDeleteMeasurement={(id) => setBodyMeasurements(prev => prev.filter(m => m.id !== id))} accentColor={activeProtocol.accentColor} />}
        {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={setSettings} />}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; accent: string }> = ({ active, onClick, icon, label, accent }) => (
  <button onClick={onClick} className={`flex flex-col lg:flex-row items-center lg:space-x-4 px-2 lg:px-4 py-3 rounded-2xl transition-all ${active ? 'bg-white/5' : 'text-gray-500 hover:text-white'}`} style={{ color: active ? accent : undefined }}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
    <span className="text-[9px] lg:text-sm font-black uppercase tracking-widest">{label}</span>
  </button>
);

const WorkoutLogger: React.FC<{ 
  protocol: Protocol; 
  prs: Record<string, ExercisePR[]>;
  sessions: WorkoutSession[];
  onSave: (session: WorkoutSession) => void; 
  currentWeek: number; 
  recommendedDay: number; 
  onStartRest: (s: number) => void;
  onPRCheck: (exercise: string, weight: number, reps: number) => boolean;
}> = ({ protocol, onSave, currentWeek, recommendedDay, onStartRest, onPRCheck, sessions }) => {
  const [week, setWeek] = useState(currentWeek);
  const [day, setDay] = useState(recommendedDay); 
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [warmupStatus, setWarmupStatus] = useState<boolean[]>([]);
  const [stretchingStatus, setStretchingStatus] = useState<boolean[]>([]);
  const [cardioCompleted, setCardioCompleted] = useState(false);
  const initialLoadRef = useRef(false);
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<string | null>(null);

  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [exerciseTimings, setExerciseTimings] = useState<Record<string, { start: number }>>({});

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const weeklyCardioCount = useMemo(() => {
    const completedThisWeek = sessions.filter(s => s.week === week && s.protocolId === protocol.id && s.cardioCompleted).length;
    return completedThisWeek + (cardioCompleted ? 1 : 0);
  }, [sessions, week, protocol.id, cardioCompleted]);

  const cleanName = (name: string) => name.split(':')[0].replace(/[🎗️🛑⚓✋⏱️🏳️⏳🤚🔻🛒]/g, '').trim();

  const getLastWeight = (exerciseName: string): number => {
    const cleaned = exerciseName.toUpperCase().trim();
    for (const session of sessions) {
      const match = session.exercises.find(ex => ex.name === cleaned);
      if (match && match.sets.length > 0) {
        return match.sets[0].weight || 0;
      }
    }
    return 0;
  };

  const loadTemplate = (templateDay: number) => {
    const template = protocol.days.find(t => t.day === templateDay);
    if (!template) return;
    setDay(templateDay);
    setWarmupStatus(new Array(template.warmup.length).fill(false));
    setStretchingStatus(new Array(template.stretching.length).fill(false));
    setCardioCompleted(false);
    
    const newExs: ExerciseEntry[] = template.exercises.map(rawName => {
      const patternMatch = rawName.match(/(\d+)\s*x\s*([0-9\–\-FailureMax\sHold]+)/i);
      
      let setCount = 3;
      let minReps = 8;
      let repRange = '8-10';
      
      if (patternMatch) {
        setCount = parseInt(patternMatch[1]);
        const repPart = patternMatch[2].trim();
        if (repPart.toLowerCase().includes('failure') || repPart.toLowerCase().includes('max')) {
          minReps = 0; 
          repRange = repPart.toUpperCase();
        } else {
          const numbers = repPart.match(/\d+/g);
          if (numbers) {
            minReps = parseInt(numbers[0]);
            repRange = numbers.length > 1 ? `${numbers[0]}-${numbers[1]}` : `${numbers[0]}`;
          }
        }
      }

      const exerciseCleanName = cleanName(rawName).toUpperCase();
      const lastWeight = getLastWeight(exerciseCleanName);

      return {
        id: crypto.randomUUID(),
        name: exerciseCleanName,
        targetRepRange: repRange,
        sets: Array(setCount).fill(null).map(() => ({
          reps: minReps, weight: lastWeight, completed: false,
          usedStraps: rawName.includes('🎗️'),
          isFinisher: false, isAnchor: false, isDropSet: false, isRestPause: false
        })),
        hasLongRest: rawName.includes('⏱️'),
        requiresStraps: rawName.includes('🎗️'),
        hasFinisherTarget: rawName.includes('🤚') || rawName.includes('✋'),
        hasAnchorTarget: rawName.includes('⚓'),
        requiresDropSet: rawName.includes('🔻') || rawName.includes('🏳️'),
        requiresRestPause: rawName.includes('⏳')
      };
    });
    setExercises(newExs);
    setSessionStartTime(null);
    setSessionEndTime(null);
    setExerciseTimings({});
  };

  useEffect(() => { if (!initialLoadRef.current) { loadTemplate(recommendedDay); initialLoadRef.current = true; } }, [recommendedDay, protocol]);

  const currentProtocolDay = protocol.days.find(d => d.day === day);

  const sessionStats = useMemo(() => {
    const WORK_PER_SET = 60 * 1000; 
    const TRANSITION_PER_EX = 120 * 1000; 
    let plannedTotal = 0;
    let remainingPlanned = 0;
    const perExPlanned: Record<string, number> = {};
    exercises.forEach((ex, idx) => {
      const restVal = (ex.hasLongRest ? 180 : 90) * 1000;
      const exPlanned = (ex.sets.length * WORK_PER_SET) + ((ex.sets.length - 1) * restVal);
      perExPlanned[ex.id] = exPlanned;
      plannedTotal += exPlanned;
      if (idx < exercises.length - 1) plannedTotal += TRANSITION_PER_EX;
      const completedSets = ex.sets.filter(s => s.completed).length;
      if (completedSets !== ex.sets.length) {
        const remainingSets = ex.sets.length - completedSets;
        remainingPlanned += (remainingSets * WORK_PER_SET) + (Math.max(0, remainingSets - 1) * restVal);
        if (idx < exercises.length - 1) remainingPlanned += TRANSITION_PER_EX;
      }
    });
    const activeEnd = sessionEndTime || currentTime;
    const elapsed = sessionStartTime ? activeEnd - sessionStartTime : 0;
    const projectedTotal = sessionStartTime ? (elapsed + remainingPlanned) : plannedTotal;
    return { plannedTotal, perExPlanned, elapsed, remainingPlanned, projectedTotal };
  }, [exercises, sessionStartTime, sessionEndTime, currentTime]);

  const updateSet = (exId: string, setIdx: number, updates: Partial<ExerciseSet>) => {
    const now = Date.now();
    if (updates.weight !== undefined || updates.reps !== undefined) {
      if (!sessionStartTime) setSessionStartTime(now);
      if (!exerciseTimings[exId]) setExerciseTimings(prev => ({ ...prev, [exId]: { start: now } }));
    }
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const newSets = [...ex.sets];
      const oldWeight = newSets[setIdx].weight;
      const oldReps = newSets[setIdx].reps;
      newSets[setIdx] = { ...newSets[setIdx], ...updates };
      for (let i = setIdx + 1; i < newSets.length; i++) {
        if (updates.weight !== undefined && newSets[i].weight === oldWeight) newSets[i].weight = updates.weight;
        if (updates.reps !== undefined && newSets[i].reps === oldReps) newSets[i].reps = updates.reps;
      }
      return { ...ex, sets: newSets };
    }));
  };

  const toggleComplete = (exId: string, setIdx: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return { ...ex, sets: ex.sets.map((s, i) => {
        if (i === setIdx) {
          const newState = !s.completed;
          if (newState) {
            onStartRest(ex.hasLongRest ? 180 : 90);
            if (s.weight > 0 && s.reps > 0) onPRCheck(ex.name, s.weight, s.reps);
          }
          return { ...s, completed: newState };
        }
        return s;
      })};
    }));
  };

  const toggleExerciseComplete = (exId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const allCompleted = ex.sets.every(s => s.completed);
      return { ...ex, sets: ex.sets.map(s => ({ ...s, completed: !allCompleted })) };
    }));
  };

  const toggleWarmup = (idx: number) => {
    if (!sessionStartTime) setSessionStartTime(Date.now());
    const newStatus = [...warmupStatus];
    newStatus[idx] = !newStatus[idx];
    setWarmupStatus(newStatus);
  };

  const toggleStretching = (idx: number) => {
    const newStatus = [...stretchingStatus];
    newStatus[idx] = !newStatus[idx];
    setStretchingStatus(newStatus);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-[#0e0e0e] border rounded-3xl p-6 flex flex-col transition-all duration-500 ${sessionStartTime && !sessionEndTime ? 'border-white/20' : 'border-white/5'}`} style={{ borderColor: sessionStartTime && !sessionEndTime ? protocol.accentColor : undefined }}>
          <div className="flex items-center gap-2 mb-2"><Activity size={14} className={sessionStartTime && !sessionEndTime ? 'animate-pulse' : 'text-gray-600'} style={{ color: sessionStartTime && !sessionEndTime ? protocol.accentColor : undefined }} /><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Elapsed</span></div>
          <p className="text-3xl font-black tracking-tighter text-white tabular-nums">{sessionStartTime ? formatDuration(sessionStats.elapsed) : '--:--'}</p>
        </div>
        <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2"><TimerReset size={14} className="text-blue-500" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Projected</span></div>
          <p className="text-3xl font-black tracking-tighter text-blue-500 tabular-nums">{formatDuration(sessionStats.projectedTotal)}</p>
        </div>
        <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 flex flex-col opacity-60">
          <div className="flex items-center gap-2 mb-2"><Focus size={14} className="text-gray-400" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target</span></div>
          <p className="text-3xl font-black tracking-tighter text-gray-300 tabular-nums">{currentProtocolDay?.targetDuration || 60}:00</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-8">
        <div><h2 className="text-5xl font-black tracking-tighter uppercase leading-none">LOG ENGINE</h2><p className="text-gray-600 font-mono text-[9px] uppercase tracking-widest mt-3">METHODOLOGY: {protocol.name}</p></div>
        <div className="bg-[#0e0e0e] border border-white/5 p-2 rounded-xl flex items-center gap-3"><span className="text-[9px] font-black text-gray-600 uppercase pl-2 tracking-widest">WEEK</span><input type="number" value={week} onChange={e => setWeek(parseInt(e.target.value))} className="w-10 bg-transparent text-center font-black outline-none" style={{ color: protocol.accentColor }} /></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">{protocol.days.map(t => (
        <button key={t.day} onClick={() => loadTemplate(t.day)} className={`py-4 px-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all relative overflow-hidden flex flex-col items-center justify-center gap-1 ${day === t.day ? 'text-white' : 'bg-[#0e0e0e] border-white/5 text-gray-500 hover:text-white'}`} style={{ backgroundColor: day === t.day ? protocol.accentColor : undefined, borderColor: day === t.day ? protocol.accentColor : undefined }}>
          {t.day === recommendedDay && <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-20" />}
          <span>{t.name}</span>
        </button>
      ))}</div>

      {/* WARMUP SECTION */}
      {currentProtocolDay && currentProtocolDay.warmup.length > 0 && (
        <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Zap size={14} className="text-yellow-500" /> WARMUP ROUTINE</h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">Est. 10 Mins</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentProtocolDay.warmup.map((item, idx) => (
              <button key={idx} onClick={() => toggleWarmup(idx)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${warmupStatus[idx] ? 'bg-zinc-900 border-green-500/20 text-green-500' : 'bg-black border-white/5 text-zinc-400 hover:border-white/10'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${warmupStatus[idx] ? 'bg-green-500 border-green-500 text-black' : 'border-white/10 text-transparent'}`}>
                  <Check size={14} strokeWidth={4} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Flame size={14} className="text-red-500" /> MAIN PROTOCOL</h3>
        {exercises.map((ex) => {
          const startTime = exerciseTimings[ex.id]?.start;
          const actualTime = startTime ? currentTime - startTime : 0;
          const plannedTime = sessionStats.perExPlanned[ex.id];
          const allCompleted = ex.sets.every(s => s.completed);
          
          return (
            <div key={ex.id} className={`bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 group relative overflow-hidden transition-all ${allCompleted ? 'border-green-500/10' : ''}`}>
               <div className="mb-6 flex justify-between items-start">
                  <div className={allCompleted ? 'opacity-40' : ''}>
                    <h3 className="text-4xl font-black tracking-tighter uppercase text-white leading-none mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedExerciseModal(ex.name)}>{ex.name}</h3>
                    <div className="flex items-center gap-4">
                        {ex.requiresStraps && (<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-white font-black text-[11px] uppercase tracking-tighter shadow-lg shadow-purple-900/10"><LinkIcon size={12} strokeWidth={3} className="text-yellow-500" /> STRAPS</div>)}
                        <span className="text-[14px] font-mono text-gray-500 uppercase tracking-widest font-bold">{ex.targetRepRange} REPS</span>
                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors" onClick={() => setSelectedExerciseModal(ex.name)}><Info size={12} className="text-zinc-700" /> Analysis</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col gap-0.5"><span className="text-[11px] font-mono text-gray-500 uppercase">Plan: {formatDuration(plannedTime)}</span><span className={`text-[11px] font-mono uppercase ${actualTime > plannedTime ? 'text-red-500' : 'text-green-500'}`}>Act: {actualTime > 0 ? formatDuration(actualTime) : '--:--'}</span></div>
                    <div className="flex items-center gap-2 mt-4 justify-end">
                      <button 
                        onClick={() => toggleExerciseComplete(ex.id)} 
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${allCompleted ? 'bg-green-500 border-green-500 text-black' : 'bg-black border-white/10 text-zinc-500 hover:text-white hover:border-white/30'}`}
                      >
                        {allCompleted ? 'COMPLETED' : 'COMPLETE'}
                      </button>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                 {ex.sets.map((set, sIdx) => {
                   const isLastSet = sIdx === ex.sets.length - 1;
                   return (
                     <div key={sIdx} className={`grid grid-cols-12 gap-3 items-center transition-all ${set.completed ? 'opacity-30' : 'opacity-100'}`}>
                        <div className="col-span-1 text-[14px] font-mono text-gray-700 font-black flex flex-col items-center">
                          {sIdx + 1}
                          {isLastSet && (
                            <button 
                              onClick={() => {
                                setExercises(prev => prev.map(e => e.id === ex.id ? { 
                                  ...e, 
                                  sets: [
                                    ...e.sets.slice(0, sIdx + 1),
                                    { ...e.sets[sIdx], completed: false },
                                    ...e.sets.slice(sIdx + 1)
                                  ]
                                } : e))
                              }}
                              className="text-[8px] text-green-500 hover:text-green-400 uppercase mt-1 px-1 rounded-md hover:bg-green-500/10 font-black"
                            >
                              ADD
                            </button>
                          )}
                          <button 
                            onClick={() => setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, sets: e.sets.filter((_, i) => i !== sIdx)} : e))} 
                            className="text-[8px] text-red-900 hover:text-red-500 uppercase mt-1 px-1 rounded-md hover:bg-red-950/20"
                          >
                            DEL
                          </button>
                        </div>
                        <div className="col-span-3"><input type="number" onFocus={e => e.currentTarget.select()} inputMode="decimal" placeholder="KG" value={set.weight || ''} onChange={e => updateSet(ex.id, sIdx, { weight: parseFloat(e.target.value) || 0 })} className="w-full bg-black border border-white/10 rounded-2xl px-2 py-5 font-mono text-center text-xl focus:border-red-600 outline-none text-white font-black" /></div>
                        <div className="col-span-3"><input type="number" onFocus={e => e.currentTarget.select()} inputMode="numeric" placeholder="REPS" value={set.reps || ''} onChange={e => updateSet(ex.id, sIdx, { reps: parseInt(e.target.value) || 0 })} className="w-full bg-black border border-white/10 rounded-2xl px-2 py-5 font-mono text-center text-xl focus:border-red-600 outline-none text-white font-black" /></div>
                        <div className="col-span-3 flex items-center gap-10 pl-2">
                          {isLastSet && (
                            <>
                              {ex.hasFinisherTarget && (
                                <div className="relative group/peak inline-block">
                                  <span className="text-2xl opacity-100 cursor-help transition-transform hover:scale-125 block select-none">✋</span>
                                  <div className="absolute bottom-full left-0 mb-3 px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover/peak:opacity-100 transition-opacity pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md min-w-max">
                                    ✋Hold Peak Contraction for 10 secs
                                  </div>
                                </div>
                              )}
                              {ex.hasAnchorTarget && (
                                <div className="relative group/anchor inline-block">
                                  <span className="text-2xl opacity-100 cursor-help transition-transform hover:scale-125 block select-none">⚓</span>
                                  <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover/anchor:opacity-100 transition-opacity pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md min-w-max">
                                    ⚓Hold Stretch for 30 secs
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-end"><button onClick={() => toggleComplete(ex.id, sIdx)} className={`w-12 h-12 rounded-xl transition-all shadow-2xl flex items-center justify-center border-2 ${set.completed ? 'text-white' : 'bg-black border-white/5'}`} style={{ backgroundColor: set.completed ? protocol.accentColor : undefined, borderColor: set.completed ? protocol.accentColor : undefined, color: set.completed ? '#fff' : protocol.accentColor }}><Check size={28} strokeWidth={5} /></button></div>
                     </div>
                   );
                 })}
               </div>
               <div className="mt-8 flex justify-between items-center text-[11px] font-black text-gray-700 uppercase tracking-widest border-t border-white/5 pt-6"><div className="flex items-center gap-2"><Clock size={12} /> REST: {ex.hasLongRest ? '3:00' : '1:30'}</div>{ex.requiresDropSet && <div className="text-red-500">🏳️ DROP SET</div>}</div>
            </div>
          );
        })}
        <button onClick={() => { const n = prompt("NAME:"); if(n) { const nameUpper = n.toUpperCase().trim(); const lastW = getLastWeight(nameUpper); setExercises(prev => [...prev, { id: crypto.randomUUID(), name: nameUpper, targetRepRange: '8-10', sets: [{weight:lastW,reps:8,completed:false}], hasFinisherTarget: true, hasAnchorTarget: true}]); } }} className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-3 text-gray-400 hover:text-white transition-all font-black uppercase text-xs tracking-widest"><Search size={18} /> SUBSTITUTE</button>
      </div>

      {/* STRETCHING SECTION */}
      {currentProtocolDay && currentProtocolDay.stretching.length > 0 && (
        <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Accessibility size={14} className="text-blue-500" /> POST-WORKOUT STRETCHING</h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">Est. 5 Mins</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {currentProtocolDay.stretching.map((item, idx) => (
              <button key={idx} onClick={() => toggleStretching(idx)} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${stretchingStatus[idx] ? 'bg-zinc-900 border-blue-500/20 text-blue-500' : 'bg-black border-white/5 text-zinc-400 hover:border-white/10'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${stretchingStatus[idx] ? 'bg-blue-500 border-blue-500 text-black' : 'border-white/10 text-transparent'}`}>
                  <Check size={14} strokeWidth={4} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CARDIO SECTION (MANDATORY) */}
      <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Footprints size={14} className="text-orange-500" /> CARDIO</h3>
          <span className="text-[10px] font-mono text-zinc-600 uppercase">{weeklyCardioCount}/5 Completed this week</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 uppercase mb-2">5 mins | 7.0 km/h | Incline 3</div>
        <button 
          onClick={() => setCardioCompleted(!cardioCompleted)} 
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left w-full ${cardioCompleted ? 'bg-zinc-900 border-green-500/20 text-green-500' : 'bg-black border-white/5 text-zinc-400 hover:border-white/10'}`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${cardioCompleted ? 'bg-green-500 border-green-500 text-black' : 'border-white/10 text-transparent'}`}>
            <Check size={14} strokeWidth={4} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-tight">{cardioCompleted ? 'CARDIO DONE' : 'MARK CARDIO AS COMPLETED'}</span>
        </button>
      </div>

      <button onClick={() => { if(exercises.length > 0) { setSessionEndTime(Date.now()); onSave({ id: crypto.randomUUID(), date: new Date().toISOString(), week, day, exercises, protocolId: protocol.id, warmupCompleted: warmupStatus, stretchingCompleted: stretchingStatus, cardioCompleted: cardioCompleted }); } }} className="w-full py-8 text-white rounded-[2.5rem] font-black text-2xl tracking-tighter uppercase shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-4" style={{ backgroundColor: protocol.accentColor }}>
        <Flame className="fill-white" /> COMMIT SESSION
      </button>

      {selectedExerciseModal && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setSelectedExerciseModal(null)}>
          <div className="bg-[#0e0e0e] border border-white/10 rounded-[48px] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12"><h3 className="text-4xl font-black uppercase tracking-tighter leading-none pr-4">{selectedExerciseModal}</h3><button onClick={() => setSelectedExerciseModal(null)} className="p-3 bg-white/5 rounded-2xl"><X size={28} /></button></div>
            <div className="flex justify-center gap-12 mb-12 py-10 bg-black/50 rounded-[40px] border border-white/5">
              <div className="flex flex-col items-center"><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Anterior</span><Model type="anterior" data={[getExerciseData(selectedExerciseModal)] as any} highlightedColors={[protocol.accentColor]} style={{ width: '150px' }} /></div>
              <div className="flex flex-col items-center"><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Posterior</span><Model type="posterior" data={[getExerciseData(selectedExerciseModal)] as any} highlightedColors={[protocol.accentColor]} style={{ width: '150px' }} /></div>
            </div>
            {(() => {
              const details = getDetailedMuscles(selectedExerciseModal);
              if (!details) return <p className="text-center text-zinc-800 font-mono text-[10px] uppercase tracking-widest py-4">Mapping offline</p>;
              return (
                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                  <div><h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-4">Primary</h4><p className="text-lg text-white font-black uppercase">{details.primary}</p></div>
                  <div><h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-4">Secondary</h4><div className="flex flex-wrap gap-2">{details.secondary.map(m => (<span key={m} className="text-[10px] font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg uppercase">{m}</span>))}</div></div>
                </div>
              );
            })()}
            <button onClick={() => setSelectedExerciseModal(null)} className="w-full mt-12 py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest">EXIT ANALYSIS</button>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryView: React.FC<{ sessions: WorkoutSession[]; onDelete: (id: string) => void; protocols: Protocol[] }> = ({ sessions, onDelete, protocols }) => {
  const handleExportCSV = () => {
    const headers = ['Date', 'Week', 'Day', 'Protocol', 'Tonnage (t)', 'Exercises', 'Cardio'];
    const rows = sessions.map(s => {
      const tonnage = s.exercises.reduce((totalEx, ex) => totalEx + ex.sets.reduce((totalSet, set) => totalSet + (set.completed ? (set.weight * set.reps) : 0), 0), 0) / 1000;
      const protocolName = protocols.find(p => p.id === s.protocolId)?.name || 'Unknown';
      return [
        new Date(s.date).toLocaleDateString(),
        s.week,
        s.day,
        protocolName,
        tonnage.toFixed(1),
        s.exercises.length,
        s.cardioCompleted ? 'Yes' : 'No'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `titan_archive_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div><h1 className="text-6xl font-black tracking-tighter uppercase text-white leading-none">ARCHIVE</h1><p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.4em] mt-3">Temporal Data</p></div>
        <button onClick={handleExportCSV} className="bg-[#0e0e0e] border border-white/10 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white flex items-center gap-2 hover:bg-white/5 transition-colors">
          <Download size={16} /> EXPORT CSV
        </button>
      </header>
      <div className="space-y-4">{sessions.map(s => {
          const tonnage = s.exercises.reduce((totalEx, ex) => totalEx + ex.sets.reduce((totalSet, set) => totalSet + (set.completed ? (set.weight * set.reps) : 0), 0), 0) / 1000;
          const prHit = s.hasPR || s.exercises.some(ex => ex.hasPRHit);
          
          return (
            <div key={s.id} className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-500 bg-white/5 px-3 py-1 rounded-lg">Week {s.week} Day {s.day}</span>
                    <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg font-mono">{protocols.find(p => p.id === s.protocolId)?.name || 'Protocol'}</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-white">{new Date(s.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                </div>
                <button onClick={() => onDelete(s.id)} className="p-3 text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-8">
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">TONNAGE</p>
                  <p className="text-xl font-black text-white">{tonnage.toFixed(1)}t</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">EXERCISES</p>
                  <p className="text-xl font-black text-white">{s.exercises.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">PR STATUS</p>
                  <p className={`text-xl font-black ${prHit ? 'text-yellow-500' : 'text-gray-700'}`}>{prHit ? 'ACHIEVED' : 'STABLE'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">CARDIO</p>
                  <p className={`text-xl font-black ${s.cardioCompleted ? 'text-green-500' : 'text-red-500/30'}`}>
                    🏃 {s.cardioCompleted ? '✓' : '✗'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}</div>
    </div>
  );
};

const exerciseTargetsMuscle = (exerciseName: string, filterId: string): boolean => {
  if (filterId === 'all') return true;
  const details = getDetailedMuscles(exerciseName);
  if (!details) return false;
  
  const allMuscles = [details.primary, ...(details.secondary || [])];
  
  const categoryMap: Record<string, string[]> = {
    chest: ["Upper Chest", "Mid Chest", "Lower Chest"],
    back: ["Lats", "Upper Traps", "Mid Traps", "Erectors"],
    shoulders: ["Front Deltoid", "Side Deltoid", "Rear Deltoid", "Rotator Cuff"],
    arms: ["Biceps Long Head", "Biceps Short Head", "Brachialis", "Triceps Long Head", "Triceps Lateral Head", "Triceps Medial Head", "Forearms"],
    legs: ["Quads", "Hamstrings", "Glutes", "Glute Medius", "Adductors", "Gastrocnemius", "Soleus"],
    core: ["Abs", "Obliques"],
  };

  const targets = categoryMap[filterId];
  if (!targets) return false;
  return allMuscles.some(m => targets.includes(m));
};

const MUSCLE_GROUP_FILTERS = [
  { id: 'all', label: 'ALL MUSCLES' },
  { id: 'chest', label: 'CHEST' },
  { id: 'back', label: 'BACK' },
  { id: 'shoulders', label: 'SHOULDERS' },
  { id: 'arms', label: 'ARMS' },
  { id: 'legs', label: 'LEGS' },
  { id: 'core', label: 'CORE' },
];

const ReportsView: React.FC<{ sessions: WorkoutSession[]; prs: Record<string, ExercisePR[]>; protocol: Protocol }> = ({ sessions, prs, protocol }) => {
  const [activeTab, setActiveTab] = useState<'VECTORS' | 'HALL OF FAME' | 'CONSISTENCY'>('VECTORS');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(s => {
      const sDate = new Date(s.date);
      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return sDate >= weekAgo;
      }
      if (timeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return sDate >= monthAgo;
      }
      return true;
    });
  }, [sessions, timeframe]);

  const consistencyStats = useMemo(() => {
    const weekMap = new Map<string, WorkoutSession[]>();
    
    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff)).toISOString().split('T')[0];
    };

    sessions.forEach(s => {
      const monday = getMonday(new Date(s.date));
      if (!weekMap.has(monday)) weekMap.set(monday, []);
      weekMap.get(monday)!.push(s);
    });

    const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => b.localeCompare(a));
    const chronWeeks = [...sortedWeeks].reverse();

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    chronWeeks.forEach(w => {
      if (weekMap.get(w)!.length >= 4) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    const latestMonday = getMonday(new Date());
    for (let i = 0; i < sortedWeeks.length; i++) {
      const w = sortedWeeks[i];
      if (weekMap.get(w)!.length >= 4) {
        currentStreak++;
      } else {
        if (w !== latestMonday) break;
      }
    }

    const totalWeeksTrained = weekMap.size;
    const weeksWithTarget = Array.from(weekMap.values()).filter(sArr => sArr.length >= 4).length;
    const attendanceRate = totalWeeksTrained > 0 ? (weeksWithTarget / totalWeeksTrained) * 100 : 0;
    
    const sessionsThisWeek = weekMap.get(latestMonday)?.length || 0;

    const last12WeeksData = sortedWeeks.slice(0, 12).reverse().map((w, idx) => {
      const sArr = weekMap.get(w)!;
      const tonnage = sArr.reduce((acc, s) => acc + s.exercises.reduce((exAcc, ex) => exAcc + ex.sets.reduce((setAcc, set) => setAcc + (set.completed ? (set.weight * set.reps) : 0), 0), 0), 0) / 1000;
      return {
        label: `W${idx + 1}`,
        fullLabel: `Week of ${new Date(w).toLocaleDateString()}`,
        count: sArr.length,
        tonnage: parseFloat(tonnage.toFixed(1))
      };
    });

    const heatmapRows = [];
    for (let i = 0; i < 12; i++) {
      const rowDate = new Date();
      rowDate.setDate(rowDate.getDate() - (rowDate.getDay() || 7) + 1 - (i * 7));
      const mon = getMonday(rowDate);
      const weekSessions = weekMap.get(mon) || [];
      const row = Array(7).fill(null).map((_, dIdx) => {
        const d = new Date(mon);
        d.setDate(d.getDate() + dIdx);
        const dayStr = d.toISOString().split('T')[0];
        const s = weekSessions.find(sess => sess.date.startsWith(dayStr));
        if (!s) return { date: dayStr, tonnage: 0 };
        const ton = s.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, set) => sAcc + (set.completed ? (set.weight * set.reps) : 0), 0), 0);
        return { date: dayStr, tonnage: ton, session: s };
      });
      heatmapRows.push({ monday: mon, days: row });
    }

    const allSessionDays = sessions.map(s => new Date(s.date).getDay());
    const dayCounts = [0,0,0,0,0,0,0];
    allSessionDays.forEach(d => dayCounts[d]++);
    const favoriteDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    let totalRestDays = 0;
    const sortedAllSessions = [...sessions].sort((a,b) => a.date.localeCompare(b.date));
    for(let i=1; i<sortedAllSessions.length; i++) {
      const diff = (new Date(sortedAllSessions[i].date).getTime() - new Date(sortedAllSessions[i-1].date).getTime()) / (1000*3600*24);
      totalRestDays += Math.max(0, diff - 1);
    }

    return {
      currentStreak,
      bestStreak,
      sessionsThisWeek,
      attendanceRate,
      last12WeeksData,
      heatmapRows,
      avgSessions: (sessions.length / totalWeeksTrained || 0).toFixed(1),
      favoriteDay: dayNames[favoriteDayIdx],
      avgRest: (totalRestDays / (sortedAllSessions.length - 1) || 0).toFixed(1),
      totalWeeks: totalWeeksTrained,
      perfectWeeks: Array.from(weekMap.values()).filter(sArr => sArr.length >= 5).length
    };
  }, [sessions]);

  const muscleRadarData = useMemo(() => {
    const counts: Record<string, number> = {
      chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0
    };
    const targets: Record<string, number> = {
      chest: 14, back: 20, shoulders: 12, biceps: 12, triceps: 10, quads: 14, hamstrings: 10, glutes: 10, calves: 8, core: 10
    };

    filteredSessions.forEach(s => {
      s.exercises.forEach(ex => {
        const muscles = getBodyHighlighterMuscles(ex.name);
        const setWeight = ex.sets.length;
        muscles.forEach(m => {
          if (['chest'].includes(m)) counts.chest += setWeight;
          else if (['upper-back', 'trapezius', 'lower-back'].includes(m)) counts.back += setWeight;
          else if (['front-deltoids', 'back-deltoids'].includes(m)) counts.shoulders += setWeight;
          else if (['biceps'].includes(m)) counts.biceps += setWeight;
          else if (['triceps'].includes(m)) counts.triceps += setWeight;
          else if (['quadriceps'].includes(m)) counts.quads += setWeight;
          else if (['hamstring'].includes(m)) counts.hamstrings += setWeight;
          else if (['gluteal', 'abductors', 'adductor'].includes(m)) counts.glutes += setWeight;
          else if (['calves'].includes(m)) counts.calves += setWeight;
          else if (['abs', 'obliques'].includes(m)) counts.core += setWeight;
        });
      });
    });

    return Object.keys(counts).map(key => ({
      muscle: key.toUpperCase(),
      sets: counts[key],
      target: targets[key]
    }));
  }, [filteredSessions]);

  const volumeByDayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const tonnageSum: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const sessionCount: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    filteredSessions.forEach(s => {
      const day = days[new Date(s.date).getDay()];
      const tonnage = s.exercises.reduce((totalEx, ex) => totalEx + ex.sets.reduce((totalSet, set) => totalSet + (set.completed ? (set.weight * set.reps) : 0), 0), 0) / 1000;
      tonnageSum[day] += tonnage;
      sessionCount[day] += 1;
    });

    return days.map(day => ({
      day,
      avgTonnage: sessionCount[day] > 0 ? parseFloat((tonnageSum[day] / sessionCount[day]).toFixed(2)) : 0
    }));
  }, [filteredSessions]);

  const exerciseOptions = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => s.exercises.forEach(ex => names.add(ex.name)));
    return Array.from(names).sort();
  }, [sessions]);

  useEffect(() => {
    if (!selectedExercise && exerciseOptions.length > 0) {
      setSelectedExercise(exerciseOptions[0]);
    }
  }, [exerciseOptions]);

  const progressionData = useMemo(() => {
    if (!selectedExercise) return [];
    return sessions
      .filter(s => s.exercises.some(ex => ex.name === selectedExercise))
      .map(s => {
        const ex = s.exercises.find(e => e.name === selectedExercise);
        const maxWeight = Math.max(...(ex?.sets.map(set => set.weight) || [0]));
        const maxReps = ex?.sets.find(set => set.weight === maxWeight)?.reps || 0;
        return {
          date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: maxWeight,
          estimated1RM: calculate1RM(maxWeight, maxReps)
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions, selectedExercise]);

  const recordEntries = useMemo(() => {
    return (Object.entries(prs) as [string, ExercisePR[]][])
      .filter(([name]) => 
        (muscleFilter === 'all' || exerciseTargetsMuscle(name, muscleFilter)) &&
        (searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .map(([name, history]) => {
        const sortedHistory = [...history].sort((a, b) => b.estimated1RM - a.estimated1RM);
        const best1RM = sortedHistory[0];
        const maxWeight = Math.max(...history.map(h => h.weight));
        const prCount = history.length;
        const tier = Math.min(10, Math.ceil(prCount / 2));
        
        return {
          name, 
          best1RM,
          maxWeight,
          prCount,
          tier,
          lastPR: history[history.length - 1]
        };
      }).sort((a, b) => (b.lastPR?.date || '').localeCompare(a.lastPR?.date || ''));
  }, [prs, muscleFilter, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">REPORTS</h1>
          <p className="font-mono mt-2 tracking-[0.3em] text-xs font-bold uppercase" style={{ color: protocol.accentColor }}>Performance Intelligence</p>
        </div>
        <div className="flex bg-[#0e0e0e] border border-white/5 p-1 rounded-2xl overflow-x-auto w-full md:w-auto">
          <button onClick={() => setActiveTab('VECTORS')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'VECTORS' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>VECTORS</button>
          <button onClick={() => setActiveTab('HALL OF FAME')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HALL OF FAME' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>HALL OF FAME</button>
          <button onClick={() => setActiveTab('CONSISTENCY')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CONSISTENCY' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>CONSISTENCY</button>
        </div>
      </header>

      {activeTab === 'VECTORS' && (
        <div className="animate-in slide-in-from-left-4 duration-500 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0e0e0e] p-2 rounded-3xl border border-white/5">
            <div className="flex p-1 gap-1">
              {(['week', 'month', 'all'] as const).map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === tf ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>{tf}</button>
              ))}
            </div>
            <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="bg-transparent border-none font-black uppercase text-[10px] tracking-widest px-4 outline-none text-zinc-400">
              {MUSCLE_GROUP_FILTERS.map(f => <option key={f.id} value={f.id} className="bg-black">{f.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 h-[400px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Muscle Load Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={muscleRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="muscle" stroke="#666" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} hide />
                  <Radar name="Sets" dataKey="sets" stroke={protocol.accentColor} fill={protocol.accentColor} fillOpacity={0.6} />
                  <Radar name="Target" dataKey="target" stroke="#333" fill="transparent" strokeDasharray="5 5" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 h-[400px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Average Volume by Weekday</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} unit="t" />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px' }} />
                  <Bar dataKey="avgTonnage" fill={protocol.accentColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Strength Progression Vector</h3>
              <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase text-white outline-none focus:border-white/30">
                <option value="">Select Exercise...</option>
                {exerciseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="h-[300px]">
              {selectedExercise ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} unit="kg" />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#666" strokeWidth={2} dot={{ r: 4, fill: '#666' }} name="Max Weight" />
                    <Line type="monotone" dataKey="estimated1RM" stroke={protocol.accentColor} strokeWidth={3} dot={{ r: 6, fill: protocol.accentColor }} name="Est. 1RM" />
                    <Legend verticalAlign="top" align="right" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-20"><p className="text-xs font-black uppercase tracking-widest">Select an exercise to compute vector</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'HALL OF FAME' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input type="text" placeholder="Search Performance History..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0e0e0e] border border-white/5 rounded-2xl p-4 pl-12 font-black uppercase text-xs text-white outline-none focus:border-white/10" />
            </div>
            <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="w-full bg-[#0e0e0e] border border-white/5 rounded-2xl p-4 font-black uppercase text-xs text-zinc-400 outline-none">
              {MUSCLE_GROUP_FILTERS.map(f => <option key={f.id} value={f.id} className="bg-black">{f.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordEntries.map(entry => (
              <div key={entry.name} className="bg-[#0e0e0e] border border-white/5 p-8 rounded-[2rem] space-y-6 group hover:border-yellow-500/20 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1"><h3 className="font-black text-xl uppercase tracking-tighter leading-tight mb-1 truncate pr-4">{entry.name}</h3><div className="flex items-center gap-2"><div className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20 flex items-center gap-1"><Star size={8} className="fill-yellow-500" /> TIER {entry.tier}</div><span className="text-[9px] font-mono text-zinc-600 uppercase">{entry.prCount} RECORD STREAKS</span></div></div>
                  <div className="text-right"><Trophy className="text-yellow-500 opacity-20 group-hover:opacity-100 transition-opacity" size={24} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[9px] font-black text-gray-600 uppercase mb-1">Max Weight</p><p className="text-2xl font-black text-white tracking-tighter">{entry.maxWeight}kg</p></div>
                  <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[9px] font-black text-gray-600 uppercase mb-1">Best 1RM</p><p className="text-2xl font-black text-yellow-500 tracking-tighter">{entry.best1RM?.estimated1RM || 0}kg</p></div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center"><div className="flex flex-col"><span className="text-[8px] font-black text-zinc-600 uppercase">Last Peak</span><span className="text-[10px] font-bold text-zinc-400 font-mono">{new Date(entry.lastPR?.date || '').toLocaleDateString()}</span></div><ChevronRight size={16} className="text-zinc-800" /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'CONSISTENCY' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="CURRENT STREAK" value={consistencyStats.currentStreak > 0 ? `${consistencyStats.currentStreak} weeks` : '—'} accent={protocol.accentColor} />
            <StatCard label="BEST STREAK" value={`${consistencyStats.bestStreak} weeks`} accent={protocol.accentColor} />
            <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">THIS WEEK</p>
              <p className="text-3xl font-black tracking-tighter text-white">{consistencyStats.sessionsThisWeek} / 5</p>
              <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div className="h-full transition-all duration-1000" style={{ width: `${(consistencyStats.sessionsThisWeek / 5) * 100}%`, backgroundColor: protocol.accentColor }} />
              </div>
            </div>
            <StatCard label="ATTENDANCE RATE" value={`${consistencyStats.attendanceRate.toFixed(0)}%`} accent={protocol.accentColor} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 h-[400px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Frequency Distribution (12W)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consistencyStats.last12WeeksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis domain={[0, 7]} axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px' }} />
                  <ReferenceLine y={5} stroke="#666" strokeDasharray="5 5" label={{ position: 'right', value: 'TARGET', fill: '#666', fontSize: 8, fontWeight: 'black' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {consistencyStats.last12WeeksData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count >= 4 ? '#10b981' : entry.count >= 2 ? '#eab308' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 h-[400px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Weekly Tonnage Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={consistencyStats.last12WeeksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} unit="t" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px' }} />
                  <ReferenceLine y={consistencyStats.last12WeeksData.reduce((acc, v) => acc + v.tonnage, 0) / 12} stroke="#333" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="tonnage" stroke={protocol.accentColor} strokeWidth={3} dot={{ r: 4, fill: protocol.accentColor }} animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 overflow-x-auto">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Training Heatmap</h3>
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-4">
                <div />
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
                  <div key={d} className="text-[10px] font-black text-center text-zinc-700">{d}</div>
                ))}
              </div>
              <div className="space-y-2">
                {consistencyStats.heatmapRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 items-center">
                    <div className="text-[9px] font-mono text-zinc-600 text-right pr-4">W-{rIdx + 1}</div>
                    {row.days.map((day, dIdx) => (
                      <div 
                        key={dIdx} 
                        title={`${day.date}: ${day.tonnage > 0 ? (day.tonnage/1000).toFixed(1) + 't' : 'No Data'}`}
                        className="h-10 rounded-lg transition-all border border-white/5"
                        style={{ 
                          backgroundColor: day.tonnage > 0 ? protocol.accentColor : 'rgba(255,255,255,0.05)',
                          opacity: day.tonnage > 0 ? Math.max(0.3, Math.min(1, day.tonnage / 15000)) : 1
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[
              { label: "AVG SESSIONS/WK", value: consistencyStats.avgSessions },
              { label: "FAVORITE DAY", value: consistencyStats.favoriteDay },
              { label: "AVG REST GAP", value: `${consistencyStats.avgRest}d` },
              { label: "TOTAL WEEKS", value: consistencyStats.totalWeeks },
              { label: "PERFECT WEEKS", value: consistencyStats.perfectWeeks }
            ].map(ins => (
              <div key={ins.label} className="bg-[#0e0e0e] border border-white/5 p-6 rounded-3xl min-w-[180px] flex-shrink-0">
                <p className="text-[9px] font-black text-gray-600 uppercase mb-1">{ins.label}</p>
                <p className="text-xl font-black text-white uppercase tracking-tighter">{ins.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BodyStatsView: React.FC<{ 
  bodyWeights: BodyWeight[]; 
  bodyMeasurements: BodyMeasurement[]; 
  onAddWeight: (weight: BodyWeight) => void; 
  onAddMeasurement: (measurement: BodyMeasurement) => void; 
  onDeleteWeight: (id: string) => void; 
  onDeleteMeasurement: (id: string) => void; 
  accentColor: string; 
}> = ({ bodyWeights, bodyMeasurements, onAddWeight, onAddMeasurement, onDeleteWeight, onDeleteMeasurement, accentColor }) => {
  const [activeSubTab, setActiveSubTab] = useState<'weight' | 'measurements'>('weight');
  const [weightInput, setWeightInput] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const [mForm, setMForm] = useState({
    armLeft: '', armRight: '', chest: '', waist: '', quadLeft: '', quadRight: ''
  });

  const sortedWeights = useMemo(() => 
    [...bodyWeights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [bodyWeights]);

  const sortedMeasurements = useMemo(() => 
    [...bodyMeasurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [bodyMeasurements]);

  const latestM = sortedMeasurements[0] || null;
  const previousM = sortedMeasurements[1] || null;

  const getMDelta = (key: keyof BodyMeasurement) => {
    if (!latestM?.[key] || !previousM?.[key]) return { val: null, color: '#666' };
    const diff = (latestM[key] as number) - (previousM[key] as number);
    const formatted = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}cm`;
    
    let isGood = diff > 0;
    if (key === 'waist') isGood = diff < 0;

    return { val: formatted, color: isGood ? '#10b981' : '#666' };
  };

  const chartData = useMemo(() => 
    [...bodyWeights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
      .map(w => ({
        date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: w.weight
      })),
  [bodyWeights]);

  const rollingAvg = getRollingAverageBody(bodyWeights);
  const monthChange = getWeightChangeBody(bodyWeights);
  const latestWeight = sortedWeights.length > 0 ? sortedWeights[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div><h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">BODY</h1><p className="font-mono mt-2 tracking-[0.3em] text-xs font-bold uppercase text-zinc-500">Morphology</p></div>
        <div className="flex bg-[#0e0e0e] border border-white/5 p-1 rounded-2xl">
          <button onClick={() => setActiveSubTab('weight')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'weight' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>Weight</button>
          <button onClick={() => setActiveSubTab('measurements')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'measurements' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>Measurements</button>
        </div>
      </header>
      
      {activeSubTab === 'weight' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard mini label="CURRENT" value={latestWeight ? `${latestWeight.weight}kg` : '—'} accent={accentColor} />
            <StatCard mini label="7-DAY AVG" value={rollingAvg ? `${rollingAvg}kg` : '—'} accent={accentColor} />
            <StatCard mini label="30-DAY" value={monthChange !== null ? `${parseFloat(monthChange) > 0 ? '+' : ''}${monthChange}kg` : '—'} accent={monthChange && parseFloat(monthChange) < 0 ? '#10b981' : accentColor} />
          </div>

          <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 h-64">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={14} className="text-zinc-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weight Trend (Last 30)</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'black', color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                  itemStyle={{ fontWeight: 'black', color: accentColor, fontSize: '14px' }}
                />
                <Line type="monotone" dataKey="weight" stroke={accentColor} strokeWidth={3} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">Record Weight</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 font-black text-lg text-white appearance-none outline-none focus:border-white/30" />
                </div>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input type="number" onFocus={e => e.currentTarget.select()} step="0.1" placeholder="KG" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 font-black text-xl text-white outline-none focus:border-white/30" />
                </div>
                <button onClick={() => { if (weightInput) { onAddWeight({ id: Date.now().toString(), date: new Date(logDate).toISOString(), weight: parseFloat(weightInput) }); setWeightInput(''); } }} className="w-full py-5 text-white font-black text-sm uppercase rounded-2xl shadow-lg transition-transform active:scale-95" style={{ backgroundColor: accentColor }}>LOG ENTRY</button>
              </div>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-8 pb-4 border-b border-white/5"><h3 className="text-xl font-black uppercase tracking-tighter">Weight Archive</h3></div>
              <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
                {sortedWeights.length === 0 ? <p className="text-center py-12 font-mono text-[10px] text-zinc-700 uppercase">No data.</p> : sortedWeights.map(entry => (
                  <div key={entry.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="flex flex-col"><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</span><span className="text-xl font-black text-white">{entry.weight}<span className="text-xs ml-1 text-zinc-600">KG</span></span></div>
                    <button onClick={() => onDeleteWeight(entry.id)} className="p-3 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard mini label="ARM (L)" value={latestM?.armLeft ? `${latestM.armLeft}cm` : '—'} accent={accentColor} subValue={getMDelta('armLeft').val || ''} subColor={getMDelta('armLeft').color} />
            <StatCard mini label="ARM (R)" value={latestM?.armRight ? `${latestM.armRight}cm` : '—'} accent={accentColor} subValue={getMDelta('armRight').val || ''} subColor={getMDelta('armRight').color} />
            <StatCard mini label="CHEST" value={latestM?.chest ? `${latestM.chest}cm` : '—'} accent={accentColor} subValue={getMDelta('chest').val || ''} subColor={getMDelta('chest').color} />
            <StatCard mini label="WAIST" value={latestM?.waist ? `${latestM.waist}cm` : '—'} accent={accentColor} subValue={getMDelta('waist').val || ''} subColor={getMDelta('waist').color} />
            <StatCard mini label="QUAD (L)" value={latestM?.quadLeft ? `${latestM.quadLeft}cm` : '—'} accent={accentColor} subValue={getMDelta('quadLeft').val || ''} subColor={getMDelta('quadLeft').color} />
            <StatCard mini label="QUAD (R)" value={latestM?.quadRight ? `${latestM.quadRight}cm` : '—'} accent={accentColor} subValue={getMDelta('quadRight').val || ''} subColor={getMDelta('quadRight').color} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">Log Measurements</h3>
              <div className="space-y-4">
                <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 font-black text-white" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="ARM L" value={mForm.armLeft} onChange={e => setMForm({...mForm, armLeft: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-center font-mono font-black" />
                  <input type="number" placeholder="ARM R" value={mForm.armRight} onChange={e => setMForm({...mForm, armRight: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-center font-mono font-black" />
                  <input type="number" placeholder="CHEST" value={mForm.chest} onChange={e => setMForm({...mForm, chest: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-center font-mono font-black" />
                  <input type="number" placeholder="WAIST" value={mForm.waist} onChange={e => setMForm({...mForm, waist: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-center font-mono font-black" />
                  <input type="number" placeholder="QUAD L" value={mForm.quadLeft} onChange={e => setMForm({...mForm, quadLeft: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-center font-mono font-black" />
                  <input type="number" placeholder="QUAD R" value={mForm.quadRight} onChange={e => setMForm({...mForm, quadRight: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-center font-mono font-black" />
                </div>
                <button onClick={() => { onAddMeasurement({ id: Date.now().toString(), date: new Date(logDate).toISOString(), armLeft: parseFloat(mForm.armLeft), armRight: parseFloat(mForm.armRight), chest: parseFloat(mForm.chest), waist: parseFloat(mForm.waist), quadLeft: parseFloat(mForm.quadLeft), quadRight: parseFloat(mForm.quadRight) }); setMForm({ armLeft: '', armRight: '', chest: '', waist: '', quadLeft: '', quadRight: '' }); }} className="w-full py-5 text-white font-black uppercase rounded-2xl" style={{ backgroundColor: accentColor }}>COMMIT MEASUREMENTS</button>
              </div>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
              <div className="p-8 pb-4 border-b border-white/5"><h3 className="text-xl font-black uppercase tracking-tighter">Morphology History</h3></div>
              <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-4 custom-scrollbar">
                {sortedMeasurements.map(m => (
                  <div key={m.id} className="group relative bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{new Date(m.date).toLocaleDateString()}</span>
                      <button onClick={() => onDeleteMeasurement(m.id)} className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/5 p-2 rounded-lg"><p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Arms</p><p className="text-xs font-mono font-black">{m.armLeft} / {m.armRight}</p></div>
                      <div className="bg-white/5 p-2 rounded-lg"><p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Chest</p><p className="text-xs font-mono font-black">{m.chest}</p></div>
                      <div className="bg-white/5 p-2 rounded-lg"><p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Waist</p><p className="text-xs font-mono font-black">{m.waist}</p></div>
                      <div className="bg-white/5 p-2 rounded-lg col-span-3"><p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Quads</p><p className="text-xs font-mono font-black">{m.quadLeft}L / {m.quadRight}R</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SettingsView: React.FC<{ settings: UserSettings; onUpdate: (s: UserSettings) => void }> = ({ settings, onUpdate }) => {
  const exportAllData = () => {
    const keys = [
      'titan_sessions', 'titan_maxes', 'titan_prs_v1', 'titan_protocols_v4',
      'titan_settings_v1', 'titan_bodyweights', 'titan_measurements', 'titan_dismissed_alerts'
    ];
    const backup: { exportDate: string; data: Record<string, any> } = {
      exportDate: new Date().toISOString(),
      data: {}
    };
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          backup.data[key] = JSON.parse(val);
        } catch (e) {
          console.error(`Failed to parse ${key}`);
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (backup && backup.data) {
          Object.entries(backup.data).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
          });
          window.location.reload();
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24 max-w-2xl">
      <header><h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">SYSTEM</h1><p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest mt-3">Kernel Config</p></header>
      
      <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-8">
        <label className="block"><span className="text-[10px] font-black uppercase text-gray-600 block mb-2">Email</span><input type="email" value={settings.email} onChange={e => onUpdate({...settings, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-black" /></label>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div><h4 className="font-black uppercase text-xs">Auto-Remind Export</h4></div>
            <button onClick={() => onUpdate({...settings, autoRemindExport: !settings.autoRemindExport})} className={`w-12 h-6 rounded-full relative transition-all ${settings.autoRemindExport ? 'bg-green-600' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.autoRemindExport ? 'left-7' : 'left-1'}`} /></button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Save size={16} className="text-zinc-500" />
              <h4 className="font-black uppercase text-xs">Auto-Backup After Session</h4>
            </div>
            <button onClick={() => onUpdate({...settings, autoBackupAfterSession: !settings.autoBackupAfterSession})} className={`w-12 h-6 rounded-full relative transition-all ${settings.autoBackupAfterSession ? 'bg-green-600' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.autoBackupAfterSession ? 'left-7' : 'left-1'}`} /></button>
          </div>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Database className="text-zinc-600" size={20} />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">DATA VAULT</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={exportAllData}
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all group"
          >
            <Download size={18} className="text-zinc-400 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">EXPORT BACKUP</span>
          </button>
          
          <label className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all group cursor-pointer">
            <FileUp size={18} className="text-zinc-400 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">IMPORT BACKUP</span>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={importData}
            />
          </label>
        </div>
        
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest text-center mt-4">BACKUP WEEKLY. TRUST NO BROWSER.</p>
      </div>
    </div>
  );
};

export default App;
