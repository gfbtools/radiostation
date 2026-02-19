import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const smallQuotes = [
  {
    text: "Gapless playback is chef's kiss.",
    author: 'Leo K.',
  },
  {
    text: "Cleanest upload flow I've used.",
    author: 'Sam R.',
  },
  {
    text: 'ASCAP exports in one click.',
    author: 'Priya D.',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const mainQuoteRef = useRef<HTMLDivElement>(null);
  const smallCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Portrait animation
      gsap.fromTo(
        portraitRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: portraitRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );

      // Main quote animation
      gsap.fromTo(
        mainQuoteRef.current,
        { x: '4vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: mainQuoteRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );

      // Small cards animation
      smallCardsRef.current.forEach((card) => {
        if (card) {
          gsap.fromTo(
            card,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 70%',
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
      className="relative z-70 py-[12vh] px-[6vw]"
      style={{ backgroundColor: '#6B6B6B' }}
    >
      {/* Main Testimonial */}
      <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
        {/* Portrait */}
        <div
          ref={portraitRef}
          className="w-full lg:w-[40%] max-w-[400px]"
        >
          <div className="aspect-[3/4] rounded-[28px] overflow-hidden">
            <img
              src="/testimonial_portrait.jpg"
              alt="Maya Ortega"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Quote */}
        <div ref={mainQuoteRef} className="flex-1">
          <Quote size={48} className="text-[#C9FF3B] mb-6" />
          <blockquote className="text-[clamp(20px,2.5vw,32px)] text-[#F2F2F2] leading-relaxed mb-8">
            "I finally have a playlist workflow that feels like a real station—and the reports actually save me time during PRO season."
          </blockquote>
          <cite className="not-italic">
            <span className="text-[#F2F2F2] font-semibold block">Maya Ortega</span>
            <span className="text-[#B8B8B8] text-sm">Composer / Producer</span>
          </cite>
        </div>
      </div>

      {/* Small Quote Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {smallQuotes.map((quote, index) => (
          <div
            key={quote.author}
            ref={(el) => { smallCardsRef.current[index] = el; }}
            className="glass-card p-6"
            style={{ background: 'rgba(11,11,13,0.4)' }}
          >
            <Quote size={24} className="text-[#C9FF3B] mb-4" />
            <p className="text-[#F2F2F2] mb-4">"{quote.text}"</p>
            <span className="text-[#B8B8B8] text-sm">— {quote.author}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
