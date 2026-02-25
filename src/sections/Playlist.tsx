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
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const playlistCardRef = useRef<HTMLDivElement>(null);
  const trackRowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0-30%)
      // Background
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.08, opacity: 0.65 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      );

      // Headline block
      scrollTl.fromTo(
        headlineRef.current,
        { x: '-28vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Playlist card
      scrollTl.fromTo(
        playlistCardRef.current,
        { x: '40vw', rotate: 6, opacity: 0 },
        { x: 0, rotate: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Track rows staggered
      trackRowsRef.current.forEach((row, i) => {
        if (row) {
          scrollTl.fromTo(
            row,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none' },
            0.1 + i * 0.02
          );
        }
      });

      // SETTLE (30-70%): Hold

      // EXIT (70-100%)
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.06, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-14vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        playlistCardRef.current,
        { x: 0, rotate: 0, opacity: 1 },
        { x: '18vw', rotate: -8, opacity: 0, ease: 'power2.in' },
        0.7
      );

      // Track rows exit
      trackRowsRef.current.forEach((row) => {
        if (row) {
          scrollTl.fromTo(
            row,
            { y: 0, opacity: 1 },
            { y: 10, opacity: 0, ease: 'power2.in' },
            0.72
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
    <section
      id="playlists"
      ref={sectionRef}
      className="section-pinned flex items-center z-30"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/playlist_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.65,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-left" />

      {/* Content */}
      <div className="relative z-10 w-full px-[6vw] flex justify-between items-center">
        {/* Left: Headline Block */}
        <div ref={headlineRef} className="max-w-[44vw]">
          <h2 className="text-[clamp(34px,3.6vw,56px)] text-[#F2F2F2] mb-6">
            BUILD PLAYLISTS
          </h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Sequence your setlist. Reorder with drag-and-drop. Save multiple lists for different moods, shows, or release campaigns.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setPlaylistPanelOpen(true)}>
            <ListMusic size={18} />
            Create a Setlist
          </button>
        </div>

        {/* Right: Playlist Card */}
        <div
          ref={playlistCardRef}
          className="w-[40vw] max-w-[520px] glass-card overflow-hidden"
          style={{ maxHeight: '64vh' }}
        >
          {/* Playlist Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[#C9FF3B]">PLAYLIST</span>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Play size={18} className="text-[#C9FF3B]" />
              </button>
            </div>
            <h3 className="text-[#F2F2F2] text-xl font-semibold">Late Night Drive</h3>
            <p className="text-[#B8B8B8] text-sm mt-1">
              Perfect for cruising through the city at night
            </p>
            <div className="flex gap-3 mt-3">
              <span className="tag-pill">{playlistTracks.length} tracks</span>
              <span className="tag-pill">
                <Clock size={10} className="mr-1" />
                19:22
              </span>
            </div>
          </div>

          {/* Track List */}
          <div className="p-4 space-y-1">
            {playlistTracks.map((track, index) => (
              <div
                key={track.title}
                ref={(el) => { trackRowsRef.current[index] = el; }}
                className="track-item group"
              >
                <GripVertical
                  size={14}
                  className="text-[#666] mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                />
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
