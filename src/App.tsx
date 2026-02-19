import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navigation from '@/components/Navigation';
import PlayerBar from '@/components/PlayerBar';
import ToastContainer from '@/components/ToastContainer';
import AuthModal from '@/components/AuthModal';

import Hero from '@/sections/Hero';
import Library from '@/sections/Library';
import PlaylistSection from '@/sections/Playlist';
import Playback from '@/sections/Playback';
import Reporting from '@/sections/Reporting';
import Features from '@/sections/Features';
import Testimonials from '@/sections/Testimonials';
import Footer from '@/sections/Footer';

import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLElement>(null);
  const { isAuthenticated, isLoadingAuth, initAuth } = useStore();

  // Boot: check if user is already logged in
  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.08 && value <= r.end + 0.08
            );
            if (!inPinned) return value;
            return pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isAuthenticated]);

  // Loading splash
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0B0B0D' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-[#C9FF3B]/40" />
          </div>
          <p className="text-[#444] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Not logged in — show auth
  if (!isAuthenticated) {
    return (
      <>
        <AuthModal />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#0B0B0D' }}>
      <div className="grain-overlay" />
      <Navigation />
      <main ref={mainRef} className="relative">
        <Hero />
        <Library />
        <PlaylistSection />
        <Playback />
        <Reporting />
        <Features />
        <Testimonials />
        <Footer />
      </main>
      <PlayerBar />
      <ToastContainer />
    </div>
  );
}

export default App;
