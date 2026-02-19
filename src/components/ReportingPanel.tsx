import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, BarChart3, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onClose: () => void;
}

const PRESETS = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
  { label: 'All time', days: 0 },
];

export default function ReportingPanel({ onClose }: Props) {
  const { playLogs, tracks, generateASCAPReport, user } = useStore();
  const proName = user?.primaryPRO ?? 'PRO';

  const [preset, setPreset] = useState(1); // default: last 90 days
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // ── Date range ────────────────────────────────────────────────────────────
  const { startDate, endDate } = useMemo(() => {
    if (useCustom && customStart && customEnd) {
      return { startDate: new Date(customStart), endDate: new Date(customEnd + 'T23:59:59') };
    }
    const end = new Date();
    const start = new Date();
    const days = PRESETS[preset].days;
    if (days === 0) {
      start.setFullYear(2000);
    } else {
      start.setDate(start.getDate() - days);
    }
    return { startDate: start, endDate: end };
  }, [preset, useCustom, customStart, customEnd]);

  // ── Report data ───────────────────────────────────────────────────────────
  const report = useMemo(() => generateASCAPReport(startDate, endDate), [startDate, endDate, generateASCAPReport]) as ReturnType<typeof generateASCAPReport> & {
    totalPlays: number;
    tracks: Array<{
      trackId: string;
      trackTitle: string;
      composer: string;
      writers: string[];
      totalPlays: number;
      countedPlays: number;
      firstPlayDate: Date;
      lastPlayDate: Date;
    }>;
  };

  // ── Chart: plays per month ────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const logsInRange = playLogs.filter(
      (l) => new Date(l.playTimestamp) >= startDate && new Date(l.playTimestamp) <= endDate
    );
    const byMonth: Record<string, number> = {};
    logsInRange.forEach((l) => {
      const d = new Date(l.playTimestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });

    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    if (sorted.length === 0) return [];
    const max = Math.max(...sorted.map(([, v]) => v), 1);
    return sorted.map(([key, value]) => ({
      label: new Date(key + '-01').toLocaleString('default', { month: 'short' }),
      value,
      pct: Math.round((value / max) * 100),
    }));
  }, [playLogs, startDate, endDate]);

  const countedTotal = report.tracks.reduce((s: number, t: { countedPlays: number }) => s + t.countedPlays, 0);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const header = ['Track Title', 'Composer', 'Writers', 'ISRC', 'Total Plays', 'Counted Plays', 'First Play', 'Last Play'];
    const rows = report.tracks.map((t: {
      trackTitle: string; composer: string; writers: string[];
      trackId: string; totalPlays: number; countedPlays: number;
      firstPlayDate: Date; lastPlayDate: Date;
    }) => {
      const track = tracks.find((tr) => tr.id === t.trackId);
      return [
        `"${t.trackTitle}"`,
        `"${t.composer}"`,
        `"${t.writers.join('; ')}"`,
        `"${track?.isrcCode ?? ''}"`,
        t.totalPlays,
        t.countedPlays,
        `"${fmt(t.firstPlayDate)}"`,
        `"${fmt(t.lastPlayDate)}"`,
      ];
    });

    const meta = [
      [`"${proName} Performance Report"`],
      [`"Generated: ${fmt(new Date())}"`],
      [`"Period: ${fmt(startDate)} – ${fmt(endDate)}"`],
      [`"Platform: OKComputer Personal Radio Station"`],
      [`"Total Plays: ${report.totalPlays}"`],
      [`"Counted Plays (${proName}-qualifying): ${countedTotal}"`],
      [],
      header,
      ...rows,
    ];

    const csv = meta.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proName}_Report_${startDate.toISOString().slice(0, 10)}_to_${endDate.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  // ── Plain-text export (some PROs prefer this) ─────────────────────────────
  const downloadTXT = () => {
    const lines = [
      `${proName} PERFORMANCE REPORT`,
      '========================',
      `Generated:  ${fmt(new Date())}`,
      `Period:     ${fmt(startDate)} – ${fmt(endDate)}`,
      `Platform:   OKComputer Personal Radio Station`,
      `Total Plays: ${report.totalPlays}`,
      `Counted Plays (qualifying): ${countedTotal}`,
      '',
      'TRACK BREAKDOWN',
      '---------------',
      ...report.tracks.map((t: {
        trackTitle: string; composer: string; writers: string[];
        trackId: string; totalPlays: number; countedPlays: number;
        firstPlayDate: Date; lastPlayDate: Date;
      }) => {
        const track = tracks.find((tr) => tr.id === t.trackId);
        return [
          `Title:          ${t.trackTitle}`,
          `Composer:       ${t.composer}`,
          `Writers:        ${t.writers.join(', ') || t.composer}`,
          `ISRC:           ${track?.isrcCode ?? 'N/A'}`,
          `Total Plays:    ${t.totalPlays}`,
          `Counted Plays:  ${t.countedPlays}`,
          `First Play:     ${fmt(t.firstPlayDate)}`,
          `Last Play:      ${fmt(t.lastPlayDate)}`,
          '',
        ].join('\n');
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proName}_Report_${startDate.toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <h2 className="text-[#F2F2F2] text-2xl font-semibold">{proName} Report</h2>
            <p className="text-[#B8B8B8] text-sm mt-1">
              {fmt(startDate)} – {fmt(endDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadTXT}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              title="Download plain text report"
            >
              <FileText size={15} /> TXT
            </button>
            <button
              onClick={downloadCSV}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              {downloaded ? <><CheckCircle size={15} /> Downloaded!</> : <><Download size={15} /> CSV</>}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <X size={20} className="text-[#B8B8B8]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">

          {/* Date Range Selector */}
          <div>
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar size={13} /> Report Period
            </p>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => { setPreset(i); setUseCustom(false); }}
                  className="px-4 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: !useCustom && preset === i ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                    border: !useCustom && preset === i ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: !useCustom && preset === i ? '#C9FF3B' : '#B8B8B8',
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setUseCustom(true)}
                className="px-4 py-2 rounded-xl text-sm transition-all"
                style={{
                  background: useCustom ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                  border: useCustom ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: useCustom ? '#C9FF3B' : '#B8B8B8',
                }}
              >
                Custom
              </button>
            </div>

            {useCustom && (
              <div className="flex gap-3 mt-3">
                {[
                  { label: 'Start', val: customStart, set: setCustomStart },
                  { label: 'End', val: customEnd, set: setCustomEnd },
                ].map(({ label, val, set: setVal }) => (
                  <div key={label} className="flex-1">
                    <label className="block text-[#666] text-xs mb-1">{label}</label>
                    <input
                      type="date"
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-[#F2F2F2] text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Plays', value: report.totalPlays, accent: false },
              { label: 'Counted Plays', value: countedTotal, accent: true, note: '≥30s or ≥50%' },
              { label: 'Tracks Played', value: report.tracks.length, accent: false },
            ].map(({ label, value, accent, note }) => (
              <div
                key={label}
                className="p-4 rounded-2xl text-center"
                style={{
                  background: accent ? 'rgba(201,255,59,0.06)' : 'rgba(255,255,255,0.03)',
                  border: accent ? '1px solid rgba(201,255,59,0.15)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <p className={`text-3xl font-bold mb-1 ${accent ? 'text-[#C9FF3B]' : 'text-[#F2F2F2]'}`}>
                  {value}
                </p>
                <p className="text-[#B8B8B8] text-xs">{label}</p>
                {note && <p className="text-[#666] text-xs mt-0.5">{note}</p>}
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          {chartData.length > 0 && (
            <div>
              <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
                <BarChart3 size={13} /> Plays by Month
              </p>
              <div
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="h-28 flex items-end justify-start gap-3">
                  {chartData.map((d, i) => (
                    <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1 max-w-[48px]">
                      <span className="text-[#666] text-xs">{d.value}</span>
                      <div
                        className="w-full rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max(d.pct, 4)}%`,
                          background: i === chartData.length - 1 ? '#C9FF3B' : 'rgba(255,255,255,0.15)',
                          minHeight: '4px',
                        }}
                      />
                      <span className="text-[#666] text-xs">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Track Breakdown */}
          <div>
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
              <TrendingUp size={13} /> Track Breakdown
            </p>

            {report.tracks.length === 0 ? (
              <div
                className="p-8 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <BarChart3 size={28} className="mx-auto mb-3 text-[#444]" />
                <p className="text-[#F2F2F2] font-medium mb-1">No plays in this period</p>
                <p className="text-[#666] text-sm">Play some tracks and come back to generate a report</p>
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Table header */}
                <div
                  className="grid grid-cols-12 gap-2 px-5 py-3 text-xs uppercase tracking-wide text-[#666]"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="col-span-4">Title</span>
                  <span className="col-span-3">Composer</span>
                  <span className="col-span-2 text-center">Total</span>
                  <span className="col-span-2 text-center">Counted</span>
                  <span className="col-span-1 text-center">ISRC</span>
                </div>

                {report.tracks
                  .sort((a: { countedPlays: number }, b: { countedPlays: number }) => b.countedPlays - a.countedPlays)
                  .map((t: {
                    trackId: string; trackTitle: string; composer: string;
                    totalPlays: number; countedPlays: number; firstPlayDate: Date; lastPlayDate: Date;
                  }, i: number) => {
                    const track = tracks.find((tr) => tr.id === t.trackId);
                    return (
                      <div
                        key={t.trackId}
                        className="grid grid-cols-12 gap-2 px-5 py-3 text-sm items-center"
                        style={{
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <span className="col-span-4 text-[#F2F2F2] truncate font-medium">{t.trackTitle}</span>
                        <span className="col-span-3 text-[#B8B8B8] truncate">{t.composer}</span>
                        <span className="col-span-2 text-center text-[#B8B8B8]">{t.totalPlays}</span>
                        <span className="col-span-2 text-center font-semibold text-[#C9FF3B]">{t.countedPlays}</span>
                        <span className="col-span-1 text-center text-[#444] text-xs">
                          {track?.isrcCode ? '✓' : '—'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ASCAP note */}
          <div
            className="p-4 rounded-2xl text-sm text-[#666] leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-[#C9FF3B] font-medium">About counted plays: </span>
            A play is counted for {proName} purposes when 30 seconds or more of the track was played, or at least 50% of the track's total duration — whichever threshold is met first. Submit the downloaded CSV to your PRO during the reporting period.
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
