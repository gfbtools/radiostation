import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ListMusic, GripVertical, Play, Clock } from 'lucide-react';
import PlaylistPanel from '@/components/PlaylistPanel';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

const playlistTracks = [
  { title: 'Midnight Protocol', duration: '3:42' },
  { title: 'Paper Trails', duration: '4:06' },
  { title: 'Neon Hymnal', duration: '3:55' },
  { title: 'Static Bloom', duration: '3:18' },
  { title: 'Low Frequency Love', duration: '4:21' },
];

export default function PlaylistSection() {
  const { playlistPanelOpen, setPlaylistPanelOpen } = useStore();
  const sectionRef      = useRef<HTMLElement>(null);
  const headlineRef     = useRef<HTMLDivElement>(null);
  const playlistCardRef = useRef<HTMLDivElement>(null);
  const bgRef           = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const st = { trigger: section, start: 'top 80%', once: true };
      gsap.fromTo(bgRef.current, { scale: 1.06, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: st });
      gsap.fromTo(headlineRef.current, { x: '-40px', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: st });
      gsap.fromTo(playlistCardRef.current, { x: '40px', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out', scrollTrigger: st });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <>
    <section id="playlists" ref={sectionRef} className="section-pinned flex items-center z-30" style={{ backgroundColor: '#0B0B0D' }}>
      <div ref={bgRef} className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'url(/playlist_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.65 }} />
      <div className="absolute inset-0 gradient-left" />
      <div className="relative z-10 w-full px-[6vw] flex justify-between items-center">
        <div ref={headlineRef} className="max-w-[44vw]">
          <h2 className="text-[clamp(34px,3.6vw,56px)] text-[#F2F2F2] mb-6">BUILD PLAYLISTS</h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Sequence your setlist. Reorder with drag-and-drop. Save multiple lists for different moods, shows, or release campaigns.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setPlaylistPanelOpen(true)}>
            <ListMusic size={18} /> Create a Setlist
          </button>
        </div>
        <div ref={playlistCardRef} className="w-[40vw] max-w-[520px] glass-card overflow-hidden" style={{ maxHeight: '64vh' }}>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[#C9FF3B]">PLAYLIST</span>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><Play size={18} className="text-[#C9FF3B]" /></button>
            </div>
            <h3 className="text-[#F2F2F2] text-xl font-semibold">Late Night Drive</h3>
            <p className="text-[#B8B8B8] text-sm mt-1">Perfect for cruising through the city at night</p>
            <div className="flex gap-3 mt-3">
              <span className="tag-pill">{playlistTracks.length} tracks</span>
              <span className="tag-pill"><Clock size={10} className="mr-1" />19:22</span>
            </div>
          </div>
          <div className="p-4 space-y-1">
            {playlistTracks.map((track, index) => (
              <div key={track.title} className="track-item group">
                <GripVertical size={14} className="text-[#666] mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                <span className="text-[#666] w-6 text-sm">{index + 1}</span>
                <span className="flex-1 text-[#F2F2F2] text-sm truncate">{track.title}</span>
                <span className="text-[#B8B8B8] text-sm">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    {playlistPanelOpen && <PlaylistPanel onClose={() => setPlaylistPanelOpen(false)} />}
    </>
  );
}
