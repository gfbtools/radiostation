import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Twitter, Instagram, Github, Youtube } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  product: [
    { label: 'Library',   target: 'library' },
    { label: 'Playlists', target: 'playlists' },
    { label: 'Reports',   target: 'reports' },
    { label: 'Settings',  target: 'settings' },
  ],
  company: [
    { label: 'About',    target: null },
    { label: 'Blog',     target: null },
    { label: 'Careers',  target: null },
  ],
  legal: [
    { label: 'Privacy',  target: null },
    { label: 'Terms',    target: null },
    { label: 'DMCA',     target: null },
  ],
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const { addToast, setLibraryPanelOpen, setPlaylistPanelOpen, setReportsPanelOpen } = useStore();

  function handleProductLink(target: string | null) {
    if (!target) return;
    if (target === 'settings') { setProfileOpen(true); return; }
    scrollToSection(target);
    if (target === 'library') setLibraryPanelOpen(true);
    if (target === 'playlists') setPlaylistPanelOpen(true);
    if (target === 'reports') setReportsPanelOpen(true);
  }

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // CTA animation
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          },
        }
      );

      // Footer animation
      gsap.fromTo(
        footerRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            end: 'top 70%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      addToast('Thanks for signing up! We\'ll be in touch soon.', 'success');
      setEmail('');
    }
  };

  return (
  <>
    <section
      ref={sectionRef}
      className="relative z-80 pt-[10vh]"
      style={{ backgroundColor: '#0B0B0D' }}
    >
      {/* CTA Area */}
      <div ref={ctaRef} className="px-[6vw] pb-[8vh]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left: Text */}
          <div className="max-w-[640px]">
            <h2 className="text-[clamp(28px,3vw,44px)] text-[#F2F2F2] mb-4">
              START YOUR STATION TODAY
            </h2>
            <p className="text-[16px] text-[#B8B8B8] leading-relaxed">
              Free to upload. Free to stream. Upgrade when you need advanced reporting.
            </p>
          </div>

          {/* Right: Form */}
          <form onSubmit={handleSubmit} className="flex gap-3 w-full lg:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourdomain.com"
              className="input-dark flex-1 lg:w-[280px]"
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              Get Early Access
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="px-[6vw] py-[6vh] border-t border-white/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo */}
          <div>
            <span className="text-[#F2F2F2] font-bold text-xl tracking-tight">
              RADIO
            </span>
            <p className="text-[#666] text-sm mt-2">
              Your station. Your sound. Your story.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mono text-[#B8B8B8] mb-4">PRODUCT</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  {link.target ? (
                    <button
                      onClick={() => handleProductLink(link.target)}
                      className="text-[#F2F2F2] text-sm hover:text-[#C9FF3B] transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <span className="text-[#555] text-sm cursor-not-allowed">{link.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mono text-[#B8B8B8] mb-4">COMPANY</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#F2F2F2] text-sm hover:text-[#C9FF3B] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mono text-[#B8B8B8] mb-4">LEGAL</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#F2F2F2] text-sm hover:text-[#C9FF3B] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
          <p className="text-[#666] text-sm">
            © 2026 Personal Radio Station. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#C9FF3B]/10 hover:text-[#C9FF3B] transition-colors"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </section>
    {profileOpen && <ProfileSettingsModal onClose={() => setProfileOpen(false)} />}
  </>
  );
}
