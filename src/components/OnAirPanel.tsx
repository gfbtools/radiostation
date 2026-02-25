import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Radio, Music, ListMusic, Check, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onClose: () => void;
}

export default function OnAirPanel({ onClose }: Props) {
  const { tracks, playlists, onAirTrackIds, onAirPlaylistIds, onAirMode, setOnAir, addToast } = useStore();

  const [mode, setMode] = useState<'all' | 'selected'>(onAirMode);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set(onAirTrackIds));
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set(onAirPlaylistIds));
  const [tracksExpanded, setTracksExpanded] = useState(true);
  const [playlistsExpanded, setPlaylistsExpanded] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleTrack = (id: string) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePlaylist = (id: string) => {
    setSelectedPlaylists((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllTracks = () => setSelectedTracks(new Set(tracks.map((t) => t.id)));
  const clearAllTracks = () => setSelectedTracks(new Set());
  const selectAllPlaylists = () => setSelectedPlaylists(new Set(playlists.map((p) => p.id)));
  const clearAllPlaylists = () => setSelectedPlaylists(new Set());

  const handleSave = async () => {
    setSaving(true);
    await setOnAir(
      mode === 'all' ? [] : [...selectedTracks],
      mode === 'all' ? [] : [...selectedPlaylists],
      mode
    );
    setSaving(false);
    addToast('On-air lineup saved!', 'success');
    onClose();
  };

  const onAirCount = mode === 'all'
    ? tracks.length
    : selectedTracks.size + selectedPlaylists.reduce((acc, _) => acc, 0);

  const formatDur = (s: number) => {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const content = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col glass-card z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,255,59,0.15)' }}>
              <Radio size={18} className="text-[#C9FF3B]" />
            </div>
            <div>
              <h2 className="text-[#F2F2F2] text-xl font-semibold">On-Air Lineup</h2>
              <p className="text-[#666] text-xs mt-0.5">Choose what plays on your radio station</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('all')}
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
              style={{
                background: mode === 'all' ? 'rgba(201,255,59,0.08)' : 'rgba(255,255,255,0.03)',
                border: mode === 'all' ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: mode === 'all' ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)' }}>
                <Wifi size={15} className={mode === 'all' ? 'text-[#C9FF3B]' : 'text-[#666]'} />
              </div>
              <div>
                <p className={`text-sm font-medium ${mode === 'all' ? 'text-[#C9FF3B]' : 'text-[#B8B8B8]'}`}>Broadcast All</p>
                <p className="text-[#555] text-xs">Every track in your library</p>
              </div>
            </button>

            <button
              onClick={() => setMode('selected')}
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
              style={{
                background: mode === 'selected' ? 'rgba(201,255,59,0.08)' : 'rgba(255,255,255,0.03)',
                border: mode === 'selected' ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: mode === 'selected' ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)' }}>
                <WifiOff size={15} className={mode === 'selected' ? 'text-[#C9FF3B]' : 'text-[#666]'} />
              </div>
              <div>
                <p className={`text-sm font-medium ${mode === 'selected' ? 'text-[#C9FF3B]' : 'text-[#B8B8B8]'}`}>Custom Selection</p>
                <p className="text-[#555] text-xs">Pick specific tracks & playlists</p>
              </div>
            </button>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-2 h-2 rounded-full bg-[#C9FF3B] animate-pulse flex-shrink-0" />
            {mode === 'all' ? (
              <p className="text-[#B8B8B8] text-sm">
                Broadcasting <span className="text-[#F2F2F2] font-medium">{tracks.length} tracks</span> from your full library
              </p>
            ) : (
              <p className="text-[#B8B8B8] text-sm">
                <span className="text-[#F2F2F2] font-medium">{selectedTracks.size} track{selectedTracks.size !== 1 ? 's' : ''}</span>
                {selectedPlaylists.size > 0 && <> + <span className="text-[#F2F2F2] font-medium">{selectedPlaylists.size} playlist{selectedPlaylists.size !== 1 ? 's' : ''}</span></>}
                {' '}selected for broadcast
              </p>
            )}
          </div>

          {mode === 'selected' && (
            <>
              {/* Tracks section */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setTracksExpanded(!tracksExpanded)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-3">
                    <Music size={15} className="text-[#B8B8B8]" />
                    <span className="text-[#F2F2F2] text-sm font-medium">Tracks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,255,59,0.12)', color: '#C9FF3B' }}>
                      {selectedTracks.size} / {tracks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); selectedTracks.size === tracks.length ? clearAllTracks() : selectAllTracks(); }}
                      className="text-xs px-3 py-1 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: '#B8B8B8' }}
                    >
                      {selectedTracks.size === tracks.length ? 'Clear all' : 'Select all'}
                    </button>
                    {tracksExpanded ? <ChevronUp size={16} className="text-[#666]" /> : <ChevronDown size={16} className="text-[#666]" />}
                  </div>
                </button>

                {tracksExpanded && (
                  <div className="max-h-64 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    {tracks.length === 0 ? (
                      <div className="px-5 py-8 text-center text-[#555] text-sm">No tracks in library yet</div>
                    ) : (
                      tracks.map((track) => {
                        const active = selectedTracks.has(track.id);
                        return (
                          <button
                            key={track.id}
                            onClick={() => toggleTrack(track.id)}
                            className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-white/5"
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                              style={{
                                background: active ? '#C9FF3B' : 'transparent',
                                border: active ? '1px solid #C9FF3B' : '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              {active && <Check size={11} className="text-[#0B0B0D]" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate" style={{ color: active ? '#F2F2F2' : '#888' }}>{track.title}</p>
                              <p className="text-xs text-[#555] truncate">{track.composer}</p>
                            </div>
                            {track.genre && (
                              <span className="text-xs text-[#555] hidden sm:block">{track.genre}</span>
                            )}
                            <span className="text-xs text-[#444] flex-shrink-0">{formatDur(track.duration)}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Playlists section */}
              {playlists.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <button
                    onClick={() => setPlaylistsExpanded(!playlistsExpanded)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-3">
                      <ListMusic size={15} className="text-[#B8B8B8]" />
                      <span className="text-[#F2F2F2] text-sm font-medium">Playlists</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,255,59,0.12)', color: '#C9FF3B' }}>
                        {selectedPlaylists.size} / {playlists.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); selectedPlaylists.size === playlists.length ? clearAllPlaylists() : selectAllPlaylists(); }}
                        className="text-xs px-3 py-1 rounded-lg transition-colors hover:bg-white/10"
                        style={{ color: '#B8B8B8' }}
                      >
                        {selectedPlaylists.size === playlists.length ? 'Clear all' : 'Select all'}
                      </button>
                      {playlistsExpanded ? <ChevronUp size={16} className="text-[#666]" /> : <ChevronDown size={16} className="text-[#666]" />}
                    </div>
                  </button>

                  {playlistsExpanded && (
                    <div className="max-h-48 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      {playlists.map((playlist) => {
                        const active = selectedPlaylists.has(playlist.id);
                        return (
                          <button
                            key={playlist.id}
                            onClick={() => togglePlaylist(playlist.id)}
                            className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-white/5"
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                              style={{
                                background: active ? '#C9FF3B' : 'transparent',
                                border: active ? '1px solid #C9FF3B' : '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              {active && <Check size={11} className="text-[#0B0B0D]" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate" style={{ color: active ? '#F2F2F2' : '#888' }}>{playlist.name}</p>
                              <p className="text-xs text-[#555]">{playlist.tracks.length} track{playlist.tracks.length !== 1 ? 's' : ''}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || (mode === 'selected' && selectedTracks.size === 0 && selectedPlaylists.size === 0)}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Radio size={15} />
            {saving ? 'Saving…' : 'Go Live'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
