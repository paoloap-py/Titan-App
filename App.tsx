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
  User,
  Settings2,
  Flame,
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
  BodyWeight
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
      if (justCompleted) onStartRest(ex.hasLongRest ? 180 : 90);
      return { ...ex, sets: newSets };
    }));
  };

  const addSet = (exId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { ...lastSet, completed: false }] };
    }));
  };

  const currentTemplate = protocol.days.find(d => d.day === day);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-32">
      <header className="flex justify-between items-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter">LOG SESSION</h2>
        <div className="flex gap-2">
          <div className="bg-[#0e0e0e] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="block text-[8px] font-black text-zinc-500 uppercase mb-1">WEEK</span>
            <input type="number" value={week} onChange={e => setWeek(parseInt(e.target.value) || 1)} className="bg-transparent text-white font-black text-lg w-8 text-center" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {protocol.days.map(t => (
          <button 
            key={t.day} 
            onClick={() => loadTemplate(t.day)} 
            className={`py-4 px-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${day === t.day ? 'text-white' : 'bg-[#0e0e0e] border-white/5 text-gray-500 hover:text-white'}`}
            style={{ backgroundColor: day === t.day ? protocol.accentColor : undefined }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {currentTemplate && (
        <div className="space-y-4">
          <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2"><Flame size={14} /> Warmup Protocol</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTemplate.warmup.map((w, idx) => (
                <button key={idx} onClick={() => setWarmupStatus(prev => prev.map((v, i) => i === idx ? !v : v))} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${warmupStatus[idx] ? 'bg-white/5 border-white/10 text-white' : 'border-white/5 text-zinc-500'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${warmupStatus[idx] ? 'bg-green-500 border-green-500 text-black' : 'border-white/10'}`}>
                    {warmupStatus[idx] && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] font-bold uppercase">{w}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {exercises.map(ex => (
          <div key={ex.id} className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">{ex.name}</h3>
              <div className="flex gap-2">
                 <span className="text-[9px] font-black text-white/40 bg-white/5 px-2 py-1 rounded uppercase">{ex.hasLongRest ? '⏱️ 3m rest' : '90s rest'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {ex.sets.map((set, sIdx) => (
                <div key={sIdx} className="flex items-center gap-4 animate-in slide-in-from-left duration-300">
                  <div className="w-6 text-[10px] font-black text-zinc-600">#{sIdx + 1}</div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input type="number" placeholder="KG" className="bg-black border border-white/10 rounded-xl px-4 py-3 w-full text-center font-mono text-lg font-bold" value={set.weight || ''} onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, i) => i === sIdx ? { ...s, weight: val } : s) } : e));
                      }} />
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-zinc-600 uppercase tracking-widest">WEIGHT</span>
                    </div>
                    <div className="relative">
                      <input type="number" placeholder="REPS" className="bg-black border border-white/10 rounded-xl px-4 py-3 w-full text-center font-mono text-lg font-bold" value={set.reps || ''} onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, sets: e.sets.map((s, i) => i === sIdx ? { ...s, reps: val } : s) } : e));
                      }} />
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-zinc-600 uppercase tracking-widest">REPS</span>
                    </div>
                  </div>
                  <button onClick={() => toggleComplete(ex.id, sIdx)} className={`p-4 rounded-xl border-2 transition-all ${set.completed ? 'bg-green-500 border-green-500 text-black' : 'border-white/10 text-transparent'}`}>
                    <Check size={20} strokeWidth={4} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addSet(ex.id)} className="w-full py-3 border border-dashed border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all">+ Add Set</button>
          </div>
        ))}
      </div>

      {currentTemplate && (
        <div className="space-y-4">
          <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2"><Accessibility size={14} /> Stretching Protocol</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTemplate.stretching.map((s, idx) => (
                <button key={idx} onClick={() => setStretchingStatus(prev => prev.map((v, i) => i === idx ? !v : v))} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${stretchingStatus[idx] ? 'bg-white/5 border-white/10 text-white' : 'border-white/5 text-zinc-500'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${stretchingStatus[idx] ? 'bg-green-500 border-green-500 text-black' : 'border-white/10'}`}>
                    {stretchingStatus[idx] && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] font-bold uppercase">{s}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setCardioCompleted(!cardioCompleted)} className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all ${cardioCompleted ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#0e0e0e] border-white/5 text-zinc-500'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${cardioCompleted ? 'bg-orange-500 border-orange-500 text-black' : 'border-white/10'}`}>
                <Zap size={20} strokeWidth={3} />
              </div>
              <div>
                <span className="block font-black uppercase tracking-tighter text-lg">Post-Workout Cardio</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">15-20m Incline Walk / Bike</span>
              </div>
            </div>
            {cardioCompleted && <Check size={24} strokeWidth={4} />}
          </button>
        </div>
      )}

      <button 
        onClick={() => onSave({ 
          id: crypto.randomUUID(), 
          date: new Date().toISOString(), 
          week, 
          day, 
          exercises, 
          protocolId: protocol.id, 
          stretchingCompleted: stretchingStatus, 
          cardioCompleted, 
          warmupCompleted: warmupStatus 
        })} 
        className="w-full py-6 text-white rounded-3xl font-black text-xl tracking-tighter uppercase shadow-2xl transition-transform active:scale-95"
        style={{ backgroundColor: protocol.accentColor }}
      >
        COMMIT SESSION
      </button>
    </div>
  );
};

const HistoryView: React.FC<{ sessions: WorkoutSession[]; onDelete: (id: string) => void; protocols: Protocol[] }> = ({ sessions, onDelete, protocols }) => (
  <div className="space-y-6">
    <h2 className="text-4xl font-black uppercase">ARCHIVE</h2>
    {sessions.length === 0 ? (
      <div className="p-12 text-center text-zinc-600 font-black uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">No operational data recorded.</div>
    ) : (
      sessions.map(s => (
        <div key={s.id} className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-6 flex justify-between items-center group transition-all hover:border-white/10">
          <div>
            <p className="text-xs font-mono text-zinc-500">{new Date(s.date).toLocaleDateString()} @ {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <h3 className="text-xl font-black uppercase tracking-tighter">Week {s.week} Day {s.day}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">{protocols.find(p => p.id === s.protocolId)?.name || 'Protocol'}</p>
          </div>
          <button onClick={() => onDelete(s.id)} className="p-4 text-zinc-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={24} /></button>
        </div>
      ))
    )}
  </div>
);

const ReportsView: React.FC<{ sessions: WorkoutSession[]; protocol: Protocol }> = ({ sessions, protocol }) => {
  const weeklyData = useMemo(() => {
    const weeks: Record<number, number> = {};
    sessions.forEach(s => {
      const ton = s.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sa, set) => sa + (set.completed ? set.weight * set.reps : 0), 0), 0) / 1000;
      weeks[s.week] = (weeks[s.week] || 0) + ton;
    });
    return Object.entries(weeks).map(([w, t]) => ({ week: `W${w}`, tonnage: parseFloat(t.toFixed(1)) })).reverse();
  }, [sessions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black uppercase tracking-tighter">PERFORMANCE</h2>
      <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 h-[400px]">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Volume Progression (Tonnage/t)</h3>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" stroke="#333" fontSize={10} fontWeight="900" />
              <YAxis stroke="#333" fontSize={10} fontWeight="900" />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.02)'}}
                contentStyle={{backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px', fontSize: '10px', fontWeight: '900'}} 
              />
              <Bar dataKey="tonnage" fill={protocol.accentColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-800 uppercase font-black tracking-widest text-sm italic">Insufficient Data</div>
        )}
      </div>
    </div>
  );
};

const BodyStatsView: React.FC<{ 
  bodyWeights: BodyWeight[]; 
  onAddWeight: (w: BodyWeight) => void;
  onDeleteWeight: (id: string) => void;
}> = ({ bodyWeights, onAddWeight, onDeleteWeight }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <h2 className="text-4xl font-black uppercase tracking-tighter">BODY COMP</h2>
    <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 italic underline decoration-zinc-800 underline-offset-4">Weight Tracking (KG)</h3>
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <input 
            type="number" 
            step="0.1" 
            placeholder="00.0" 
            className="bg-black border border-white/10 rounded-2xl px-6 py-4 w-full font-mono text-2xl font-black text-white" 
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = parseFloat(e.currentTarget.value);
                if (val) {
                  onAddWeight({ id: crypto.randomUUID(), date: new Date().toISOString(), weight: val });
                  e.currentTarget.value = '';
                }
              }
            }} 
          />
          <span className="absolute -top-2 left-4 bg-black px-2 text-[8px] font-black text-zinc-500 uppercase tracking-widest">Entry</span>
        </div>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {bodyWeights.map(w => (
          <div key={w.id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 transition-all hover:border-white/10">
            <div>
              <span className="block text-[10px] font-black text-zinc-500 uppercase">{new Date(w.date).toLocaleDateString()}</span>
              <span className="font-mono text-2xl font-black text-white">{w.weight}</span>
              <span className="text-xs font-black text-zinc-600 ml-1">KG</span>
            </div>
            <button onClick={() => onDeleteWeight(w.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-colors"><X size={20} /></button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SettingsView: React.FC<{ settings: UserSettings; onUpdate: (s: UserSettings) => void }> = ({ settings, onUpdate }) => (
  <div className="space-y-8">
    <h2 className="text-4xl font-black uppercase tracking-tighter">SYSTEM</h2>
    <div className="bg-[#0e0e0e] border border-white/5 rounded-3xl p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <span className="block text-sm font-black uppercase tracking-tight text-white">Auto-Backup</span>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Saves to local storage after commit</span>
        </div>
        <button onClick={() => onUpdate({ ...settings, autoBackupAfterSession: !settings.autoBackupAfterSession })} className={`w-14 h-8 rounded-full p-1 transition-all ${settings.autoBackupAfterSession ? 'bg-green-500' : 'bg-zinc-800'}`}>
           <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.autoBackupAfterSession ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
      <div className="pt-8 border-t border-white/5">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center leading-relaxed">
          TITAN 133 Performance Engine<br/>Version 1.1.2 Build 2025<br/>Optimized for extreme mechanical tension
        </p>
      </div>
    </div>
  </div>
);

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; accent: string }> = ({ active, onClick, icon, label, accent }) => (
  <button onClick={onClick} className={`flex flex-col lg:flex-row items-center lg:space-x-4 px-2 lg:px-6 py-4 rounded-3xl transition-all ${active ? 'bg-white/5' : 'text-gray-500 hover:text-white'}`} style={{ color: active ? accent : undefined }}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: 3 })}
    <span className="text-[8px] lg:text-xs font-black uppercase tracking-[0.2em] mt-2 lg:mt-0">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'reports' | 'body' | 'settings' | 'history'>('dashboard');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [maxes, setMaxes] = useState<MaxStats>({ meadowsRow: 0, machinePress: 0, hackSquat: 0, rdl: 0, smithIncline: 0 });
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [activeProtocolId] = useState('titan-133');
  const [settings, setSettings] = useState<UserSettings>({ email: 'user@example.com', autoRemindExport: true, autoBackupAfterSession: true, lastExportMonth: new Date().getMonth() });
  const [bodyWeights, setBodyWeights] = useState<BodyWeight[]>([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('titan_sessions');
    const savedMaxes = localStorage.getItem('titan_maxes');
    const savedWeights = localStorage.getItem('titan_bodyweights');
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedMaxes) setMaxes(JSON.parse(savedMaxes));
    if (savedWeights) setBodyWeights(JSON.parse(savedWeights));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_sessions', JSON.stringify(sessions));
    localStorage.setItem('titan_maxes', JSON.stringify(maxes));
    localStorage.setItem('titan_bodyweights', JSON.stringify(bodyWeights));
  }, [sessions, maxes, bodyWeights]);

  const activeProtocol = useMemo(() => DEFAULT_PROTOCOLS.find(p => p.id === activeProtocolId) || DEFAULT_PROTOCOLS[0], [activeProtocolId]);

  const handleAddSession = (session: WorkoutSession) => {
    setSessions(prev => [session, ...prev]);
    const newMaxes = { ...maxes };
    session.exercises.forEach(ex => {
      const weight = Math.max(...ex.sets.map(s => s.weight));
      const n = ex.name.toLowerCase();
      if (n.includes('meadows')) newMaxes.meadowsRow = Math.max(newMaxes.meadowsRow, weight);
      if (n.includes('machine chest press')) newMaxes.machinePress = Math.max(newMaxes.machinePress, weight);
      if (n.includes('hack squat')) newMaxes.hackSquat = Math.max(newMaxes.hackSquat, weight);
      if (n.includes('rdl')) newMaxes.rdl = Math.max(newMaxes.rdl, weight);
      if (n.includes('smith incline')) newMaxes.smithIncline = Math.max(newMaxes.smithIncline, weight);
    });
    setMaxes(newMaxes);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 pb-24 lg:pb-0 lg:pl-72 flex flex-col">
      {timerSeconds !== null && <RestTimer seconds={timerSeconds} color={activeProtocol.accentColor} onComplete={() => setTimerSeconds(null)} onCancel={() => setTimerSeconds(null)} />}
      
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/5 flex justify-around p-2 z-50 lg:top-0 lg:left-0 lg:h-full lg:w-72 lg:flex-col lg:justify-start lg:border-r lg:border-t-0 lg:p-8 shadow-2xl select-none">
        <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="COMMAND" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'log'} onClick={() => setActiveTab('log')} icon={<Plus />} label="LOG" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 />} label="REPORTS" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'body'} onClick={() => setActiveTab('body')} icon={<User />} label="BODY" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label="ARCHIVE" accent={activeProtocol.accentColor} />
        <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 />} label="SYSTEM" accent={activeProtocol.accentColor} />
      </nav>

      <main className="max-w-6xl w-full mx-auto p-4 lg:p-12">
        {activeTab === 'dashboard' && <Dashboard sessions={sessions} maxes={maxes} protocol={activeProtocol} />}
        {activeTab === 'log' && (
          <WorkoutLogger 
            protocol={activeProtocol} 
            onSave={handleAddSession} 
            currentWeek={sessions[0]?.week || 1} 
            recommendedDay={(sessions[0]?.day % activeProtocol.days.length) + 1 || 1} 
            onStartRest={setTimerSeconds} 
          />
        )}
        {activeTab === 'history' && <HistoryView sessions={sessions} onDelete={(id) => setSessions(prev => prev.filter(s => s.id !== id))} protocols={DEFAULT_PROTOCOLS} />}
        {activeTab === 'reports' && <ReportsView sessions={sessions} protocol={activeProtocol} />}
        {activeTab === 'body' && (
          <BodyStatsView 
            bodyWeights={bodyWeights} 
            onAddWeight={(w) => setBodyWeights(prev => [w, ...prev])} 
            onDeleteWeight={(id) => setBodyWeights(prev => prev.filter(w => w.id !== id))} 
          />
        )}
        {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={setSettings} />}
      </main>
    </div>
  );
};

export default App;