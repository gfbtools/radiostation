import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Clock, ListMusic, CalendarDays, Radio, Pencil } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function nextOccurrence(dayIndex: number, time: string): string {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  let diff = dayIndex - now.getDay();
  if (diff < 0 || (diff === 0 && target <= now)) diff += 7;
  target.setDate(target.getDate() + diff);
  if (diff === 0 && target > now) {
    return `Today ${target.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return target.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ShowSchedulerPanel({ onClose }: Props) {
  const { playlists, shows, fetchShows, addShow, deleteShow, addToast } = useStore();

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingShow, setEditingShow] = useState<string | null>(null); // show id being edited
  const [newShow, setNewShow] = useState({
    name: '',
    playlistId: '',
    daysOfWeek: [] as number[],
    startTime: '20:00',
    durationMinutes: 60,
    repeat: true as boolean,
  });

  useEffect(() => { fetchShows(); }, [fetchShows]);

  const openEdit = (show: any) => {
    setNewShow({
      name: show.name,
      playlistId: show.playlistId,
      daysOfWeek: [show.dayOfWeek],
      startTime: show.startTime,
      durationMinutes: show.durationMinutes,
      repeat: show.repeat,
    });
    setEditingShow(show.id);
    setAdding(true);
  };

  const toggleDay = (i: number) => {
    setNewShow((p) => ({
      ...p,
      daysOfWeek: p.daysOfWeek.includes(i)
        ? p.daysOfWeek.filter((d) => d !== i)
        : [...p.daysOfWeek, i].sort(),
    }));
  };

  const handleAdd = async () => {
    if (!newShow.name.trim())            { addToast('Show needs a name', 'error');      return; }
    if (!newShow.playlistId)             { addToast('Select a playlist', 'error');       return; }
    if (newShow.daysOfWeek.length === 0) { addToast('Select at least one day', 'error'); return; }

    setSaving(true);
    // If editing, delete the original show first
    if (editingShow) {
      await deleteShow(editingShow);
      setEditingShow(null);
    }
    for (const day of newShow.daysOfWeek) {
      await addShow({
        name:            newShow.name.trim(),
        playlistId:      newShow.playlistId,
        dayOfWeek:       day,
        startTime:       newShow.startTime,
        durationMinutes: newShow.durationMinutes,
        repeat:          newShow.repeat,
        isActive:        true,
      });
    }
    setSaving(false);
    setAdding(false);
    setNewShow({ name: '', playlistId: '', daysOfWeek: [], startTime: '20:00', durationMinutes: 60, repeat: true });
  };

  const showsByDay = DAYS.map((_, i) => ({
    day: i,
    shows: shows.filter((s) => s.dayOfWeek === i).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((d) => d.shows.length > 0);

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#F2F2F2',
  };

  const content = (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass-card z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[#F2F2F2] text-2xl font-semibold flex items-center gap-3">
              <CalendarDays size={22} className="text-[#C9FF3B]" /> Show Scheduler
            </h2>
            <p className="text-[#B8B8B8] text-sm mt-1">Automatically switch playlists on a schedule</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">

          {adding ? (
            <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(201,255,59,0.04)', border: '1px solid rgba(201,255,59,0.15)' }}>
              <p className="text-[#C9FF3B] text-sm font-semibold">{editingShow ? 'Edit Show' : 'New Show'}</p>

              <input
                type="text"
                placeholder="Show name (e.g. Late Night Vibes)"
                value={newShow.name}
                onChange={(e) => setNewShow((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder-[#444]"
                style={inputStyle}
              />

              <div>
                <p className="text-[#666] text-xs mb-2">Playlist</p>
                <select
                  value={newShow.playlistId}
                  onChange={(e) => setNewShow((p) => ({ ...p, playlistId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                >
                  <option value="">Select a playlist…</option>
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>{pl.name} ({pl.trackIds.length} tracks)</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-[#666] text-xs mb-2">Days — <span className="text-[#B8B8B8]">select all that apply</span></p>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((d, i) => {
                    const active = newShow.daysOfWeek.includes(i);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDay(i)}
                        className="px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: active ? 'rgba(201,255,59,0.2)' : 'rgba(255,255,255,0.05)',
                          border: active ? '1px solid rgba(201,255,59,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          color: active ? '#C9FF3B' : '#B8B8B8',
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {newShow.daysOfWeek.length > 0 && (
                  <p className="text-[#555] text-xs mt-1.5">{newShow.daysOfWeek.map((d) => DAYS_FULL[d]).join(', ')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#666] text-xs mb-2">Start time</p>
                  <input
                    type="time"
                    value={newShow.startTime}
                    onChange={(e) => setNewShow((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <p className="text-[#666] text-xs mb-2">Duration</p>
                  <div className="flex gap-2">
                    {[30, 60, 90, 120].map((m) => (
                      <button
                        key={m}
                        onClick={() => setNewShow((p) => ({ ...p, durationMinutes: m }))}
                        className="flex-1 py-2 rounded-xl text-xs transition-all"
                        style={{
                          background: newShow.durationMinutes === m ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                          border: newShow.durationMinutes === m ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          color: newShow.durationMinutes === m ? '#C9FF3B' : '#B8B8B8',
                        }}
                      >
                        {m < 60 ? `${m}m` : `${m / 60}h`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[#666] text-xs mb-2">Repeat</p>
                <div className="flex gap-2">
                  {[{ v: true, l: 'Weekly' }, { v: false, l: 'One-time' }].map(({ v, l }) => (
                    <button
                      key={l}
                      onClick={() => setNewShow((p) => ({ ...p, repeat: v }))}
                      className="flex-1 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background: newShow.repeat === v ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                        border: newShow.repeat === v ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: newShow.repeat === v ? '#C9FF3B' : '#B8B8B8',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : `Save${newShow.daysOfWeek.length > 1 ? ` (${newShow.daysOfWeek.length} days)` : ''}`}
                </button>
                <button onClick={() => { setAdding(false); setEditingShow(null); }} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm transition-all"
              style={{ background: 'rgba(201,255,59,0.08)', border: '1px dashed rgba(201,255,59,0.3)', color: '#C9FF3B' }}
            >
              <Plus size={16} /> Schedule a Show
            </button>
          )}

          {shows.length === 0 && !adding ? (
            <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Radio size={28} className="mx-auto mb-3 text-[#444]" />
              <p className="text-[#F2F2F2] font-medium mb-1">No shows scheduled</p>
              <p className="text-[#666] text-sm">Add a show to automatically switch playlists on your station</p>
            </div>
          ) : showsByDay.length > 0 && (
            <div className="space-y-4">
              <p className="text-[#B8B8B8] text-xs uppercase tracking-wide flex items-center gap-2">
                <Clock size={13} /> Weekly Schedule
              </p>
              {showsByDay.map(({ day, shows: dayShows }) => (
                <div key={day}>
                  <p className="text-[#C9FF3B] text-xs font-semibold mb-2">{DAYS_FULL[day]}</p>
                  <div className="space-y-2">
                    {dayShows.map((show) => {
                      const playlist = playlists.find((p) => p.id === show.playlistId);
                      return (
                        <div
                          key={show.id}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{ background: 'rgba(201,255,59,0.1)', color: '#C9FF3B' }}
                          >
                            {show.startTime.slice(0, 5)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#F2F2F2] text-sm font-medium truncate">{show.name}</p>
                            <p className="text-[#666] text-xs flex items-center gap-1.5 mt-0.5">
                              <ListMusic size={11} />
                              {playlist?.name ?? 'Unknown playlist'} ·{' '}
                              {show.durationMinutes < 60 ? `${show.durationMinutes}m` : `${show.durationMinutes / 60}h`} ·{' '}
                              {show.repeat ? 'Weekly' : 'One-time'}
                            </p>
                            <p className="text-[#444] text-xs mt-0.5">Next: {nextOccurrence(show.dayOfWeek, show.startTime)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full" style={{ background: show.isActive ? '#C9FF3B' : '#444' }} />
                            <button
                              onClick={() => openEdit(show)}
                              className="p-2 rounded-xl text-[#666] hover:text-[#C9FF3B] hover:bg-white/5 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => deleteShow(show.id)}
                              className="p-2 rounded-xl text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-2xl text-sm text-[#666] leading-relaxed" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[#C9FF3B] font-medium">How it works: </span>
            When a scheduled show time arrives, Studio2Radio automatically switches to the assigned playlist. The show runs for the set duration then returns to your default on-air selection.
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
