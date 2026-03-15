
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart
} from 'recharts';
import { WorkoutSession } from './types';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [token, setToken] = useState(() => localStorage.getItem('titan_github_token') || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem('titan_gist_id') || '');

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

  // Get all unique exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => s.exercises.forEach(ex => names.add(ex.name)));
    return Array.from(names).sort();
  }, [sessions]);

  // Set default selected exercise
  useEffect(() => {
    if (exerciseNames.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseNames[0]);
    }
  }, [exerciseNames, selectedExercise]);

  // Session volume data (total tonnage per session)
  const volumeData = useMemo(() => {
    return sessions.map(s => {
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
  }, [sessions]);

  // Exercise progression data
  const exerciseProgressionData = useMemo(() => {
    if (!selectedExercise) return [];
    return sessions
      .filter(s => s.exercises.some(ex => ex.name.toLowerCase() === selectedExercise.toLowerCase()))
      .map(s => {
        const ex = s.exercises.find(e => e.name.toLowerCase() === selectedExercise.toLowerCase())!;
        const topSet = ex.sets.reduce((best, set) =>
          (set.weight * set.reps > best.weight * best.reps) ? set : best, ex.sets[0]);
        const avgWeight = ex.sets.length > 0
          ? Math.round(ex.sets.reduce((sum, set) => sum + set.weight, 0) / ex.sets.length)
          : 0;
        const maxWeight = Math.max(...ex.sets.map(s => s.weight));
        const totalVolume = ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
        return {
          date: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          maxWeight,
          avgWeight,
          topSetVolume: topSet.weight * topSet.reps,
          totalVolume: Math.round(totalVolume),
          sets: ex.sets.length,
          bestReps: topSet.reps,
          bestWeight: topSet.weight
        };
      });
  }, [sessions, selectedExercise]);

  // Training frequency - sessions per week
  const weeklyFrequency = useMemo(() => {
    const weeks: Record<string, number> = {};
    sessions.forEach(s => {
      const date = new Date(s.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
      const key = weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, sessions: count }));
  }, [sessions]);

  // Day distribution
  const dayDistribution = useMemo(() => {
    const days: Record<number, number> = {};
    sessions.forEach(s => { days[s.day] = (days[s.day] || 0) + 1; });
    return Object.entries(days).map(([day, count]) => ({
      day: `Day ${day}`,
      count
    })).sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));
  }, [sessions]);

  // Top exercises by total volume
  const topExercises = useMemo(() => {
    const volumes: Record<string, number> = {};
    sessions.forEach(s => s.exercises.forEach(ex => {
      const vol = ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      volumes[ex.name] = (volumes[ex.name] || 0) + vol;
    }));
    return Object.entries(volumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, volume]) => ({ name, volume: Math.round(volume) }));
  }, [sessions]);

  // PR timeline
  const prTimeline = useMemo(() => {
    const prs: Record<string, { weight: number; reps: number; volume: number; date: string }> = {};
    const prEvents: { date: string; exercise: string; weight: number; reps: number; volume: number }[] = [];

    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.weight <= 0 || set.reps <= 0) return;
          const vol = set.weight * set.reps;
          const key = ex.name.toLowerCase();
          if (!prs[key] || vol > prs[key].volume) {
            if (prs[key]) { // Only add if it beats a previous record
              prEvents.push({
                date: new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                exercise: ex.name,
                weight: set.weight,
                reps: set.reps,
                volume: vol
              });
            }
            prs[key] = { weight: set.weight, reps: set.reps, volume: vol, date: s.date };
          }
        });
      });
    });

    return prEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions]);

  // Stats summary
  const stats = useMemo(() => {
    if (sessions.length === 0) return null;
    const totalTonnage = sessions.reduce((total, s) =>
      total + s.exercises.reduce((t, ex) =>
        t + ex.sets.reduce((v, set) => v + set.weight * set.reps, 0), 0), 0);
    const totalSets = sessions.reduce((total, s) =>
      total + s.exercises.reduce((t, ex) => t + ex.sets.filter(set => set.completed).length, 0), 0);
    const firstDate = new Date(sessions[0].date);
    const lastDate = new Date(sessions[sessions.length - 1].date);
    const daySpan = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    return {
      totalSessions: sessions.length,
      totalTonnage: Math.round(totalTonnage),
      totalSets,
      avgTonnagePerSession: Math.round(totalTonnage / sessions.length),
      avgSetsPerSession: Math.round(totalSets / sessions.length),
      sessionsPerWeek: Math.round((sessions.length / daySpan) * 7 * 10) / 10,
      daySpan,
      firstDate: firstDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastDate: lastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  }, [sessions]);

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    fontSize: '12px'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Loading data...</p>
      </div>
    );
  }

  if (error || sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-3xl font-black text-white uppercase italic">Bodytrainer Analytics</h1>
        <p className="text-slate-400">{error || 'No session data available'}</p>
        <div className="flex flex-col gap-2 w-80">
          <input
            type="password"
            placeholder="GitHub Token"
            value={token}
            onChange={e => { setToken(e.target.value); localStorage.setItem('titan_github_token', e.target.value); }}
            className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none"
          />
          <input
            type="text"
            placeholder="Gist ID"
            value={gistId}
            onChange={e => { setGistId(e.target.value); localStorage.setItem('titan_gist_id', e.target.value); }}
            className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none font-mono"
          />
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-3 rounded-xl font-black uppercase text-sm tracking-wider"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tight">Bodytrainer Analytics</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
              {stats?.firstDate} → {stats?.lastDate} • {stats?.daySpan} days
            </p>
          </div>
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-white uppercase tracking-wider">← Back to App</a>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Sessions', value: stats?.totalSessions },
            { label: 'Total Tonnage', value: `${((stats?.totalTonnage || 0) / 1000).toFixed(1)}t` },
            { label: 'Total Sets', value: stats?.totalSets },
            { label: 'Avg Tonnage', value: `${((stats?.avgTonnagePerSession || 0) / 1000).toFixed(1)}t` },
            { label: 'Avg Sets/Session', value: stats?.avgSetsPerSession },
            { label: 'Sessions/Week', value: stats?.sessionsPerWeek },
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-black text-white mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Volume Over Time */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Session Volume (Tonnage)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}t`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${(value/1000).toFixed(1)}t`, 'Tonnage']} />
                <Area type="monotone" dataKey="tonnage" stroke="#dc2626" fill="#dc2626" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exercise Progression */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Exercise Progression</h2>
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer"
            >
              {exerciseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseProgressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === 'maxWeight' ? `${value} kg` : name === 'totalVolume' ? `${(value/1000).toFixed(1)}t` : value,
                    name === 'maxWeight' ? 'Max Weight' : name === 'totalVolume' ? 'Total Volume' : name
                  ]}
                />
                <Line type="monotone" dataKey="maxWeight" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626', r: 4 }} name="maxWeight" />
                <Line type="monotone" dataKey="totalVolume" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="totalVolume" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Frequency */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Weekly Training Frequency</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyFrequency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 7]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="sessions" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Day Distribution */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Sessions Per Day</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Exercises by Volume */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Top Exercises by Total Volume</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topExercises} layout="vertical" margin={{ left: 160 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}t`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} width={150} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${(value/1000).toFixed(1)}t`, 'Volume']} />
                <Bar dataKey="volume" fill="#dc2626" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Timeline */}
        {prTimeline.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Personal Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {prTimeline.slice(-12).map((pr, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-black text-white uppercase">{pr.exercise}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{pr.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-yellow-500">{pr.weight}kg × {pr.reps}</p>
                    <p className="text-[10px] font-bold text-slate-500">{(pr.volume / 1000).toFixed(1)}t vol</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bodytrainer Analytics Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
