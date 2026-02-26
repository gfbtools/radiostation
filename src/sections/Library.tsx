import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderOpen, Music, Clock, Tag } from 'lucide-react';
import LibraryPanel from '@/components/LibraryPanel';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

const sampleCards = [
  { title: 'Midnight Protocol', genre: 'Electronic', tempo: 118 },
  { title: 'Paper Trails', genre: 'Ambient', tempo: 84 },
  { title: 'Neon Hymnal', genre: 'Synthpop', tempo: 128 },
];

export default function Library() {
  const { libraryPanelOpen, setLibraryPanelOpen } = useStore();
  const sectionRef   = useRef<HTMLElement>(null);
  const headlineRef  = useRef<HTMLDivElement>(null);
  const cardStackRef = useRef<HTMLDivElement>(null);
  const bgRef        = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section, start: 'top 80%', once: true };
      gsap.fromTo(bgRef.current, { scale: 1.06, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: st });
      gsap.fromTo(headlineRef.current, { x: '-40px', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: st });
      gsap.fromTo(cardStackRef.current, { x: '40px', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out', scrollTrigger: st });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <>
    <section id="library" ref={sectionRef} className="section-pinned flex items-center z-20" style={{ backgroundColor: '#0B0B0D' }}>
      <div ref={bgRef} className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'url(/library_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6 }} />
      <div className="absolute inset-0 gradient-left" />
      <div className="relative z-10 w-full px-[6vw] flex justify-between items-center">
        <div ref={headlineRef} className="max-w-[44vw]">
          <h2 className="text-[clamp(34px,3.6vw,56px)] text-[#F2F2F2] mb-6">UPLOAD & ORGANIZE</h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Drag in WAV, MP3, or FLAC. Add ISRC, composer credits, tags, and artwork. Your library stays searchable—genre, mood, tempo, or custom fields.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setLibraryPanelOpen(true)}>
            <FolderOpen size={18} /> Open Library
          </button>
          <button
            className="flex items-center gap-2 text-sm mt-3"
            style={{ color: '#C9FF3B', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => document.getElementById('playlists')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Next: Playlists →
          </button>
        </div>
        <div ref={cardStackRef} className="relative w-[42vw] h-[68vh] max-w-[600px]">
          <div className="absolute top-4 right-4 w-full h-full glass-card p-6" style={{ transform: 'rotate(2deg) scale(0.98)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center"><Music size={20} className="text-[#C9FF3B]" /></div>
              <div><h4 className="text-[#F2F2F2] font-semibold">{sampleCards[2].title}</h4><p className="text-[#B8B8B8] text-sm">{sampleCards[2].genre}</p></div>
            </div>
            <div className="flex gap-2"><span className="tag-pill flex items-center gap-1"><Clock size={10} />{sampleCards[2].tempo} BPM</span></div>
          </div>
          <div className="absolute top-2 right-2 w-full h-full glass-card p-6" style={{ transform: 'rotate(-1deg) scale(0.99)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center"><Music size={20} className="text-[#C9FF3B]" /></div>
              <div><h4 className="text-[#F2F2F2] font-semibold">{sampleCards[1].title}</h4><p className="text-[#B8B8B8] text-sm">{sampleCards[1].genre}</p></div>
            </div>
            <div className="flex gap-2"><span className="tag-pill flex items-center gap-1"><Clock size={10} />{sampleCards[1].tempo} BPM</span></div>
          </div>
          <div className="absolute top-0 right-0 w-full h-full glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="mono text-[#C9FF3B]">LIBRARY PREVIEW</span>
              <Tag size={16} className="text-[#B8B8B8]" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9FF3B]/20 to-[#C9FF3B]/5 flex items-center justify-center"><Music size={28} className="text-[#C9FF3B]" /></div>
              <div><h4 className="text-[#F2F2F2] font-semibold text-lg">{sampleCards[0].title}</h4><p className="text-[#B8B8B8]">{sampleCards[0].genre}</p></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="tag-pill accent flex items-center gap-1"><Clock size={10} />{sampleCards[0].tempo} BPM</span>
              <span className="tag-pill">Electronic</span>
              <span className="tag-pill">Night</span>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between text-sm"><span className="text-[#B8B8B8]">Tracks</span><span className="text-[#F2F2F2] font-semibold">47</span></div>
              <div className="flex justify-between text-sm mt-2"><span className="text-[#B8B8B8]">Total Duration</span><span className="text-[#F2F2F2] font-semibold">3h 24m</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {libraryPanelOpen && <LibraryPanel onClose={() => setLibraryPanelOpen(false)} />}
    </>
  );
}
