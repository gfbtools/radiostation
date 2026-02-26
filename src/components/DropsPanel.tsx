import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Trash2, Play, Pause, Mic, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onClose: () => void;
}

export default function DropsPanel({ onClose }: Props) {
  const { drops, fetchDrops, addDrop, deleteDrop, updateDropConfig, dropConfig, addToast } = useStore();
  const [uploading, setUploading] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDrops();
  }, [fetchDrops]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { addToast('Please select an audio file', 'error'); return; }
    if (file.size > 20 * 1024 * 1024) { addToast('Drop must be under 20MB', 'error'); return; }

    const title = titleInput.trim() || file.name.replace(/\.[^.]+$/, '');
    setUploading(true);
    await addDrop(file, title);
    setTitleInput('');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePlay = (drop: { id: string; fileUrl: string }) => {
    if (playingId === drop.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(drop.fileUrl);
    audioRef.current = audio;
    audio.play();
    setPlayingId(drop.id);
    audio.onended = () => setPlayingId(null);
  };

  const handleDelete = async (id: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    await deleteDrop(id);
  };

  const formatDur = (s: number) => s ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '--:--';

  const content = (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass-card z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[#F2F2F2] text-2xl font-semibold flex items-center gap-3">
              <Mic size={22} className="text-[#C9FF3B]" /> DJ Drops
            </h2>
            <p className="text-[#B8B8B8] text-sm mt-1">Short clips injected between tracks on your station</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">

          {/* Upload */}
          <div
            className="p-5 rounded-2xl space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide">Upload Drop</p>
            <input
              type="text"
              placeholder="Drop name (optional)"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none placeholder-[#444]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-5"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Uploading…</>
              ) : (
                <><Upload size={15} /> Choose Audio File</>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
            <p className="text-[#444] text-xs">MP3, WAV, OGG · Max 20MB per drop</p>
          </div>

          {/* Injection config */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide flex items-center gap-2">
              <Info size={13} /> Injection Settings
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#F2F2F2] text-sm">Enable drops on station</p>
                  <p className="text-[#666] text-xs mt-0.5">Drops will play between tracks automatically</p>
                </div>
                <button
                  onClick={() => updateDropConfig({ enabled: !dropConfig.enabled })}
                  className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                  style={{ background: dropConfig.enabled ? 'rgba(201,255,59,0.3)' : 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full transition-all"
                    style={{
                      left: dropConfig.enabled ? '1.75rem' : '0.25rem',
                      background: dropConfig.enabled ? '#C9FF3B' : '#666',
                    }}
                  />
                </button>
              </div>

              <div>
                <p className="text-[#B8B8B8] text-xs mb-2">Play a drop every</p>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateDropConfig({ interval: n })}
                      className="flex-1 py-2 rounded-xl text-sm transition-all"
                      style={{
                        background: dropConfig.interval === n ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                        border: dropConfig.interval === n ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: dropConfig.interval === n ? '#C9FF3B' : '#B8B8B8',
                      }}
                    >
                      {n} tracks
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#B8B8B8] text-xs mb-2">Order</p>
                <div className="flex gap-2">
                  {[
                    { id: 'sequential', label: 'Sequential' },
                    { id: 'random',     label: 'Random' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => updateDropConfig({ order: id as 'sequential' | 'random' })}
                      className="flex-1 py-2 rounded-xl text-sm transition-all"
                      style={{
                        background: dropConfig.order === id ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.05)',
                        border: dropConfig.order === id ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: dropConfig.order === id ? '#C9FF3B' : '#B8B8B8',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Drops list */}
          <div>
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3">
              Your Drops ({drops.length})
            </p>
            {drops.length === 0 ? (
              <div
                className="p-8 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Mic size={28} className="mx-auto mb-3 text-[#444]" />
                <p className="text-[#F2F2F2] font-medium mb-1">No drops yet</p>
                <p className="text-[#666] text-sm">Upload a short audio clip above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {drops.map((drop) => (
                  <div
                    key={drop.id}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <button
                      onClick={() => handlePlay(drop)}
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                      style={{ background: playingId === drop.id ? 'rgba(201,255,59,0.2)' : 'rgba(255,255,255,0.1)' }}
                    >
                      {playingId === drop.id
                        ? <Pause size={15} className="text-[#C9FF3B]" />
                        : <Play  size={15} className="text-[#B8B8B8] ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F2F2F2] text-sm font-medium truncate">{drop.title}</p>
                      <p className="text-[#666] text-xs">{formatDur(drop.duration)} · {new Date(drop.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(drop.id)}
                      className="p-2 rounded-xl text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
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
