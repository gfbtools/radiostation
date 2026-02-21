import { useState, useRef, useCallback } from 'react';
import { X, Upload, Music, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  onClose: () => void;
}

const GENRES = [
  'Electronic', 'Ambient', 'Synthpop', 'Downtempo', 'Hip-Hop', 'Jazz',
  'Classical', 'Rock', 'Pop', 'R&B', 'Folk', 'Experimental', 'Other',
];
const MOODS = ['Energetic', 'Calm', 'Happy', 'Sad', 'Mysterious', 'Romantic', 'Aggressive', 'Uplifting'];

export default function TrackUploadModal({ onClose }: Props) {
  const { addTrack, addToast } = useStore();

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [duration, setDuration] = useState(0);
  const [_blobUrl, setBlobUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    title: '',
    composer: '',
    genre: '',
    mood: '',
    tempo: '',
    isrcCode: '',
    tags: '',
    writers: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('audio/')) {
      addToast('Please upload an audio file (MP3, WAV, FLAC, etc.)', 'error');
      return;
    }
    setFile(f);
    // Create a blob URL to read metadata and later store as fileUrl
    const url = URL.createObjectURL(f);
    setBlobUrl(url);

    // Use a temporary audio element to read duration
    const tmp = new Audio(url);
    tmp.addEventListener('loadedmetadata', () => {
      setDuration(tmp.duration);
    });

    // Pre-fill title from filename
    const name = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setForm((prev) => ({ ...prev, title: prev.title || name }));
  }, [addToast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!file || !form.title || !form.composer) {
      addToast('Title and composer are required', 'error');
      return;
    }
    setSaving(true);

    // Upload file to Supabase Storage via the store
    await addTrack({
      userId: 'demo',
      title: form.title.trim(),
      composer: form.composer.trim(),
      duration: Math.round(duration),
      fileUrl: '',
      genre: form.genre || undefined,
      mood: form.mood || undefined,
      tempo: form.tempo ? Number(form.tempo) : undefined,
      isrcCode: form.isrcCode.trim() || undefined,
      writers: form.writers ? form.writers.split(',').map((w) => w.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }, file ?? undefined);

    setSaving(false);
    setSaved(true);
    addToast(`"${form.title}" added to your library`, 'success');
    setTimeout(onClose, 1200);
  };

  const formatDur = (s: number) => {
    if (!s) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-8 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[#F2F2F2] text-2xl font-semibold">Upload Track</h2>
            <p className="text-[#B8B8B8] text-sm mt-1">Add a new track to your library</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        {/* Drop Zone */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-8"
            style={{
              borderColor: dragging ? '#C9FF3B' : 'rgba(255,255,255,0.12)',
              background: dragging ? 'rgba(201,255,59,0.05)' : 'rgba(255,255,255,0.02)',
            }}
          >
            <Upload size={40} className="mx-auto mb-4" style={{ color: dragging ? '#C9FF3B' : '#666' }} />
            <p className="text-[#F2F2F2] font-medium mb-1">Drop your audio file here</p>
            <p className="text-[#666] text-sm">or click to browse — MP3, WAV, FLAC, AAC supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-8" style={{ background: 'rgba(201,255,59,0.08)', border: '1px solid rgba(201,255,59,0.2)' }}>
            <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/15 flex items-center justify-center flex-shrink-0">
              <Music size={20} className="text-[#C9FF3B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F2F2F2] font-medium truncate">{file.name}</p>
              <p className="text-[#B8B8B8] text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB · {formatDur(duration)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setBlobUrl(''); setDuration(0); }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} className="text-[#666]" />
            </button>
          </div>
        )}

        {/* Metadata Form */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <Field label="Track Title *" value={form.title} onChange={set('title')} placeholder="e.g. Midnight Protocol" />
            <Field label="Composer *" value={form.composer} onChange={set('composer')} placeholder="e.g. J. Cole" />
          </div>

          <Select label="Genre" value={form.genre} onChange={set('genre')} options={GENRES} />
          <Select label="Mood" value={form.mood} onChange={set('mood')} options={MOODS} />

          <Field label="Tempo (BPM)" value={form.tempo} onChange={set('tempo')} placeholder="e.g. 120" type="number" />
          <Field label="ISRC Code" value={form.isrcCode} onChange={set('isrcCode')} placeholder="e.g. USRC12345678" />

          <div className="col-span-2">
            <Field
              label="Writers (comma-separated)"
              value={form.writers}
              onChange={set('writers')}
              placeholder="e.g. Jane Smith, John Doe"
            />
          </div>
          <div className="col-span-2">
            <Field
              label="Tags (comma-separated)"
              value={form.tags}
              onChange={set('tags')}
              placeholder="e.g. synth, night, driving"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!file || saving || saved}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : saving ? (
              'Saving...'
            ) : (
              <><Upload size={16} /> Add to Library</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: value ? '#F2F2F2' : '#666',
        }}
      >
        <option value="" style={{ background: '#1a1a1a', color: '#666' }}>Select…</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: '#1a1a1a', color: '#F2F2F2' }}>{o}</option>
        ))}
      </select>
    </div>
  );
}
