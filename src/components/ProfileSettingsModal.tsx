import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Check, User, Music, Building2, Disc3, Globe, Upload, Image } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { PROName } from '@/types';

interface Props {
  onClose: () => void;
}

const PROS: { id: PROName; label: string; country: string; field: string }[] = [
  { id: 'ASCAP', label: 'ASCAP', country: 'USA', field: 'ascapId' },
  { id: 'BMI',   label: 'BMI',   country: 'USA', field: 'bmiId' },
  { id: 'SESAC', label: 'SESAC', country: 'USA', field: 'sesacId' },
  { id: 'GMR',   label: 'GMR (Global Music Rights)', country: 'USA', field: 'gmrId' },
  { id: 'SOCAN', label: 'SOCAN', country: 'Canada', field: 'socanId' },
  { id: 'PRS',   label: 'PRS for Music', country: 'UK', field: 'prsId' },
];

type Tab = 'profile' | 'pros' | 'publishing' | 'distribution';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile',      label: 'Profile',      icon: User },
  { id: 'pros',         label: 'PRO Accounts', icon: Music },
  { id: 'publishing',   label: 'Publishing',   icon: Building2 },
  { id: 'distribution', label: 'Distribution', icon: Globe },
];

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};

export default function ProfileSettingsModal({ onClose }: Props) {
  const { user, updateProfile, uploadLogo, addToast } = useStore();
  const [tab, setTab]       = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview]     = useState<string>(user?.logoUrl ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:               user?.name ?? '',
    bio:                user?.bio ?? '',
    location:           user?.location ?? '',
    website:            user?.website ?? '',
    instagramUrl:       user?.instagramUrl ?? '',
    twitterUrl:         user?.twitterUrl ?? '',
    soundcloudUrl:      user?.soundcloudUrl ?? '',
    mixcloudUrl:        user?.mixcloudUrl ?? '',
    primaryPRO:         (user?.primaryPRO ?? '') as PROName | '',
    ascapId:            user?.ascapId ?? '',
    bmiId:              user?.bmiId ?? '',
    sesacId:            user?.sesacId ?? '',
    gmrId:              user?.gmrId ?? '',
    socanId:            user?.socanId ?? '',
    prsId:              user?.prsId ?? '',
    soundExchangeId:    user?.soundExchangeId ?? '',
    ipiNumber:          user?.ipiNumber ?? '',
    isniNumber:         user?.isniNumber ?? '',
    publisherName:      user?.publisherName ?? '',
    publisherIpiNumber: user?.publisherIpiNumber ?? '',
    distributorName:    user?.distributorName ?? '',
    labelName:          user?.labelName ?? '',
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Image must be under 5MB', 'error'); return; }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLogoUploading(true);
    const url = await uploadLogo(file);
    setLogoUploading(false);
    if (url) {
      setLogoPreview(url);
      addToast('Logo uploaded!', 'success');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { addToast('Name is required', 'error'); return; }
    setSaving(true);
    await updateProfile({
      name:               form.name.trim(),
      bio:                form.bio.trim(),
      location:           form.location.trim(),
      website:            form.website.trim(),
      instagramUrl:       form.instagramUrl.trim(),
      twitterUrl:         form.twitterUrl.trim(),
      soundcloudUrl:      form.soundcloudUrl.trim(),
      mixcloudUrl:        form.mixcloudUrl.trim(),
      primaryPRO:         form.primaryPRO as PROName | undefined,
      ascapId:            form.ascapId,
      bmiId:              form.bmiId,
      sesacId:            form.sesacId,
      gmrId:              form.gmrId,
      socanId:            form.socanId,
      prsId:              form.prsId,
      soundExchangeId:    form.soundExchangeId,
      ipiNumber:          form.ipiNumber,
      isniNumber:         form.isniNumber,
      publisherName:      form.publisherName,
      publisherIpiNumber: form.publisherIpiNumber,
      distributorName:    form.distributorName,
      labelName:          form.labelName,
    });
    setSaving(false);
    setSaved(true);
    addToast('Profile saved', 'success');
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const Field = ({
    label, value, onChange, placeholder, hint,
  }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; hint?: string;
  }) => (
    <div>
      <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        className="w-full px-4 py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
        onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
      {hint && <p className="text-[#555] text-xs mt-1">{hint}</p>}
    </div>
  );

  const content = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col glass-card z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 flex-shrink-0 border-b border-white/5">
          <div>
            <h2 className="text-[#F2F2F2] text-xl font-semibold">Profile & Rights</h2>
            <p className="text-[#666] text-sm mt-0.5">{user?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-8 pt-4 flex-shrink-0 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap"
              style={{
                background: tab === id ? 'rgba(201,255,59,0.1)' : 'transparent',
                color:      tab === id ? '#C9FF3B' : '#666',
                border:     tab === id ? '1px solid rgba(201,255,59,0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <>
              {/* Logo Upload */}
              <div>
                <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-3">Station Logo</label>
                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Image size={28} className="text-[#444]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={logoUploading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F2F2F2' }}
                    >
                      <Upload size={14} />
                      {logoUploading ? 'Uploading…' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <p className="text-[#555] text-xs mt-2">PNG, JPG · Max 5MB · Shown on your public profile & widget</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-5">
                <Field label="Display Name / Artist Name" value={form.name} onChange={(v) => set('name', v)} placeholder="Your name or group name" />

                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-1.5">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set('bio', e.target.value)}
                    placeholder="Tell listeners about yourself, your music, your vibe…"
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none resize-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                    onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                  <p className="text-[#444] text-xs mt-1 text-right">{form.bio.length}/300</p>
                </div>

                <Field label="Location" value={form.location} onChange={(v) => set('location', v)} placeholder="e.g. New Haven, CT" hint="Shown on your public profile page" />
              </div>

              <div className="border-t border-white/5 pt-4 space-y-4">
                <p className="text-[#B8B8B8] text-xs uppercase tracking-wide">Social Links</p>
                <p className="text-[#555] text-xs -mt-2">These appear as buttons on your public artist profile page.</p>
                <Field label="Website" value={form.website} onChange={(v) => set('website', v)} placeholder="https://yoursite.com" />
                <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => set('instagramUrl', v)} placeholder="https://instagram.com/yourhandle" />
                <Field label="X / Twitter URL" value={form.twitterUrl} onChange={(v) => set('twitterUrl', v)} placeholder="https://x.com/yourhandle" />
                <Field label="SoundCloud URL" value={form.soundcloudUrl} onChange={(v) => set('soundcloudUrl', v)} placeholder="https://soundcloud.com/yourhandle" />
                <Field label="Mixcloud URL" value={form.mixcloudUrl} onChange={(v) => set('mixcloudUrl', v)} placeholder="https://mixcloud.com/yourhandle" />
              </div>

              <div className="border-t border-white/5 pt-4 space-y-5">
                <div>
                  <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-2">Primary PRO</label>
                  <p className="text-[#555] text-xs mb-3">This PRO will appear at the top of all exported reports.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['', ...PROS.map((p) => p.id)] as (PROName | '')[]).map((pro) => (
                      <button
                        key={pro || 'none'}
                        onClick={() => set('primaryPRO', pro)}
                        className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-center"
                        style={{
                          background: form.primaryPRO === pro ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.04)',
                          border:     form.primaryPRO === pro ? '1px solid rgba(201,255,59,0.35)' : '1px solid rgba(255,255,255,0.08)',
                          color:      form.primaryPRO === pro ? '#C9FF3B' : '#B8B8B8',
                        }}
                      >
                        {pro || 'None set'}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="IPI / CAE Number" value={form.ipiNumber} onChange={(v) => set('ipiNumber', v)} placeholder="e.g. 00123456789" hint="Your global composer/publisher identifier used by all PROs" />
                <Field label="ISNI Number" value={form.isniNumber} onChange={(v) => set('isniNumber', v)} placeholder="e.g. 0000 0001 2345 6789" hint="International Standard Name Identifier (optional)" />
              </div>
            </>
          )}

          {/* ── PRO ACCOUNTS ── */}
          {tab === 'pros' && (
            <>
              <div className="p-4 rounded-2xl text-sm" style={{ background: 'rgba(201,255,59,0.04)', border: '1px solid rgba(201,255,59,0.1)' }}>
                <p className="text-[#C9FF3B] font-medium mb-1">Your PRO member IDs</p>
                <p className="text-[#666] text-xs leading-relaxed">Fill in whichever PROs you're registered with. These IDs appear in exported performance reports.</p>
              </div>

              {PROS.map((pro) => (
                <div key={pro.id} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-16 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      background: form[pro.field as keyof typeof form] ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.04)',
                      border:     form[pro.field as keyof typeof form] ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      color:      form[pro.field as keyof typeof form] ? '#C9FF3B' : '#555',
                    }}
                  >
                    {pro.id}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-1.5">
                      {pro.label} <span className="text-[#444] normal-case tracking-normal font-normal">· {pro.country}</span>
                    </label>
                    <input
                      type="text"
                      value={form[pro.field as keyof typeof form]}
                      onChange={(e) => set(pro.field as keyof typeof form, e.target.value)}
                      placeholder={`Your ${pro.id} member ID`}
                      className="w-full px-4 py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                      onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-white/5">
                <p className="text-[#555] text-xs uppercase tracking-wide mb-4">Neighboring Rights & Mechanicals</p>
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-16 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold text-center leading-tight px-1"
                    style={{
                      background: form.soundExchangeId ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.04)',
                      border:     form.soundExchangeId ? '1px solid rgba(201,255,59,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      color:      form.soundExchangeId ? '#C9FF3B' : '#555',
                    }}
                  >SX</div>
                  <div className="flex-1">
                    <label className="block text-[#B8B8B8] text-xs uppercase tracking-wide mb-1.5">
                      SoundExchange <span className="text-[#444] normal-case tracking-normal font-normal">· Digital Performance Royalties</span>
                    </label>
                    <input
                      type="text"
                      value={form.soundExchangeId}
                      onChange={(e) => set('soundExchangeId', e.target.value)}
                      placeholder="Your SoundExchange member ID"
                      className="w-full px-4 py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                      onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PUBLISHING ── */}
          {tab === 'publishing' && (
            <>
              <div className="p-4 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[#F2F2F2] font-medium mb-1">Publishing information</p>
                <p className="text-[#666] text-xs leading-relaxed">If you self-publish, your publisher name is typically your own name or a DBA.</p>
              </div>
              <Field label="Publisher Name" value={form.publisherName} onChange={(v) => set('publisherName', v)} placeholder="e.g. GFB Music Publishing" hint="Your publishing company or self-publishing entity name" />
              <Field label="Publisher IPI Number" value={form.publisherIpiNumber} onChange={(v) => set('publisherIpiNumber', v)} placeholder="e.g. 00987654321" hint="Separate IPI from your composer IPI if you have a publishing entity" />
            </>
          )}

          {/* ── DISTRIBUTION ── */}
          {tab === 'distribution' && (
            <>
              <div className="p-4 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[#F2F2F2] font-medium mb-1">Distribution & label info</p>
                <p className="text-[#666] text-xs leading-relaxed">Used for metadata in reports and track exports.</p>
              </div>
              <Field label="Distributor" value={form.distributorName} onChange={(v) => set('distributorName', v)} placeholder="e.g. DistroKid, TuneCore, CD Baby" />
              <Field label="Record Label" value={form.labelName} onChange={(v) => set('labelName', v)} placeholder="e.g. GFB Records or Independent" hint="Use 'Independent' if you're self-released" />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {form.primaryPRO ? (
              <><Disc3 size={14} className="text-[#C9FF3B]" /><span className="text-[#C9FF3B] text-sm">Primary PRO: <strong>{form.primaryPRO}</strong></span></>
            ) : (
              <span className="text-[#444] text-sm">No primary PRO set</span>
            )}
          </div>
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
