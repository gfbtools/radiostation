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
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardStackRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
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
          pin: window.innerWidth > 768,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0-30%)
      // Background
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.08, y: '8vh', opacity: 0.6 },
        { scale: 1, y: 0, opacity: 1, ease: 'none' },
        0
      );

      // Headline block
      scrollTl.fromTo(
        headlineRef.current,
        { x: '-28vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Card stack container
      scrollTl.fromTo(
        cardStackRef.current,
        { x: '35vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Individual cards
      scrollTl.fromTo(
        card3Ref.current,
        { y: '6vh', rotate: 4, scale: 0.96 },
        { y: 0, rotate: 2, scale: 0.98, ease: 'none' },
        0.05
      );

      scrollTl.fromTo(
        card2Ref.current,
        { y: '3vh', rotate: -2, scale: 0.98 },
        { y: 0, rotate: -1, scale: 0.99, ease: 'none' },
        0.08
      );

      scrollTl.fromTo(
        card1Ref.current,
        { y: '10vh', rotate: -6, scale: 0.94 },
        { y: 0, rotate: 0, scale: 1, ease: 'none' },
        0.1
      );

      // SETTLE (30-70%): Hold positions

      // EXIT (70-100%)
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, y: 0 },
        { scale: 1.05, y: '-6vh', ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-14vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        cardStackRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      // Cards fan out on exit
      scrollTl.fromTo(
        card1Ref.current,
        { rotate: 0 },
        { rotate: -8, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo(
        card3Ref.current,
        { rotate: 2 },
        { rotate: 10, ease: 'power2.in' },
        0.72
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
    <section
      id="library"
      ref={sectionRef}
      className="section-pinned flex items-center z-20"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/library_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-left" />

      {/* Content */}
      <div className="relative z-10 w-full px-[6vw] flex justify-between items-center">
        {/* Left: Headline Block */}
        <div ref={headlineRef} className="max-w-[44vw]">
          <h2 className="text-[clamp(34px,3.6vw,56px)] text-[#F2F2F2] mb-6">
            UPLOAD & ORGANIZE
          </h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Drag in WAV, MP3, or FLAC. Add ISRC, composer credits, tags, and artwork. Your library stays searchable—genre, mood, tempo, or custom fields.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setLibraryPanelOpen(true)}>
            <FolderOpen size={18} />
            Open Library
          </button>
        </div>

        {/* Right: Card Stack */}
        <div
          ref={cardStackRef}
          className="relative w-[42vw] h-[68vh] max-w-[600px]"
        >
          {/* Card 3 (back) */}
          <div
            ref={card3Ref}
            className="absolute top-4 right-4 w-full h-full glass-card p-6"
            style={{ transform: 'rotate(2deg) scale(0.98)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center">
                <Music size={20} className="text-[#C9FF3B]" />
              </div>
              <div>
                <h4 className="text-[#F2F2F2] font-semibold">{sampleCards[2].title}</h4>
                <p className="text-[#B8B8B8] text-sm">{sampleCards[2].genre}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="tag-pill flex items-center gap-1">
                <Clock size={10} />
                {sampleCards[2].tempo} BPM
              </span>
            </div>
          </div>

          {/* Card 2 (middle) */}
          <div
            ref={card2Ref}
            className="absolute top-2 right-2 w-full h-full glass-card p-6"
            style={{ transform: 'rotate(-1deg) scale(0.99)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center">
                <Music size={20} className="text-[#C9FF3B]" />
              </div>
              <div>
                <h4 className="text-[#F2F2F2] font-semibold">{sampleCards[1].title}</h4>
                <p className="text-[#B8B8B8] text-sm">{sampleCards[1].genre}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="tag-pill flex items-center gap-1">
                <Clock size={10} />
                {sampleCards[1].tempo} BPM
              </span>
            </div>
          </div>

          {/* Card 1 (front) */}
          <div
            ref={card1Ref}
            className="absolute top-0 right-0 w-full h-full glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="mono text-[#C9FF3B]">LIBRARY PREVIEW</span>
              <Tag size={16} className="text-[#B8B8B8]" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9FF3B]/20 to-[#C9FF3B]/5 flex items-center justify-center">
                <Music size={28} className="text-[#C9FF3B]" />
              </div>
              <div>
                <h4 className="text-[#F2F2F2] font-semibold text-lg">{sampleCards[0].title}</h4>
                <p className="text-[#B8B8B8]">{sampleCards[0].genre}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="tag-pill accent flex items-center gap-1">
                <Clock size={10} />
                {sampleCards[0].tempo} BPM
              </span>
              <span className="tag-pill">Electronic</span>
              <span className="tag-pill">Night</span>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-[#B8B8B8]">Tracks</span>
                <span className="text-[#F2F2F2] font-semibold">47</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#B8B8B8]">Total Duration</span>
                <span className="text-[#F2F2F2] font-semibold">3h 24m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {libraryPanelOpen && <LibraryPanel onClose={() => setLibraryPanelOpen(false)} />}
    </>
  );
}
