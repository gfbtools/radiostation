import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Check, UserCircle, Copy, ExternalLink, Globe, Instagram, Twitter, Music2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props { onClose: () => void; }

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};

export default function ArtistProfilePanel({ onClose }: Props) {
  const { user, updateProfile, addToast } = useStore();

  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [copied, setCopied]   = useState(false);

  const [form, setForm] = useState({
    bio:          user?.bio          ?? '',
    location:     user?.location     ?? '',
    website:      user?.website      ?? '',
    instagramUrl: user?.instagramUrl ?? '',
    twitterUrl:   user?.twitterUrl   ?? '',
    soundcloudUrl:user?.soundcloudUrl ?? '',
    mixcloudUrl:  user?.mixcloudUrl  ?? '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const profileUrl = `${window.location.origin}/artist.html?userId=${user?.id}`;

  const profileComplete = !!(form.bio.trim() || form.location.trim());

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name:          user?.name ?? '',
      bio:           form.bio.trim(),
      location:      form.location.trim(),
      website:       form.website.trim(),
      instagramUrl:  form.instagramUrl.trim(),
      twitterUrl:    form.twitterUrl.trim(),
      soundcloudUrl: form.soundcloudUrl.trim(),
      mixcloudUrl:   form.mixcloudUrl.trim(),
    });
    setSaving(false);
    setSaved(true);
    addToast('Profile saved', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    addToast('Profile link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const Field = ({
    label, value, onChange, placeholder, hint, icon,
  }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; hint?: string; icon?: React.ReactNode;
  }) => (
    <div>
      <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">{icon}</span>
        )}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? ''}
          className={`w-full py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all ${icon ? 'pl-9 pr-4' : 'px-4'}`}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
      </div>
      {hint && <p className="text-[#444] text-xs mt-1">{hint}</p>}
    </div>
  );

  const content = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col glass-card z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,255,59,0.12)' }}>
              <UserCircle size={18} className="text-[#C9FF3B]" />
            </div>
            <div>
              <h2 className="text-[#F2F2F2] text-xl font-semibold">Artist Profile</h2>
              <p className="text-[#666] text-xs mt-0.5">Your public page — share it anywhere</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* Bio */}
          <div>
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Tell listeners about yourself, your music, your sound…"
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none resize-none transition-all"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <p className="text-[#444] text-xs mt-1 text-right">{form.bio.length}/300</p>
          </div>

          <Field
            label="Location"
            value={form.location}
            onChange={v => set('location', v)}
            placeholder="e.g. New Haven, CT"
          />

          {/* Divider */}
          <div className="border-t border-white/5 pt-1">
            <p className="text-[#555] text-xs uppercase tracking-wide mb-4">Social Links</p>
            <div className="space-y-4">
              <Field label="Website" value={form.website} onChange={v => set('website', v)}
                placeholder="https://yoursite.com" icon={<Globe size={14} />} />
              <Field label="Instagram" value={form.instagramUrl} onChange={v => set('instagramUrl', v)}
                placeholder="https://instagram.com/handle" icon={<Instagram size={14} />} />
              <Field label="X / Twitter" value={form.twitterUrl} onChange={v => set('twitterUrl', v)}
                placeholder="https://x.com/handle" icon={<Twitter size={14} />} />
              <Field label="SoundCloud" value={form.soundcloudUrl} onChange={v => set('soundcloudUrl', v)}
                placeholder="https://soundcloud.com/handle" icon={<Music2 size={14} />} />
              <Field label="Mixcloud" value={form.mixcloudUrl} onChange={v => set('mixcloudUrl', v)}
                placeholder="https://mixcloud.com/handle" icon={<Music2 size={14} />} />
            </div>
          </div>

          {/* Your profile link — shown after form, prominent */}
          <div className="border-t border-white/5 pt-5">
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3">Your Profile Link</p>
            {!profileComplete && (
              <p className="text-[#555] text-xs mb-3">Add a bio or location above to complete your profile, then share this link.</p>
            )}
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: profileComplete ? 'rgba(201,255,59,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${profileComplete ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.06)'}` }}
            >
              <p className="flex-1 text-[#666] text-xs font-mono truncate">{profileUrl}</p>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0"
                style={{
                  background: copied ? 'rgba(201,255,59,0.15)' : 'rgba(201,255,59,0.1)',
                  color: '#C9FF3B',
                  border: '1px solid rgba(201,255,59,0.2)',
                }}
              >
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
              <button
                onClick={() => window.open(profileUrl, '_blank')}
                className="p-2 rounded-xl transition-all hover:bg-white/5 flex-shrink-0"
                style={{ color: '#666' }}
                title="Preview profile page"
              >
                <ExternalLink size={15} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 flex-shrink-0">
          <p className="text-[#444] text-xs">Your logo is set in My Station</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-5 disabled:opacity-70"
            >
              {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving…' : <><Save size={15} /> Save Profile</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
