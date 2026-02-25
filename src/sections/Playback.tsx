import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Playback() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const nowPlayingRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
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

      // Now Playing card
      scrollTl.fromTo(
        nowPlayingRef.current,
        { x: '40vw', rotate: -6, opacity: 0 },
        { x: 0, rotate: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Disc
      scrollTl.fromTo(
        discRef.current,
        { scale: 0.85, rotate: -30, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, ease: 'none' },
        0.1
      );

      // SETTLE (30-70%): Slow disc rotation during settle
      scrollTl.to(
        discRef.current,
        { rotate: 120, ease: 'none', duration: 0.4 },
        0.3
      );

      // EXIT (70-100%)
      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, y: 0 },
        { scale: 1.06, y: '-6vh', ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-14vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        nowPlayingRef.current,
        { x: 0, rotate: 0, opacity: 1 },
        { x: '18vw', rotate: 8, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        discRef.current,
        { scale: 1, opacity: 1 },
        { scale: 0.92, opacity: 0, ease: 'power2.in' },
        0.72
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned flex items-center z-40"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/playback_bg.jpg)',
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
            CONTINUOUS PLAYBACK
          </h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Gapless transitions. Background playback. Loop a single track, the whole list, or let it stop when the set ends—you're in control.
          </p>
          <button className="btn-primary flex items-center gap-2">
            <Play size={18} />
            Start Listening
          </button>
        </div>

        {/* Right: Now Playing Card */}
        <div
          ref={nowPlayingRef}
          className="w-[40vw] max-w-[480px] glass-card p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="mono text-[#C9FF3B]">NOW PLAYING</span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Shuffle size={16} className="text-[#B8B8B8]" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Repeat size={16} className="text-[#C9FF3B]" />
              </button>
            </div>
          </div>

          {/* Vinyl Disc */}
          <div className="flex justify-center mb-8">
            <div
              ref={discRef}
              className="w-48 h-48 rounded-full relative"
              style={{
                background: `
                  conic-gradient(
                    from 0deg,
                    #1a1a1a 0deg,
                    #2a2a2a 30deg,
                    #1a1a1a 60deg,
                    #2a2a2a 90deg,
                    #1a1a1a 120deg,
                    #2a2a2a 150deg,
                    #1a1a1a 180deg,
                    #2a2a2a 210deg,
                    #1a1a1a 240deg,
                    #2a2a2a 270deg,
                    #1a1a1a 300deg,
                    #2a2a2a 330deg,
                    #1a1a1a 360deg
                  )
                `,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Groove rings */}
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              />
              <div
                className="absolute inset-6 rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              />
              <div
                className="absolute inset-10 rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              />
              {/* Label */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #C9FF3B 0%, #8FBF00 100%)',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-[#0B0B0D]" />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-6">
            <h3 className="text-[#F2F2F2] text-xl font-semibold mb-1">
              Midnight Protocol
            </h3>
            <p className="text-[#B8B8B8] text-sm">
              Written by J. Cole / A. Lane
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="progress-bar mb-2">
              <div className="progress-bar-fill" style={{ width: '38%' }} />
            </div>
            <div className="flex justify-between text-xs text-[#666]">
              <span>1:24</span>
              <span>3:42</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <SkipBack size={22} className="text-[#F2F2F2]" />
            </button>
            <button
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#C9FF3B' }}
            >
              <Pause size={24} className="text-[#0B0B0D]" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <SkipForward size={22} className="text-[#F2F2F2]" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mt-6">
            <Volume2 size={16} className="text-[#B8B8B8]" />
            <div className="volume-slider">
              <div className="volume-slider-fill" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
