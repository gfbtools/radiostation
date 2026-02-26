import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Radio, FolderOpen } from 'lucide-react';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const steps = [
  { num: '1', text: 'Upload your original tracks and build playlists.' },
  { num: '2', text: 'Click On Air to select which tracks play on your station.' },
  { num: '3', text: 'Go to My Station to upload your logo and choose a color scheme.' },
  { num: '4', text: 'Hit Launch to go live — share your station link anywhere.' },
];

export default function Hero() {
  const { setStationPanelOpen, setLibraryPanelOpen } = useStore();
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const stepsRef    = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const microTagRef = useRef<HTMLSpanElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const vinylRef    = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      loadTl.fromTo(bgRef.current, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 });
      loadTl.fromTo(microTagRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.6');
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) loadTl.fromTo(words, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, '-=0.4');
      loadTl.fromTo(stepsRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');
      loadTl.fromTo(vinylRef.current, { x: '18vw', rotate: -25, opacity: 0 }, { x: 0, rotate: 0, opacity: 0.75, duration: 1, ease: 'power3.out' }, '-=0.8');
      loadTl.fromTo(ctaRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.5');
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-pinned flex items-center justify-start z-10" style={{ backgroundColor: '#0B0B0D' }}>
      <div ref={bgRef} className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'url(/hero_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0 }} />
      <div className="absolute inset-0 gradient-left" />

      <div className="relative z-10 px-[6vw] w-full max-w-[54vw]">
        <span ref={microTagRef} className="mono text-[#B8B8B8] mb-4 block" style={{ marginTop: '-8vh' }}>
          INDEPENDENT MUSIC PLATFORM
        </span>

        <h1 ref={headlineRef} className="text-[clamp(36px,4.2vw,68px)] text-[#F2F2F2] mb-6">
          <span className="word inline-block">CREATE</span>{' '}
          <span className="word inline-block">YOUR</span>{' '}
          <span className="word inline-block">STATION</span>
        </h1>

        {/* Steps */}
        <div ref={stepsRef} className="mb-8 space-y-2.5">
          {steps.map(({ num, text }) => (
            <div key={num} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(201,255,59,0.15)', color: '#C9FF3B', border: '1px solid rgba(201,255,59,0.3)' }}>
                {num}
              </span>
              <p className="text-[14px] text-[#B8B8B8] leading-snug">{text}</p>
            </div>
          ))}
        </div>

        <div ref={ctaRef} className="flex gap-3 flex-wrap">
          <button className="btn-primary flex items-center gap-2" onClick={() => setStationPanelOpen(true)}>
            <Radio size={16} /> Start Your Station
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={() => { scrollTo('library'); setLibraryPanelOpen(true); }}>
            <FolderOpen size={16} /> Create Your Library
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
