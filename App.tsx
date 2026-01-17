
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Model from 'react-body-highlighter';
import { 
  History, 
  LayoutDashboard, 
  Plus, 
  Minus,
  TrendingUp, 
  Trash2, 
  Zap, 
  Trophy,
  Flame,
  BarChart3,
  X,
  Check,
  Download,
  Activity,
  PlusCircle,
  Settings2,
  AlertTriangle,
  ChevronRight,
  Database,
  FileUp,
  Save,
  Accessibility,
  Play,
  Timer
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { 
  WorkoutSession, 
  ExerciseEntry, 
  ExerciseSet, 
  Protocol, 
  UserSettings, 
  BodyWeight,
  Alert
} from './types';
import { getBodyHighlighterMuscles } from './muscleMapping';
import * as gemini from './services/geminiService';

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
        warmup: ["Band Pull-Aparts", "Shoulder Dislocations", "Light Tricep Pushdowns"],
        stretching: ["Doorway Stretch (60s)", "Wrist Stretch (60s)"],
        exercises: [
          "Meadows Row: 3 x 8–10 🎗️✋⚓⏱️", 
          "Machine Chest Press: 3 x 8–10 ✋⚓⏱️", 
          "Weighted Dips: 2 x 8–10 ⏱️", 
          "Cable Y-Raise: 2 x 12–15 🏳️", 
          "Reverse Cable Crossover: 3 x 12–15", 
          "Skull Crushers: 2 x 10–12 ⏳⚓"
        ]
      },
      { 
        day: 2, 
        name: "Upper 2", 
        targetDuration: 90,
        warmup: ["Dead Hangs", "Scapular Pull-ups", "Rotator Cuff Rotations"],
        stretching: ["Cross-Body Shoulder Stretch", "Child's Pose"],
        exercises: [
          "Chest-Supported Dual-Cable Row: 3 x 10–12 🎗️✋⚓⏱️", 
          "One-Arm Cable Pulldown: 3 x 10–12 🎗️⏱️", 
          "Reverse Machine Fly: 3 x 12–15 ⏳", 
          "Seated Cable Chest Fly: 2 x 12–15 ⚓", 
          "Machine Preacher Curl: 3 x 8–10 ⏳⚓", 
          "Cable Kickbacks: 3 x 12–15 🏳️"
        ]
      },
      { 
        day: 3, 
        name: "Lower", 
        targetDuration: 92,
        warmup: ["Leg Swings", "BW Lunges", "Cossack Squats"],
        stretching: ["Pigeon Pose", "Couch Stretch"],
        exercises: [
          "Hack Squat: 3 x 6–8 ⚓⏱️", 
          "Pendulum Squat: 3 x 8–10 ⏱️", 
          "Walking Lunges: 4 x 10/leg ⏱️", 
          "RDL: 3 x 8–10 🎗️⚓⏱️", 
          "Leg Curl Singolo: 3 x 10–12 🏳️", 
          "Lying Leg Curl: 1 x 10–12 ⚓"
        ]
      },
      { 
        day: 4, 
        name: "FB 1", 
        targetDuration: 115,
        warmup: ["World's Greatest Stretch", "Thoracic Rotations", "Face Pulls"],
        stretching: ["Static Lunge Hold", "Hamstring Fold"],
        exercises: [
          "Chest-Supported Row: 3 x 8–10 🎗️⏱️",
          "Leg Press: 3 x 10-12 ⏱️",
          "Face Pulls: 3 x 15-20",
          "Smith Incline Bench: 3 x 8-10 ✋⚓⏱️",
          "Close Grip Bench: 2 x 10-12",
          "Cable Lateral Raise: 3 x 15-20"
        ]
      }
    ]
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'session' | 'stats' | 'system'>('dashboard');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Load persistence data on mount
  useEffect(() => {
    const saved = localStorage.getItem('titan_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed.sessions || []);
        setAlerts(parsed.alerts || []);
        if (parsed.currentSession) {
          setCurrentSession(parsed.currentSession);
        }
      } catch (e) {
        console.error("TITAN 133: Failed to load storage data", e);
      }
    }
  }, []);

  // Persistence logic
  useEffect(() => {
    localStorage.setItem('titan_data', JSON.stringify({
      sessions,
      alerts,
      currentSession
    }));
  }, [sessions, alerts, currentSession]);

  // Immediate save helper for set operations
  const saveSessionNow = (updatedSession: WorkoutSession) => {
    localStorage.setItem('titan_data', JSON.stringify({
      sessions,
      alerts,
      currentSession: updatedSession
    }));
  };

  const handleStartSession = (dayNum: number) => {
    const protocol = DEFAULT_PROTOCOLS[0];
    const day = protocol.days.find(d => d.day === dayNum);
    if (!day) return;

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      week: Math.floor(sessions.length / 4) + 1,
      day: dayNum,
      protocolId: protocol.id,
      warmupCompleted: new Array(day.warmup.length).fill(false),
      stretchingCompleted: new Array(day.stretching.length).fill(false),
      exercises: day.exercises.map(exName => {
        const parts = exName.split(':');
        const name = parts[0].trim();
        const config = parts[1]?.trim() || '';
        const plannedSetsCount = parseInt(config.split('x')[0]) || 3;
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          name,
          targetRepRange: config.split('x')[1]?.trim().split(' ')[0] || '8-10',
          plannedSets: plannedSetsCount,
          sets: Array.from({ length: plannedSetsCount }, () => ({ reps: 0, weight: 0, completed: false })),
          requiresStraps: exName.includes('🎗️'),
          hasFinisherTarget: exName.includes('✋'),
          hasAnchorTarget: exName.includes('⚓'),
          hasLongRest: exName.includes('⏱️')
        };
      })
    };

    setCurrentSession(newSession);
    setActiveTab('session');
  };

  const updateSet = (exId: string, setIdx: number, field: 'reps' | 'weight' | 'completed', value: any) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIdx) return s;
        const newSet = { ...s, [field]: value };
        if (field === 'reps' && value > 0) {
          newSet.completed = true;
        }
        return newSet;
      });
      return { ...ex, sets: updatedSets };
    });
    const updatedSession = { ...currentSession, exercises: updatedExercises };
    saveSessionNow(updatedSession);
    setCurrentSession(updatedSession);
  };

  const addSet = (exId: string) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id !== exId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newWeight = lastSet ? lastSet.weight : 0;
      return {
        ...ex,
        sets: [...ex.sets, { reps: 0, weight: newWeight, completed: false }]
      };
    });
    const updatedSession = { ...currentSession, exercises: updatedExercises };
    saveSessionNow(updatedSession);
    setCurrentSession(updatedSession);
  };

  const removeSet = (exId: string) => {
    if (!currentSession) return;
    const updatedExercises = currentSession.exercises.map(ex => {
      if (ex.id === exId && ex.sets.length > 1) {
        return { ...ex, sets: ex.sets.slice(0, -1) };
      }
      return ex;
    });
    const updatedSession = { ...currentSession, exercises: updatedExercises };
    saveSessionNow(updatedSession);
    setCurrentSession(updatedSession);
  };

  const handleFinishSession = async () => {
    if (!currentSession) return;
    setLoadingAi(true);
    const updatedSessions = [currentSession, ...sessions];
    setSessions(updatedSessions);
    const insight = await gemini.getWorkoutInsights(currentSession);
    setAiInsight(insight);
    const newAlerts = await gemini.generateHealthAlerts(updatedSessions);
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    setCurrentSession(null);
    setActiveTab('dashboard');
    setLoadingAi(false);
  };

  const exportCSV = () => {
    if (sessions.length === 0) return;
    let csv = "Date,Week,Day,Exercise,Set,Weight,Reps\n";
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        ex.sets.forEach((set, i) => {
          csv += `${new Date(s.date).toLocaleDateString()},${s.week},${s.day},"${ex.name}",${i+1},${set.weight},${set.reps}\n`;
        });
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `titan_logs_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const exportBackup = () => {
    const data = JSON.stringify({ sessions, alerts });
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `titan_backup_${new Date().toISOString().split('T')[0]}.json`);
    a.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.sessions) {
          setSessions(parsed.sessions);
          setAlerts(parsed.alerts || []);
          alert("Backup Restored Successfully.");
        }
      } catch (err) {
        alert("Invalid Backup File.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-900/40">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">Titan 133</h1>
        </div>
        <nav className="flex items-center gap-1 bg-slate-800/50 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-700 text-red-500 shadow-lg' : 'text-slate-400'}`}><LayoutDashboard className="w-5 h-5" /></button>
          <button onClick={() => setActiveTab('history')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'history' ? 'bg-slate-700 text-red-500 shadow-lg' : 'text-slate-400'}`}><History className="w-5 h-5" /></button>
          <button onClick={() => setActiveTab('stats')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-slate-700 text-red-500 shadow-lg' : 'text-slate-400'}`}><TrendingUp className="w-5 h-5" /></button>
          <button onClick={() => setActiveTab('system')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'system' ? 'bg-slate-700 text-red-500 shadow-lg' : 'text-slate-400'}`}><Settings2 className="w-5 h-5" /></button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Volume', val: sessions.length, icon: Activity, color: 'text-green-400' },
                { label: 'Weekly Streak', val: '5', sub: 'days', icon: Flame, color: 'text-orange-500' },
                { label: 'Protocol', val: 'T-133', icon: Database, color: 'text-blue-400' },
                { label: 'Alerts', val: alerts.length, icon: AlertTriangle, color: 'text-yellow-400' },
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                  <kpi.icon className={`w-4 h-4 mb-2 ${kpi.color}`} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-white">{kpi.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {currentSession && (
              <div className="bg-red-600 border border-red-400 p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl"><Activity className="w-8 h-8 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Active Session Detected</h3>
                    <p className="text-sm text-red-100 font-bold uppercase tracking-wide">
                      {DEFAULT_PROTOCOLS[0].days.find(d => d.day === currentSession.day)?.name} • {currentSession.exercises.length} Movements
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('session')}
                  className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" /> Resume Now
                </button>
              </div>
            )}

            {aiInsight && (
              <div className="bg-indigo-950/30 border border-indigo-500/20 p-6 rounded-3xl flex gap-4 items-start shadow-2xl">
                <div className="bg-indigo-500/10 p-2 rounded-xl"><Zap className="w-6 h-6 text-indigo-400" /></div>
                <p className="text-lg text-indigo-100 font-medium italic">"{aiInsight}"</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_PROTOCOLS[0].days.map(day => (
                <button key={day.day} onClick={() => handleStartSession(day.day)} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left hover:border-red-600/50 transition-all active:scale-95 shadow-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider">Day {day.day}</span>
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase mt-3">{day.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{day.exercises.length} Movements</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'session' && currentSession && (
          <div className="space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center shadow-2xl">
              <div>
                <h2 className="text-2xl font-black italic uppercase text-white">
                  {DEFAULT_PROTOCOLS[0].days.find(d => d.day === currentSession.day)?.name}
                </h2>
                <p className="text-xs font-black text-red-500 uppercase tracking-widest mt-1">Real-time Persistence Active</p>
              </div>
              <button onClick={() => setActiveTab('dashboard')} className="p-3 bg-slate-800 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {currentSession.exercises.map(ex => {
                const completedSetsCount = ex.sets.filter(s => s.completed && (s.reps > 0 || s.weight > 0)).length;
                const isComplete = completedSetsCount >= ex.plannedSets;
                return (
                  <div key={ex.id} className={`bg-slate-900 border rounded-[2rem] overflow-hidden transition-all duration-500 ${isComplete ? 'border-green-500/30' : 'border-slate-800'}`}>
                    <div className="p-6 border-b border-slate-800/50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{ex.name}</h3>
                          {isComplete && <Check className="w-5 h-5 text-green-500" />}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wider">{ex.targetRepRange} Reps</span>
                          {ex.hasFinisherTarget && <span className="text-[10px] font-black bg-red-500/10 text-red-400 px-2 py-1 rounded-md uppercase">✋ Finisher</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-3">
                      {ex.sets.map((set, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-2xl text-xs font-black transition-colors ${set.completed ? 'bg-green-500 text-black shadow-lg shadow-green-900/40' : 'bg-slate-800 text-slate-500'}`}>{i+1}</div>
                          <input 
                            type="number" 
                            placeholder="KG" 
                            value={set.weight || ''} 
                            onChange={(e) => updateSet(ex.id, i, 'weight', parseFloat(e.target.value))}
                            className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center font-black focus:border-red-500 outline-none transition-all" 
                          />
                          <input 
                            type="number" 
                            placeholder="REPS" 
                            value={set.reps || ''} 
                            onChange={(e) => updateSet(ex.id, i, 'reps', parseInt(e.target.value))}
                            className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center font-black focus:border-red-500 outline-none transition-all" 
                          />
                          <button 
                            onClick={() => updateSet(ex.id, i, 'completed', !set.completed)}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${set.completed ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-600'}`}
                          >
                            <Check className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* NEW ACTION BAR */}
                    <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
                      <button 
                        onClick={() => removeSet(ex.id)}
                        disabled={ex.sets.length <= 1}
                        className="flex-1 min-h-[48px] bg-[#374151] rounded-[8px] flex items-center justify-center gap-2 px-3 py-3 text-red-500 font-black uppercase italic transition-all active:scale-95 disabled:opacity-30"
                      >
                        <Minus className="w-5 h-5" />
                        <span>Delete</span>
                      </button>
                      
                      <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] italic shrink-0">
                        Rest {ex.hasLongRest ? '3:00' : '1:30'}
                      </div>

                      <button 
                        onClick={() => addSet(ex.id)}
                        className="flex-1 min-h-[48px] bg-[#374151] rounded-[8px] flex items-center justify-center gap-2 px-3 py-3 text-green-500 font-black uppercase italic transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Set</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="fixed bottom-6 left-6 right-6">
              <button 
                onClick={handleFinishSession} 
                disabled={loadingAi}
                className="w-full bg-red-600 text-white p-5 rounded-3xl font-black text-xl uppercase italic shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
              >
                {loadingAi ? <Activity className="w-7 h-7 animate-pulse" /> : <Save className="w-7 h-7" />}
                {loadingAi ? 'Titan AI Analyzing...' : 'Commit Session'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-black italic uppercase text-white">Titan Archives</h2>
              <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 active:scale-95">
                <Download size={14} /> Export CSV
              </button>
            </div>
            {sessions.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex justify-between items-center group">
                <div className="flex gap-5 items-center">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-red-500 font-black italic text-xl">D{s.day}</div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase italic">{DEFAULT_PROTOCOLS[0].days.find(d => d.day === s.day)?.name}</h4>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">{new Date(s.date).toLocaleDateString()} • {s.exercises.length} Movements</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("Permanently delete this session?")) {
                      setSessions(prev => prev.filter(x => x.id !== s.id));
                    }
                  }} 
                  className="text-slate-800 group-hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
                <Activity className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No historical data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black italic uppercase text-white px-2">System Ops</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6">Data Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={exportBackup} className="bg-slate-800 p-6 rounded-3xl text-left flex items-center justify-between group active:scale-95 transition-all">
                    <div>
                      <span className="block font-black uppercase tracking-tight">Create Backup</span>
                      <span className="block text-[10px] text-slate-500 mt-1 uppercase">Saves all logs as encrypted .JSON</span>
                    </div>
                    <Download className="group-hover:text-red-500 transition-colors" />
                  </button>
                  <label className="bg-slate-800 p-6 rounded-3xl text-left flex items-center justify-between cursor-pointer group active:scale-95 transition-all">
                    <div>
                      <span className="block font-black uppercase tracking-tight">Restore Backup</span>
                      <span className="block text-[10px] text-slate-500 mt-1 uppercase">Upload a previous .JSON backup</span>
                    </div>
                    <FileUp className="group-hover:text-red-500 transition-colors" />
                    <input type="file" accept=".json" onChange={importBackup} className="hidden" />
                  </label>
                </div>
              </div>

              {currentSession && (
                <div className="pt-8 border-t border-slate-800">
                  <h3 className="text-xs font-black uppercase text-red-500 tracking-widest mb-6">Emergency Override</h3>
                  <button 
                    onClick={() => {
                      if (confirm("Delete current active session? Progress will be lost.")) {
                        setCurrentSession(null);
                        setActiveTab('dashboard');
                      }
                    }}
                    className="w-full bg-red-900/10 border border-red-900/50 p-6 rounded-3xl text-left flex items-center justify-between group active:scale-95 transition-all"
                  >
                    <div>
                      <span className="block font-black uppercase text-red-500">Wipe Active Session</span>
                      <span className="block text-[10px] text-red-900 mt-1 uppercase">Deletes the incomplete record from cache</span>
                    </div>
                    <Trash2 className="text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in duration-700">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white px-2">Biometrics</h2>
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] h-96 shadow-2xl">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1.5rem', color: '#fff' }} cursor={{ fill: '#1e293b' }} />
                    <Bar dataKey="day" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <p className="text-center text-[10px] font-black uppercase text-slate-600 tracking-widest">Mechanical Tension Trends (Last 10 Sessions)</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
