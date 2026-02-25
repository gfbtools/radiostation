import { useState, useEffect } from 'react';
import { Music, ListMusic, BarChart3, Settings, Menu, X, UserCircle, LogOut, Radio } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import MyStationPanel from '@/components/MyStationPanel';
import OnAirPanel from '@/components/OnAirPanel';

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
  const [onAirOpen, setOnAirOpen]         = useState(false);
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
        <div className="flex items-center justify-between px-4 md:px-[4vw] py-4 min-w-0">
          <a href="#" className="text-[#F2F2F2] font-bold text-lg md:text-xl tracking-tight flex-shrink-0">STUDIO2RADIO</a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, icon: Icon, target }) => (
              <button key={label} onClick={() => scrollToSection(target)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#B8B8B8] hover:text-[#F2F2F2] hover:bg-white/5 transition-all">
                <Icon size={16} /><span className="text-sm">{label}</span>
              </button>
            ))}
            <button onClick={() => setOnAirOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ml-1"
              style={{ background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> On Air
            </button>
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
                    <button onClick={() => { setOnAirOpen(true); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10 transition-colors"
                      style={{ color: '#ff6b6b' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> On Air
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

      {/* Mobile Menu — compact dropdown, fixed below nav */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[78]" onClick={() => setMobileMenu(false)} />
          <div className="fixed top-[60px] left-0 right-0 z-[79] md:hidden"
            style={{ background: 'rgba(11,11,13,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="flex flex-col px-4 py-3 gap-1">
              {navItems.map(({ label, icon: Icon, target }) => (
                <button key={label}
                  onClick={() => { scrollToSection(target); setMobileMenu(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#F2F2F2] text-sm hover:bg-white/5 transition-colors text-left">
                  <Icon size={18} /> {label}
                </button>
              ))}
              <button onClick={() => { setOnAirOpen(true); setMobileMenu(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ color: '#ff6b6b' }}>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> On Air
              </button>
              <button onClick={() => { setStationOpen(true); setMobileMenu(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ color: '#C9FF3B' }}>
                <Radio size={18} /> My Station
              </button>
              <button onClick={() => { setProfileOpen(true); setMobileMenu(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#B8B8B8] text-sm hover:bg-white/5 transition-colors">
                <Settings size={18} /> PRO Accounts
              </button>
              <div className="border-t border-white/5 my-1" />
              <button onClick={() => { logout(); setMobileMenu(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {profileOpen && <ProfileSettingsModal onClose={() => setProfileOpen(false)} />}
      {stationOpen  && <MyStationPanel      onClose={() => setStationOpen(false)} />}
      {onAirOpen    && <OnAirPanel          onClose={() => setOnAirOpen(false)} />}
    </>
  );
}
