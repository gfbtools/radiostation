import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BarChart3, TrendingUp, Clock, Music, Calendar, Headphones, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onClose: () => void;
}

const PRESETS = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 0 },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export default function AnalyticsPanel({ onClose }: Props) {
  const { playLogs, tracks } = useStore();
  const [preset, setPreset] = useState(1); // default 30 days

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const days = PRESETS[preset].days;
    if (days === 0) start.setFullYear(2000);
    else start.setDate(start.getDate() - days);
    return { startDate: start, endDate: end };
  }, [preset]);

  const logsInRange = useMemo(
    () => playLogs.filter((l) => {
      const ts = new Date(l.playTimestamp);
      return ts >= startDate && ts <= endDate;
    }),
    [playLogs, startDate, endDate]
  );

  // ── Core stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalPlays = logsInRange.length;
    const countedPlays = logsInRange.filter((l) => l.counted).length;
    const totalListenSecs = logsInRange.reduce((s, l) => s + (l.durationPlayed || 0), 0);
    const avgSession = totalPlays > 0 ? totalListenSecs / totalPlays : 0;
    const uniqueTracks = new Set(logsInRange.map((l) => l.trackId)).size;
    const completionRate = totalPlays > 0
      ? Math.round(logsInRange.reduce((s, l) => s + (l.percentagePlayed || 0), 0) / totalPlays)
      : 0;
    return { totalPlays, countedPlays, totalListenSecs, avgSession, uniqueTracks, completionRate };
  }, [logsInRange]);

  // ── Plays by day (last N days) ────────────────────────────────────────────
  const dailyChart = useMemo(() => {
    const days = PRESETS[preset].days || 90;
    const buckets: Record<string, number> = {};
    for (let i = 0; i < Math.min(days, 90); i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    logsInRange.forEach((l) => {
      const key = new Date(l.playTimestamp).toISOString().slice(0, 10);
      if (key in buckets) buckets[key]++;
    });
    const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
    const max = Math.max(...sorted.map(([, v]) => v), 1);
    return sorted.map(([date, value]) => ({
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
      pct: Math.round((value / max) * 100),
    }));
  }, [logsInRange, preset]);

  // ── Plays by hour of day ──────────────────────────────────────────────────
  const hourlyChart = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    logsInRange.forEach((l) => {
      const h = new Date(l.playTimestamp).getHours();
      hours[h].count++;
    });
    const max = Math.max(...hours.map((h) => h.count), 1);
    return hours.map((h) => ({
      label: h.hour === 0 ? '12a' : h.hour < 12 ? `${h.hour}a` : h.hour === 12 ? '12p' : `${h.hour - 12}p`,
      value: h.count,
      pct: Math.round((h.count / max) * 100),
      isPeak: h.count === Math.max(...hours.map((x) => x.count)) && h.count > 0,
    }));
  }, [logsInRange]);

  // ── Top tracks ────────────────────────────────────────────────────────────
  const topTracks = useMemo(() => {
    const map = new Map<string, { plays: number; totalSecs: number; counted: number }>();
    logsInRange.forEach((l) => {
      const entry = map.get(l.trackId) ?? { plays: 0, totalSecs: 0, counted: 0 };
      entry.plays++;
      entry.totalSecs += l.durationPlayed || 0;
      if (l.counted) entry.counted++;
      map.set(l.trackId, entry);
    });
    return Array.from(map.entries())
      .map(([trackId, data]) => {
        const track = tracks.find((t) => t.id === trackId);
        return { trackId, title: track?.title ?? 'Unknown', composer: track?.composer ?? '', ...data };
      })
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);
  }, [logsInRange, tracks]);

  // ── Peak day ─────────────────────────────────────────────────────────────
  const peakDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    logsInRange.forEach((l) => {
      const key = new Date(l.playTimestamp).toLocaleDateString('en-US', { weekday: 'short' });
      byDay[key] = (byDay[key] || 0) + 1;
    });
    const sorted = Object.entries(byDay).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] ?? '—';
  }, [logsInRange]);

  const maxDailyBars = dailyChart.slice(-30);

  const content = (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col glass-card z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[#F2F2F2] text-2xl font-semibold">Listener Analytics</h2>
            <p className="text-[#B8B8B8] text-sm mt-1">How your station is performing</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">

          {/* Preset selector */}
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setPreset(i)}
                className="px-4 py-2 rounded-xl text-sm transition-all"
                style={{
                  background: preset === i ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                  border: preset === i ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: preset === i ? '#C9FF3B' : '#B8B8B8',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Total Plays',      value: stats.totalPlays,                             icon: Headphones, accent: false },
              { label: 'Counted Plays',    value: stats.countedPlays,                           icon: Star,       accent: true  },
              { label: 'Listen Time',      value: formatDuration(stats.totalListenSecs),        icon: Clock,      accent: false },
              { label: 'Avg Session',      value: formatDuration(stats.avgSession),             icon: TrendingUp, accent: false },
              { label: 'Tracks Played',    value: stats.uniqueTracks,                           icon: Music,      accent: false },
              { label: 'Completion Rate',  value: `${stats.completionRate}%`,                   icon: BarChart3,  accent: false },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div
                key={label}
                className="p-4 rounded-2xl"
                style={{
                  background: accent ? 'rgba(201,255,59,0.06)' : 'rgba(255,255,255,0.03)',
                  border: accent ? '1px solid rgba(201,255,59,0.15)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className={accent ? 'text-[#C9FF3B]' : 'text-[#666]'} />
                  <p className="text-[#666] text-xs">{label}</p>
                </div>
                <p className={`text-2xl font-bold ${accent ? 'text-[#C9FF3B]' : 'text-[#F2F2F2]'}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Daily plays bar chart */}
          {maxDailyBars.length > 0 && (
            <div>
              <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar size={13} /> Plays by Day
                {peakDay !== '—' && (
                  <span className="text-[#666] normal-case tracking-normal ml-2">
                    Peak day: <span className="text-[#C9FF3B]">{peakDay}</span>
                  </span>
                )}
              </p>
              <div
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="h-24 flex items-end gap-1">
                  {maxDailyBars.map((d, i) => (
                    <div key={d.label} className="flex flex-col items-center flex-1 min-w-0 gap-0.5">
                      <div
                        className="w-full rounded-t-sm transition-all"
                        title={`${d.label}: ${d.value} plays`}
                        style={{
                          height: `${Math.max(d.pct, 3)}%`,
                          background: i === maxDailyBars.length - 1 ? '#C9FF3B' : 'rgba(255,255,255,0.15)',
                          minHeight: '3px',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[#444] text-xs">{maxDailyBars[0]?.label}</span>
                  <span className="text-[#444] text-xs">{maxDailyBars[maxDailyBars.length - 1]?.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hourly heatmap */}
          {logsInRange.length > 0 && (
            <div>
              <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock size={13} /> Active Hours
              </p>
              <div
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-end gap-0.5 h-16">
                  {hourlyChart.map((h) => (
                    <div
                      key={h.label}
                      className="flex-1 flex flex-col items-center gap-0.5"
                    >
                      <div
                        className="w-full rounded-sm transition-all"
                        title={`${h.label}: ${h.value} plays`}
                        style={{
                          height: `${Math.max(h.pct, 3)}%`,
                          background: h.isPeak ? '#C9FF3B' : h.pct > 50 ? 'rgba(201,255,59,0.4)' : h.pct > 20 ? 'rgba(201,255,59,0.2)' : 'rgba(255,255,255,0.1)',
                          minHeight: '3px',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[#444] text-xs">12am</span>
                  <span className="text-[#444] text-xs">6am</span>
                  <span className="text-[#444] text-xs">12pm</span>
                  <span className="text-[#444] text-xs">6pm</span>
                  <span className="text-[#444] text-xs">11pm</span>
                </div>
              </div>
            </div>
          )}

          {/* Top tracks */}
          <div>
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp size={13} /> Top Tracks
            </p>
            {topTracks.length === 0 ? (
              <div
                className="p-8 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <BarChart3 size={28} className="mx-auto mb-3 text-[#444]" />
                <p className="text-[#F2F2F2] font-medium mb-1">No plays in this period</p>
                <p className="text-[#666] text-sm">Play some tracks and check back</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div
                  className="grid grid-cols-12 gap-2 px-5 py-3 text-xs uppercase tracking-wide text-[#666]"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Track</span>
                  <span className="col-span-2 text-center">Plays</span>
                  <span className="col-span-2 text-center">Counted</span>
                  <span className="col-span-2 text-right">Listen Time</span>
                </div>
                {topTracks.map((t, i) => (
                  <div
                    key={t.trackId}
                    className="grid grid-cols-12 gap-2 px-5 py-3 text-sm items-center"
                    style={{
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span className="col-span-1 text-[#444] text-xs">{i + 1}</span>
                    <div className="col-span-5 min-w-0">
                      <p className="text-[#F2F2F2] truncate font-medium">{t.title}</p>
                      <p className="text-[#666] text-xs truncate">{t.composer}</p>
                    </div>
                    <span className="col-span-2 text-center text-[#B8B8B8]">{t.plays}</span>
                    <span className="col-span-2 text-center text-[#C9FF3B] font-semibold">{t.counted}</span>
                    <span className="col-span-2 text-right text-[#666] text-xs">{formatDuration(t.totalSecs)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
