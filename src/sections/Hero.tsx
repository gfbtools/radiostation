import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Library } from 'lucide-react';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

function goToLibrary() {
  const el = document.getElementById('library');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  const { setLibraryPanelOpen } = useStore();
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef  = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const vinylRef    = useRef<HTMLDivElement>(null);
  const microTagRef = useRef<HTMLSpanElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Entrance animation on load
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      loadTl.fromTo(bgRef.current, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 });
      loadTl.fromTo(microTagRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.6');

      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        loadTl.fromTo(words, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, '-=0.4');
      }

      loadTl.fromTo(subheadRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');
      loadTl.fromTo(vinylRef.current, { x: '18vw', rotate: -25, opacity: 0 }, { x: 0, rotate: 0, opacity: 0.75, duration: 1, ease: 'power3.out' }, '-=0.8');
      loadTl.fromTo(ctaRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.5');
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned flex items-center justify-start z-10"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      <div ref={bgRef} className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'url(/hero_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0 }} />
      <div className="absolute inset-0 gradient-left" />

      <div className="relative z-10 px-[6vw] w-full">
        <span ref={microTagRef} className="mono text-[#B8B8B8] mb-6 block" style={{ marginTop: '-8vh' }}>
          INDEPENDENT MUSIC PLATFORM
        </span>

        <h1 ref={headlineRef} className="text-[clamp(44px,5vw,76px)] text-[#F2F2F2] max-w-[46vw] mb-8">
          <span className="word inline-block">YOUR</span>{' '}
          <span className="word inline-block">STATION</span>
        </h1>

        <p ref={subheadRef} className="text-[18px] text-[#B8B8B8] max-w-[38vw] leading-relaxed mb-10">
          Upload original tracks, build setlists, and stream your catalog—gapless, logged, and ready for ASCAP.
        </p>

        <div ref={ctaRef} className="flex gap-4 flex-wrap">
          <button className="btn-primary flex items-center gap-2" onClick={() => { goToLibrary(); setLibraryPanelOpen(true); }}>
            <Play size={18} /> Start Your Station
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={() => { goToLibrary(); setLibraryPanelOpen(true); }}>
            <Library size={18} /> View Library
          </button>
        </div>
      </div>

      <div ref={vinylRef} className="absolute right-[-10vw] top-[14vh] w-[72vw] max-w-[980px] aspect-square rounded-full opacity-0"
        style={{ border: '2px solid rgba(201,255,59,0.35)', background: `repeating-radial-gradient(circle at center, transparent 0, transparent 18px, rgba(201,255,59,0.08) 18px, rgba(201,255,59,0.08) 20px)` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full" style={{ background: '#0B0B0D', border: '2px solid rgba(201,255,59,0.2)' }} />
      </div>
    </section>
  );
}
