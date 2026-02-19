import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Upload, 
  FileText, 
  GripVertical, 
  Play, 
  BarChart3, 
  Download 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Upload,
    title: 'Multi-format Upload',
    description: 'WAV, MP3, FLAC, AAC + artwork. Bulk import with CSV metadata.',
  },
  {
    icon: FileText,
    title: 'Smart Metadata',
    description: 'ISRC, composer credits, tags, custom fields. Full searchability.',
  },
  {
    icon: GripVertical,
    title: 'Drag-and-Drop Setlists',
    description: 'Reorder tracks in seconds. Save unlimited playlists.',
  },
  {
    icon: Play,
    title: 'Gapless Playback',
    description: 'Continuous audio with background playback support.',
  },
  {
    icon: BarChart3,
    title: 'Play Logging',
    description: 'ASCAP-compliant counts. 30s or 50% rule applied automatically.',
  },
  {
    icon: Download,
    title: 'Export Reports',
    description: 'CSV + PDF by quarter or custom date range. Ready for your PRO.',
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );

      // Cards animation
      cardsRef.current.forEach((card) => {
        if (card) {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 60%',
                scrub: true,
              },
            }
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-60 py-[10vh] px-[6vw]"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      {/* Heading */}
      <div ref={headingRef} className="max-w-[520px] mb-12">
        <h2 className="text-[clamp(28px,3vw,44px)] text-[#F2F2F2] mb-4">
          EVERYTHING YOU NEED TO RUN YOUR STATION
        </h2>
        <p className="text-[16px] text-[#B8B8B8] leading-relaxed">
          Upload, organize, sequence, stream, and report—without leaving the app.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="glass-card p-6 glass-card-hover transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-[#C9FF3B]" />
                </div>
                <div>
                  <h3 className="text-[#F2F2F2] font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#B8B8B8] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
