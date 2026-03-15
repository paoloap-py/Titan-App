
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart
} from 'recharts';
import { WorkoutSession, ExerciseSet } from './types';

type TimeRange = 'all' | '30d' | '90d';
type DashTab = 'overview' | 'exercises' | 'records';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [token, setToken] = useState(() => localStorage.getItem('titan_github_token') || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem('titan_gist_id') || '');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [dashTab, setDashTab] = useState<DashTab>('overview');

  useEffect(() => {
    const loadData = async () => {
      // Try localStorage first
      const saved = localStorage.getItem('titan_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.sessions?.length > 0) {
            setSessions(parsed.sessions.sort((a: WorkoutSession, b: WorkoutSession) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            ));
            setLoading(false);
            return;
          }
        } catch (e) { /* fall through */ }
      }

      // Try Gist
      if (token && gistId) {
        try {
          const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const content = data.files['titan-workout-data.json']?.content;
            if (content) {
              const parsed = JSON.parse(content);
              if (parsed.sessions?.length > 0) {
                setSessions(parsed.sessions.sort((a: WorkoutSession, b: WorkoutSession) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                ));
                setLoading(false);
                return;
              }
            }
          }
        } catch (e) { /* fall through */ }
      }

      setError('No data found. Open the app on your phone first or configure GitHub sync.');
      setLoading(false);
    };
    loadData();
  }, [token, gistId]);

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    if (timeRange === 'all') return sessions;
    const now = new Date();
    const days = timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return sessions.filter(s => new Date(s.date) >= cutoff);
  }, [sessions, timeRange]);

  // Get all unique exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    filteredSessions.forEach(s => s.exercises.forEach(ex => names.add(ex.name)));
    return Array.from(names).sort();
  }, [filteredSessions]);

  // Set default selected exercise
  useEffect(() => {
    if (exerciseNames.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseNames[0]);
    }
  }, [exerciseNames, selectedExercise]);

  // Session volume data
  const volumeData = useMemo(() => {
    return filteredSessions.map(s => {
      const tonnage = s.exercises.reduce((total, ex) =>
        total + ex.sets.reduce((t, set) => t + (set.weight * set.reps), 0), 0);
      const totalSets = s.exercises.reduce((total, ex) => total + ex.sets.filter(set => set.completed).length, 0);
      return {
        date: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        fullDate: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        tonnage: Math.round(tonnage),
        sets: totalSets,
        day: s.day,
        dayName: `Day ${s.day}`,
        week: s.week
      };
    });
  }, [filteredSessions]);

  // Exercise progression data
  const exerciseProgressionData = useMemo(() => {
    if (!selectedExercise) return [];
    return filteredSessions
      .filter(s => s.exercises.some(ex => ex.name.toLowerCase() === selectedExercise.toLowerCase()))
      .map(s => {
        const ex = s.exercises.find(e => e.name.toLowerCase() === selectedExercise.toLowerCase())!;
        const topSet = ex.sets.reduce((best, set) =>
          (set.weight * set.reps > best.weight * best.reps) ? set : best, ex.sets[0]);
        const maxWeight = Math.max(...ex.sets.map(s => s.weight));
        const totalVolume = ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        const e1rm = Math.round(maxWeight * (1 + ex.sets.find(s => s.weight === maxWeight)!.reps / 30));
        return {
          date: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          maxWeight,
          totalVolume: Math.round(totalVolume),
          sets: ex.sets.length,
          bestReps: topSet.reps,
          bestWeight: topSet.weight,
          e1rm
        };
      });
  }, [filteredSessions, selectedExercise]);

  // Training frequency
  const weeklyFrequency = useMemo(() => {
    const weeks: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const date = new Date(s.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1);
      const key = weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, sessions: count }));
  }, [filteredSessions]);

  // Day distribution
  const dayDistribution = useMemo(() => {
    const days: Record<number, number> = {};
    filteredSessions.forEach(s => { days[s.day] = (days[s.day] || 0) + 1; });
    return Object.entries(days).map(([day, count]) => ({
      day: `Day ${day}`,
      count
    })).sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));
  }, [filteredSessions]);

  // Top exercises by total volume
  const topExercises = useMemo(() => {
    const volumes: Record<string, number> = {};
    filteredSessions.forEach(s => s.exercises.forEach(ex => {
      const vol = ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      volumes[ex.name] = (volumes[ex.name] || 0) + vol;
    }));
    return Object.entries(volumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, volume]) => ({ name, volume: Math.round(volume) }));
  }, [filteredSessions]);

  // Muscle group volume from exercise names (heuristic mapping)
  const muscleVolume = useMemo(() => {
    const muscleMap: Record<string, string[]> = {
      'Chest': ['bench', 'chest', 'fly', 'pec', 'push-up', 'dip', 'crossover', 'cable fly'],
      'Back': ['row', 'pulldown', 'pull-up', 'deadlift', 'lat', 'back', 'meadows', 'shrug', 'face pull'],
      'Shoulders': ['shoulder', 'ohp', 'lateral', 'delt', 'press', 'raise', 'military', 'arnold'],
      'Quads': ['squat', 'leg press', 'hack', 'lunge', 'extension', 'quad', 'split squat', 'sissy'],
      'Hamstrings': ['rdl', 'leg curl', 'hamstring', 'romanian', 'good morning', 'nordic'],
      'Arms': ['curl', 'bicep', 'tricep', 'pushdown', 'skullcrusher', 'hammer', 'preacher', 'overhead extension'],
      'Calves': ['calf', 'calves', 'gastrocnemius', 'soleus'],
      'Core': ['ab', 'core', 'crunch', 'plank', 'woodchop', 'cable twist', 'pallof'],
    };
    const volumes: Record<string, number> = {};
    filteredSessions.forEach(s => s.exercises.forEach(ex => {
      const name = ex.name.toLowerCase();
      const vol = ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      for (const [muscle, keywords] of Object.entries(muscleMap)) {
        if (keywords.some(k => name.includes(k))) {
          volumes[muscle] = (volumes[muscle] || 0) + vol;
          break;
        }
      }
    }));
    return Object.entries(volumes)
      .sort((a, b) => b[1] - a[1])
      .map(([muscle, volume]) => ({ muscle, volume: Math.round(volume) }));
  }, [filteredSessions]);

  // All-time PRs per exercise
  const allTimePRs = useMemo(() => {
    const prs: Record<string, { weight: number; reps: number; volume: number; date: string; e1rm: number }> = {};
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.weight <= 0 || set.reps <= 0) return;
          const vol = set.weight * set.reps;
          const e1rm = Math.round(set.weight * (1 + set.reps / 30));
          const key = ex.name;
          if (!prs[key] || e1rm > prs[key].e1rm) {
            prs[key] = { weight: set.weight, reps: set.reps, volume: vol, date: s.date, e1rm };
          }
        });
      });
    });
    return Object.entries(prs)
      .sort((a, b) => b[1].e1rm - a[1].e1rm)
      .map(([exercise, data]) => ({
        exercise,
        ...data,
        dateStr: new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }));
  }, [sessions]);

  // PR timeline (only new records that beat previous)
  const prTimeline = useMemo(() => {
    const prs: Record<string, number> = {};
    const prEvents: { date: string; exercise: string; weight: number; reps: number; volume: number; e1rm: number }[] = [];

    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.weight <= 0 || set.reps <= 0) return;
          const e1rm = Math.round(set.weight * (1 + set.reps / 30));
          const key = ex.name.toLowerCase();
          if (!prs[key]) {
            prs[key] = e1rm;
          } else if (e1rm > prs[key]) {
            prEvents.push({
              date: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
              exercise: ex.name,
              weight: set.weight,
              reps: set.reps,
              volume: set.weight * set.reps,
              e1rm
            });
            prs[key] = e1rm;
          }
        });
      });
    });

    return prEvents.sort((a, b) => prEvents.indexOf(a) - prEvents.indexOf(b));
  }, [sessions]);

  // Volume trend (moving average)
  const volumeTrend = useMemo(() => {
    if (volumeData.length < 3) return null;
    const first3 = volumeData.slice(0, 3).reduce((s, d) => s + d.tonnage, 0) / 3;
    const last3 = volumeData.slice(-3).reduce((s, d) => s + d.tonnage, 0) / 3;
    const pctChange = ((last3 - first3) / first3) * 100;
    return { direction: pctChange >= 0 ? 'up' : 'down', pct: Math.abs(Math.round(pctChange)) };
  }, [volumeData]);

  // Consistency score
  const consistencyScore = useMemo(() => {
    if (filteredSessions.length < 2) return null;
    const dates = filteredSessions.map(s => new Date(s.date).getTime());
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    }
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    // Score: 100 if avg gap is ~1.5 days, decreasing as gap increases
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgGap - 1.5) * 20)));
    return score;
  }, [filteredSessions]);

  // Stats summary
  const stats = useMemo(() => {
    if (filteredSessions.length === 0) return null;
    const totalTonnage = filteredSessions.reduce((total, s) =>
      total + s.exercises.reduce((t, ex) =>
        t + ex.sets.reduce((v, set) => v + set.weight * set.reps, 0), 0), 0);
    const totalSets = filteredSessions.reduce((total, s) =>
      total + s.exercises.reduce((t, ex) => t + ex.sets.filter(set => set.completed).length, 0), 0);
    const totalReps = filteredSessions.reduce((total, s) =>
      total + s.exercises.reduce((t, ex) =>
        t + ex.sets.reduce((r, set) => r + (set.completed ? set.reps : 0), 0), 0), 0);
    const firstDate = new Date(filteredSessions[0].date);
    const lastDate = new Date(filteredSessions[filteredSessions.length - 1].date);
    const daySpan = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const uniqueExercises = new Set<string>();
    filteredSessions.forEach(s => s.exercises.forEach(ex => uniqueExercises.add(ex.name)));

    return {
      totalSessions: filteredSessions.length,
      totalTonnage: Math.round(totalTonnage),
      totalSets,
      totalReps,
      avgTonnagePerSession: Math.round(totalTonnage / filteredSessions.length),
      avgSetsPerSession: Math.round(totalSets / filteredSessions.length),
      sessionsPerWeek: Math.round((filteredSessions.length / daySpan) * 7 * 10) / 10,
      daySpan,
      uniqueExercises: uniqueExercises.size,
      firstDate: firstDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastDate: lastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  }, [filteredSessions]);

  // Per-set volume data for scatter-like display
  const setsPerSession = useMemo(() => {
    return filteredSessions.map(s => {
      const totalSets = s.exercises.reduce((t, ex) => t + ex.sets.filter(set => set.completed).length, 0);
      return {
        date: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        sets: totalSets
      };
    });
  }, [filteredSessions]);

  const tooltipStyle = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #262626',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-black text-neutral-500 uppercase tracking-[0.3em]">Loading analytics</p>
        </div>
      </div>
    );
  }

  if (error || sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">TITAN</h1>
          <p className="text-neutral-600 text-xs font-black uppercase tracking-[0.4em]">Analytics Dashboard</p>
        </div>
        <p className="text-neutral-500 text-sm max-w-sm text-center">{error || 'No session data available'}</p>
        <div className="flex flex-col gap-3 w-80">
          <input
            type="password"
            placeholder="GitHub Token (ghp_...)"
            value={token}
            onChange={e => { setToken(e.target.value); localStorage.setItem('titan_github_token', e.target.value); }}
            className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl text-sm text-white placeholder-neutral-700 outline-none focus:border-red-500/50 transition-colors"
          />
          <input
            type="text"
            placeholder="Gist ID"
            value={gistId}
            onChange={e => { setGistId(e.target.value); localStorage.setItem('titan_gist_id', e.target.value); }}
            className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl text-sm text-white placeholder-neutral-700 outline-none font-mono focus:border-red-500/50 transition-colors"
          />
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-3.5 rounded-xl font-black uppercase text-sm tracking-wider transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  const formatTonnage = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}t` : `${v}`;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tight">TITAN Analytics</h1>
            </div>
            <div className="flex gap-1 bg-neutral-900 rounded-lg p-1">
              {(['overview', 'exercises', 'records'] as DashTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDashTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
                    dashTab === tab
                      ? 'bg-red-600 text-white'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-neutral-900 rounded-lg p-1">
              {(['all', '90d', '30d'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                    timeRange === range
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  {range === 'all' ? 'All' : range}
                </button>
              ))}
            </div>
            <a href="#" className="text-xs font-bold text-neutral-600 hover:text-white uppercase tracking-wider transition-colors">App</a>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">

        {/* ============ OVERVIEW TAB ============ */}
        {dashTab === 'overview' && (<>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Sessions', value: stats?.totalSessions, sub: `${stats?.sessionsPerWeek}/wk` },
              { label: 'Tonnage', value: formatTonnage(stats?.totalTonnage || 0), sub: `${formatTonnage(stats?.avgTonnagePerSession || 0)}/session` },
              { label: 'Sets', value: stats?.totalSets?.toLocaleString(), sub: `${stats?.avgSetsPerSession}/session` },
              { label: 'Reps', value: stats?.totalReps?.toLocaleString() },
              { label: 'Exercises', value: stats?.uniqueExercises },
              { label: 'Days Active', value: stats?.daySpan },
              { label: 'Consistency', value: consistencyScore !== null ? `${consistencyScore}%` : '—', sub: consistencyScore !== null ? (consistencyScore >= 70 ? 'Great' : consistencyScore >= 40 ? 'OK' : 'Low') : undefined },
              { label: 'Vol. Trend', value: volumeTrend ? `${volumeTrend.direction === 'up' ? '+' : '-'}${volumeTrend.pct}%` : '—', sub: volumeTrend?.direction === 'up' ? 'Increasing' : 'Decreasing' },
            ].map((kpi, i) => (
              <div key={i} className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl hover:border-neutral-800 transition-colors">
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">{kpi.label}</p>
                <p className="text-xl font-black text-white mt-1 tabular-nums">{kpi.value}</p>
                {kpi.sub && <p className="text-[10px] font-bold text-neutral-600 mt-0.5">{kpi.sub}</p>}
              </div>
            ))}
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Volume Over Time - 2 cols */}
            <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-wider">Volume Over Time</h2>
                  <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Tonnage per session</p>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                    <XAxis dataKey="date" tick={{ fill: '#525252', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#525252', fontSize: 10 }} tickFormatter={(v: number) => formatTonnage(v)} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatTonnage(value), 'Tonnage']} />
                    <Area type="monotone" dataKey="tonnage" stroke="#dc2626" fill="url(#volGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#dc2626' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sets Per Session */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Sets / Session</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Completed sets</p>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={setsPerSession}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                    <XAxis dataKey="date" tick={{ fill: '#525252', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="sets" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Frequency */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Weekly Frequency</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Sessions per week</p>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyFrequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                    <XAxis dataKey="week" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#525252', fontSize: 10 }} domain={[0, 7]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="sessions" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Muscle Group Volume */}
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Muscle Volume Split</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Estimated by exercise</p>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={muscleVolume} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                    <XAxis type="number" tick={{ fill: '#525252', fontSize: 10 }} tickFormatter={(v: number) => formatTonnage(v)} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="muscle" tick={{ fill: '#a3a3a3', fontSize: 11, fontWeight: 700 }} width={75} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatTonnage(value), 'Volume']} />
                    <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                      {muscleVolume.map((_, i) => {
                        const colors = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
                        return <rect key={i} fill={colors[i % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Day Distribution + Top Exercises */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Day Distribution</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Sessions per training day</p>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                    <XAxis dataKey="day" tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Exercises */}
            <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Top Exercises</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">By total volume</p>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topExercises} layout="vertical" margin={{ left: 140 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                    <XAxis type="number" tick={{ fill: '#525252', fontSize: 10 }} tickFormatter={(v: number) => formatTonnage(v)} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 700 }} width={135} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatTonnage(value), 'Volume']} />
                    <Bar dataKey="volume" fill="#dc2626" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </>)}

        {/* ============ EXERCISES TAB ============ */}
        {dashTab === 'exercises' && (<>

          {/* Exercise Selector */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Exercise Progression</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Track weight and volume over time</p>
              </div>
              <select
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-white text-sm font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-neutral-700 transition-colors"
              >
                {exerciseNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Exercise KPIs */}
            {exerciseProgressionData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                  { label: 'Best Weight', value: `${Math.max(...exerciseProgressionData.map(d => d.maxWeight))}kg` },
                  { label: 'Est. 1RM', value: `${Math.max(...exerciseProgressionData.map(d => d.e1rm))}kg` },
                  { label: 'Best Volume', value: formatTonnage(Math.max(...exerciseProgressionData.map(d => d.totalVolume))) },
                  { label: 'Sessions', value: exerciseProgressionData.length },
                  { label: 'Avg Sets', value: Math.round(exerciseProgressionData.reduce((s, d) => s + d.sets, 0) / exerciseProgressionData.length) },
                ].map((kpi, i) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">{kpi.label}</p>
                    <p className="text-lg font-black text-white mt-0.5">{kpi.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Max Weight Chart */}
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseProgressionData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" />
                  <XAxis dataKey="date" tick={{ fill: '#525252', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#525252', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [
                      name === 'maxWeight' ? `${value}kg` : name === 'e1rm' ? `${value}kg` : formatTonnage(value),
                      name === 'maxWeight' ? 'Max Weight' : name === 'e1rm' ? 'Est. 1RM' : 'Total Volume'
                    ]}
                  />
                  <Line type="monotone" dataKey="maxWeight" stroke="#dc2626" strokeWidth={2.5} dot={{ fill: '#dc2626', r: 4, strokeWidth: 0 }} name="maxWeight" />
                  <Line type="monotone" dataKey="e1rm" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="e1rm" />
                  <Line type="monotone" dataKey="totalVolume" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} name="totalVolume" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Session History Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-900">
                    <th className="text-left p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Max Weight</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Est. 1RM</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Best Set</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Volume</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Sets</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseProgressionData.slice().reverse().map((d, i) => (
                    <tr key={i} className="border-t border-neutral-900 hover:bg-neutral-950">
                      <td className="p-3 font-bold text-neutral-400">{d.date}</td>
                      <td className="p-3 text-right font-black text-white">{d.maxWeight}kg</td>
                      <td className="p-3 text-right font-bold text-orange-400">{d.e1rm}kg</td>
                      <td className="p-3 text-right font-bold text-neutral-400">{d.bestWeight}kg x {d.bestReps}</td>
                      <td className="p-3 text-right font-bold text-blue-400">{formatTonnage(d.totalVolume)}</td>
                      <td className="p-3 text-right font-bold text-neutral-500">{d.sets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>)}

        {/* ============ RECORDS TAB ============ */}
        {dashTab === 'records' && (<>

          {/* PR Timeline */}
          {prTimeline.length > 0 && (
            <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">PR Timeline</h2>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">New personal records over time</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {prTimeline.slice().reverse().map((pr, i) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex justify-between items-center hover:border-yellow-500/30 transition-colors group">
                    <div>
                      <p className="text-sm font-black text-white uppercase group-hover:text-yellow-500 transition-colors">{pr.exercise}</p>
                      <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">{pr.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-yellow-500">{pr.weight}kg x {pr.reps}</p>
                      <p className="text-[10px] font-bold text-neutral-600">E1RM: {pr.e1rm}kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-Time PRs Table */}
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl">
            <div className="mb-6">
              <h2 className="text-sm font-black uppercase text-white tracking-wider">All-Time Personal Records</h2>
              <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-0.5">Best estimated 1RM per exercise</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-900">
                    <th className="text-left p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Exercise</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Weight</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Reps</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Est. 1RM</th>
                    <th className="text-right p-3 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allTimePRs.map((pr, i) => (
                    <tr key={i} className="border-t border-neutral-900 hover:bg-neutral-950">
                      <td className="p-3 font-black text-white uppercase text-xs">{pr.exercise}</td>
                      <td className="p-3 text-right font-black text-red-500">{pr.weight}kg</td>
                      <td className="p-3 text-right font-bold text-neutral-400">{pr.reps}</td>
                      <td className="p-3 text-right font-black text-yellow-500">{pr.e1rm}kg</td>
                      <td className="p-3 text-right font-bold text-neutral-600">{pr.dateStr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>)}

        {/* Footer */}
        <div className="text-center py-6 border-t border-neutral-900">
          <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em]">
            {stats?.firstDate} — {stats?.lastDate} • {stats?.totalSessions} sessions • {formatTonnage(stats?.totalTonnage || 0)} total volume
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
