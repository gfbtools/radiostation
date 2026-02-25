import { useState, useEffect } from 'react';
import { Music, ListMusic, BarChart3, Settings, Menu, X, UserCircle, LogOut, Radio } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import MyStationPanel from '@/components/MyStationPanel';

const navItems = [
  { label: 'Library',   icon: Music,     target: 'library' },
  { label: 'Playlists', icon: ListMusic, target: 'playlists' },
  { label: 'Reports',   icon: BarChart3, target: 'reports' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Navigation() {
  const { user, logout } = useStore();
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setMobileMenu] = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [stationOpen, setStationOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${
        isScrolled ? 'bg-[#0B0B0D]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-[4vw] py-4">
          <a href="#" className="text-[#F2F2F2] font-bold text-xl tracking-tight">RADIO</a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, icon: Icon, target }) => (
              <button key={label} onClick={() => scrollToSection(target)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#B8B8B8] hover:text-[#F2F2F2] hover:bg-white/5 transition-all">
                <Icon size={16} /><span className="text-sm">{label}</span>
              </button>
            ))}
            <button onClick={() => setStationOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-1"
              style={{ background: 'rgba(201,255,59,0.12)', color: '#C9FF3B', border: '1px solid rgba(201,255,59,0.2)' }}>
              <Radio size={15} /> My Station
            </button>
          </div>

          <button className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setMobileMenu(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} className="text-[#F2F2F2]" /> : <Menu size={24} className="text-[#F2F2F2]" />}
          </button>

          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-2 relative">
            <button onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#B8B8B8] hover:text-[#F2F2F2] hover:bg-white/5 transition-all">
              <Settings size={15} /><span className="text-sm">PRO Accounts</span>
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(201,255,59,0.2)', color: '#C9FF3B' }}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <span className="text-[#B8B8B8] text-sm hidden lg:block">{user?.name}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[95]" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-[96] py-1"
                    style={{ background: '#1A1A1D', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={() => { setProfileOpen(true); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#B8B8B8] hover:text-[#F2F2F2] hover:bg-white/5 transition-colors">
                      <UserCircle size={15} /> Profile & Rights
                    </button>
                    <button onClick={() => { setStationOpen(true); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C9FF3B] hover:bg-[#C9FF3B]/5 transition-colors">
                      <Radio size={15} /> My Station
                    </button>
                    <div className="border-t border-white/5 my-1" />
                    <button onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[80] bg-[#0B0B0D]/98 backdrop-blur-xl transition-all duration-300 md:hidden ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {navItems.map(({ label, icon: Icon, target }) => (
            <button key={label} onClick={() => { scrollToSection(target); setMobileMenu(false); }}
              className="flex items-center gap-3 text-[#F2F2F2] text-2xl">
              <Icon size={24} /> {label}
            </button>
          ))}
          <button onClick={() => { setStationOpen(true); setMobileMenu(false); }}
            className="flex items-center gap-3 text-2xl font-bold" style={{ color: '#C9FF3B' }}>
            <Radio size={24} /> My Station
          </button>
          <button className="flex items-center gap-3 text-[#F2F2F2] text-2xl"
            onClick={() => { setProfileOpen(true); setMobileMenu(false); }}>
            <Settings size={24} /> PRO Accounts
          </button>
          <button className="flex items-center gap-3 text-red-400 text-2xl"
            onClick={() => { logout(); setMobileMenu(false); }}>
            <LogOut size={24} /> Sign Out
          </button>
        </div>
      </div>

      {profileOpen && <ProfileSettingsModal onClose={() => setProfileOpen(false)} />}
      {stationOpen  && <MyStationPanel      onClose={() => setStationOpen(false)} />}
    </>
  );
}
