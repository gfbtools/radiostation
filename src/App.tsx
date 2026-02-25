import { useEffect } from 'react';
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

function App() {
  const { isAuthenticated, isLoadingAuth, initAuth } = useStore();

  // Boot: check if user is already logged in
  useEffect(() => {
    initAuth();
  }, []);



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
      <main className="relative pb-[110px] md:pb-[80px]">
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
