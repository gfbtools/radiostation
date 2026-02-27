import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Radio, ExternalLink, Code2, Smartphone, Globe, Share2, Image, Upload } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props { onClose: () => void; }

const WIDGET_BASE = 'https://radio-station-widget.pages.dev';

export default function MyStationPanel({ onClose }: Props) {
  const { user, uploadLogo, addToast } = useStore();
  const [copiedLink, setCopiedLink]   = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview]     = useState<string>(user?.logoUrl ?? '');
  const [theme, setTheme]                 = useState('dark');
  const [font, setFont]                   = useState('inter');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes = [
    { id: 'dark',     label: 'Dark',     color: '#C9FF3B' },
    { id: 'green',    label: 'Forest',   color: '#00FF87' },
    { id: 'purple',   label: 'Violet',   color: '#A78BFA' },
    { id: 'warm',     label: 'Amber',    color: '#FF9A3C' },
    { id: 'midnight', label: 'Midnight', color: '#5B9BFF' },
  ];


  const fonts = [
    { id: 'inter',    label: 'Inter',     style: 'font-sans' },
    { id: 'mono',     label: 'Mono',      style: 'font-mono' },
    { id: 'serif',    label: 'Serif',     style: 'font-serif' },
    { id: 'orbitron', label: 'Orbitron',  style: '' },
    { id: 'oswald',   label: 'Oswald',    style: '' },
    { id: 'playfair', label: 'Playfair',  style: '' },
  ];
  const stationUrl = theme === 'dark'
    ? `${WIDGET_BASE}/?userId=${user?.id}`
    : `${WIDGET_BASE}/?userId=${user?.id}&theme=${theme}&font=${font}`;
  const stationUrlBase = stationUrl.replace(/&font=[^&]*/, '') + `&font=${font}`;

  const embedCode = `<iframe\n  src="${stationUrl}"\n  width="380"\n  height="520"\n  frameborder="0"\n  allow="autoplay"\n  style="border-radius:16px;"\n></iframe>`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(stationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    addToast('Embed code copied!', 'success');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select an image file', 'error'); return; }

    const compressImage = (f: File): Promise<File> => new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(f);
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob ? new File([blob], 'logo.jpg', { type: 'image/jpeg' }) : f);
        }, 'image/jpeg', 0.85);
      };
      img.src = url;
    });

    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLogoUploading(true);
    const compressed = await compressImage(file);
    const url = await uploadLogo(compressed);
    setLogoUploading(false);
    if (url) { setLogoPreview(url); addToast('Logo updated!', 'success'); }
  };

  const shareLinks = [
    { label: 'Instagram Bio', icon: '📸', hint: 'Paste in your Linktree or bio link', url: stationUrl },
    { label: 'Twitter / X',   icon: '🐦', hint: 'Share your station with followers',  url: `https://twitter.com/intent/tweet?text=Listen+to+my+radio+station&url=${encodeURIComponent(stationUrl)}` },
    { label: 'Facebook',      icon: '👥', hint: 'Post to your page or profile',        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stationUrl)}` },
    { label: 'Linktree',      icon: '🌳', hint: 'Add as a link button',                url: stationUrl },
  ];

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
              <h2 className="text-[#F2F2F2] text-xl font-semibold">My Station</h2>
              <p className="text-[#666] text-xs mt-0.5">Your embeddable public radio player</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* ── Station LIVE banner ── */}
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(201,255,59,0.06)', border: '1px solid rgba(201,255,59,0.15)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-[#C9FF3B] animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[#C9FF3B] text-sm font-semibold">Your station is live</p>
              <p className="text-[#666] text-xs truncate mt-0.5">{stationUrl}</p>
            </div>
            <button
              onClick={() => window.open(stationUrl, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#C9FF3B] hover:bg-[#C9FF3B]/10 transition-colors flex-shrink-0"
            >
              <ExternalLink size={12} /> Open
            </button>
          </div>

          {/* ── Logo + Widget preview ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Image size={14} className="text-[#B8B8B8]" />
                <span className="text-[#B8B8B8] text-xs uppercase tracking-wide">Station Logo</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)' }}
                >
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    : <Image size={36} className="text-[#333]" />
                  }
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs transition-all disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F2F2F2' }}
                >
                  <Upload size={12} />
                  {logoUploading ? 'Uploading…' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                </button>
                <p className="text-[#444] text-[10px] text-center">JPG, PNG · auto-compressed</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Smartphone size={14} className="text-[#B8B8B8]" />
                <span className="text-[#B8B8B8] text-xs uppercase tracking-wide">Live Preview</span>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ height: '220px' }}>
                <iframe
                  src={stationUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay"
                  title="Widget Preview"
                  style={{ borderRadius: '12px', transform: 'scale(0.85)', transformOrigin: 'top left', width: '118%', height: '118%' }}
                />
              </div>
            </div>
          </div>

          {/* ── Theme picker ── */}
          <div className="space-y-3">
            <span className="text-[#B8B8B8] text-xs uppercase tracking-wide">Color Theme</span>
            <div className="flex gap-2 flex-wrap">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
                  style={{
                    background: theme === t.id ? `${t.color}18` : 'rgba(255,255,255,0.03)',
                    border: theme === t.id ? `1px solid ${t.color}55` : '1px solid rgba(255,255,255,0.07)',
                    color: theme === t.id ? t.color : '#B8B8B8',
                  }}
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Share your station link ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Share2 size={14} className="text-[#B8B8B8]" />
              <span className="text-[#B8B8B8] text-xs uppercase tracking-wide">Share Your Station</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Globe size={14} className="text-[#666] flex-shrink-0" />
              <p className="flex-1 text-[#B8B8B8] text-xs truncate font-mono">{stationUrl}</p>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all flex-shrink-0"
                style={{ background: copiedLink ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.08)', color: copiedLink ? '#C9FF3B' : '#F2F2F2' }}
              >
                {copiedLink ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Link</>}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {shareLinks.map(({ label, icon, hint, url }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === 'Instagram Bio' || label === 'Linktree') {
                      navigator.clipboard.writeText(stationUrl);
                      addToast(`Link copied — paste into your ${label}!`, 'success');
                    } else {
                      window.open(url, '_blank');
                    }
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-lg">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-[#F2F2F2] text-xs font-medium">{label}</p>
                    <p className="text-[#555] text-[10px] truncate">{hint}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Embed ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-[#B8B8B8]" />
              <span className="text-[#B8B8B8] text-xs uppercase tracking-wide">Embed On Your Website</span>
            </div>
            <p className="text-[#555] text-xs">Paste this code into any website — Wix, Squarespace, WordPress, or raw HTML.</p>
            <div className="relative">
              <pre
                className="p-4 rounded-xl text-[#B8B8B8] text-xs overflow-x-auto leading-relaxed font-mono"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
              >{embedCode}</pre>
              <button
                onClick={copyEmbed}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{ background: copiedEmbed ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.1)', color: copiedEmbed ? '#C9FF3B' : '#F2F2F2' }}
              >
                {copiedEmbed ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-white/5 flex-shrink-0">
          <p className="text-[#444] text-xs">Powered by Studio2Radio</p>
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
