import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';

import { useStore } from '@/store/useStore';

import { useStore } from '@/store/useStore';
import OnAirPanel from '@/components/OnAirPanel';
import { useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Playback() {
  const { setStationPanelOpen } = useStore();
  const [onAirOpen, setOnAirOpen] = useState(false);
  const sectionRef    = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLDivElement>(null);
  const nowPlayingRef = useRef<HTMLDivElement>(null);
  const bgRef         = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section, start: 'top 80%', once: true };
      gsap.fromTo(bgRef.current, { scale: 1.06, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: st });
      gsap.fromTo(headlineRef.current, { x: '-40px', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: st });
      gsap.fromTo(nowPlayingRef.current, { x: '40px', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out', scrollTrigger: st });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="onair" className="section-pinned flex items-center z-40" style={{ backgroundColor: '#0B0B0D' }}>
      <div ref={bgRef} className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'url(/playback_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.65 }} />
      <div className="absolute inset-0 gradient-left" />
      <div className="relative z-10 w-full px-[6vw] flex justify-between items-center">
        <div ref={headlineRef} className="max-w-[44vw]">
          <h2 className="text-[clamp(34px,3.6vw,56px)] text-[#F2F2F2] mb-6">ON AIR</h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Select which tracks and playlists broadcast on your station. Go live instantly — your listeners only hear what you put on air.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setOnAirOpen(true)}><Play size={18} /> Open On Air</button>
          <div className="flex gap-4 mt-3">
            <button
              className="flex items-center gap-1 text-sm"
              style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => document.getElementById('playlists')?.scrollIntoView({ behavior: 'smooth' })}
            >
              ← Playlists
            </button>
            <button
              className="flex items-center gap-1 text-sm"
              style={{ color: '#C9FF3B', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setStationPanelOpen(true)}
            >
              Next: My Station →
            </button>
          </div>
          {onAirOpen && <OnAirPanel onClose={() => setOnAirOpen(false)} />}
        </div>
        <div ref={nowPlayingRef} className="w-[40vw] max-w-[480px] glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="mono text-[#C9FF3B]">NOW PLAYING</span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><Shuffle size={16} className="text-[#B8B8B8]" /></button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><Repeat size={16} className="text-[#C9FF3B]" /></button>
            </div>
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 rounded-full relative" style={{ background: `conic-gradient(from 0deg,#1a1a1a 0deg,#2a2a2a 30deg,#1a1a1a 60deg,#2a2a2a 90deg,#1a1a1a 120deg,#2a2a2a 150deg,#1a1a1a 180deg,#2a2a2a 210deg,#1a1a1a 240deg,#2a2a2a 270deg,#1a1a1a 300deg,#2a2a2a 330deg,#1a1a1a 360deg)`, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div className="absolute inset-2 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
              <div className="absolute inset-6 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
              <div className="absolute inset-10 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9FF3B 0%, #8FBF00 100%)' }}>
                <div className="w-4 h-4 rounded-full bg-[#0B0B0D]" />
              </div>
            </div>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-[#F2F2F2] text-xl font-semibold mb-1">Midnight Protocol</h3>
            <p className="text-[#B8B8B8] text-sm">Written by J. Cole / A. Lane</p>
          </div>
          <div className="mb-6">
            <div className="progress-bar mb-2"><div className="progress-bar-fill" style={{ width: '38%' }} /></div>
            <div className="flex justify-between text-xs text-[#666]"><span>1:24</span><span>3:42</span></div>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><SkipBack size={22} className="text-[#F2F2F2]" /></button>
            <button className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#C9FF3B' }}><Pause size={24} className="text-[#0B0B0D]" /></button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><SkipForward size={22} className="text-[#F2F2F2]" /></button>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Volume2 size={16} className="text-[#B8B8B8]" />
            <div className="volume-slider"><div className="volume-slider-fill" style={{ width: '80%' }} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
