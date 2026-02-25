import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import ReportingPanel from '@/components/ReportingPanel';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

const chartData = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 85 },
  { label: 'Mar', value: 45 },
  { label: 'Apr', value: 95 },
  { label: 'May', value: 70 },
  { label: 'Jun', value: 55 },
];

export default function Reporting() {
  const { reportsPanelOpen, setReportsPanelOpen } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const reportCardRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
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

      // Report card
      scrollTl.fromTo(
        reportCardRef.current,
        { x: '40vw', rotate: 6, opacity: 0 },
        { x: 0, rotate: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Bars staggered
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          scrollTl.fromTo(
            bar,
            { scaleY: 0, opacity: 0 },
            { scaleY: 1, opacity: 1, ease: 'none' },
            0.12 + i * 0.02
          );
        }
      });

      // SETTLE (30-70%): Hold

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
        reportCardRef.current,
        { x: 0, rotate: 0, opacity: 1 },
        { x: '18vw', rotate: -8, opacity: 0, ease: 'power2.in' },
        0.7
      );

      // Bars exit
      barsRef.current.forEach((bar) => {
        if (bar) {
          scrollTl.fromTo(
            bar,
            { scaleY: 1, opacity: 1 },
            { scaleY: 0.6, opacity: 0, ease: 'power2.in' },
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
      id="reports"
      ref={sectionRef}
      className="section-pinned flex items-center z-50"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/report_bg.jpg)',
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
            ASCAP REPORTING
          </h2>
          <p className="text-[16px] text-[#B8B8B8] leading-relaxed mb-8 max-w-[38vw]">
            Every play is logged with timestamp, duration, and percentage played. Generate quarterly exports in seconds—clean data for your PRO.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setReportsPanelOpen(true)}>
            <BarChart3 size={18} />
            View Reports
          </button>
        </div>

        {/* Right: Report Card */}
        <div
          ref={reportCardRef}
          className="w-[40vw] max-w-[480px] glass-card p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="mono text-[#C9FF3B]">QUARTERLY PLAYS</span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <FileText size={16} className="text-[#B8B8B8]" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Download size={16} className="text-[#C9FF3B]" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-[#F2F2F2] text-4xl font-bold">12,847</span>
            <span className="text-[#B8B8B8] text-sm mb-1">plays</span>
          </div>

          <p className="text-[#666] text-sm mb-6">
            Jan 1 – Mar 31 • 47 tracks
          </p>

          {/* Bar Chart */}
          <div className="h-32 flex items-end justify-between gap-3 mb-6">
            {chartData.map((data, index) => (
              <div
                key={data.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  ref={(el) => { barsRef.current[index] = el; }}
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${data.value}%`,
                    background: index === 3 ? '#C9FF3B' : 'rgba(255,255,255,0.15)',
                  }}
                />
                <span className="text-[#666] text-xs">{data.label}</span>
              </div>
            ))}
          </div>

          {/* Trend */}
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-[#C9FF3B]/5 border border-[#C9FF3B]/10">
            <TrendingUp size={16} className="text-[#C9FF3B]" />
            <span className="text-[#C9FF3B] text-sm font-medium">+23%</span>
            <span className="text-[#B8B8B8] text-sm">from last quarter</span>
          </div>

          {/* Download Button */}
          <button className="w-full btn-primary flex items-center justify-center gap-2">
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </div>
    </section>

    {reportsPanelOpen && <ReportingPanel onClose={() => setReportsPanelOpen(false)} />}
    </>
  );
}
