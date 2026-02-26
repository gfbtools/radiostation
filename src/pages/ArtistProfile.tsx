import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Radio, Music, MapPin, Globe, Instagram, ExternalLink,
  Play, Clock, Loader2, AlertCircle, Twitter
} from 'lucide-react';

// ── Supabase ──────────────────────────────────────────────────────────────
const supabase = createClient(
  'https://ckilxbljczwiiwdkipir.supabase.co',
  'sb_publishable_ArnQr-ig6qwBBsI4Ghe63A_nnH_N3H8'
);

const WIDGET_BASE = 'https://radio-station-widget.pages.dev';

// ── Types ─────────────────────────────────────────────────────────────────
interface ArtistProfile {
  id: string;
  name: string;
  logo_url: string | null;
  // DJ platform fields (may not exist in Studio2Radio profiles table)
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  soundcloud_url?: string | null;
  mixcloud_url?: string | null;
}

interface Track {
  id: string;
  title: string;
  composer: string;
  duration: number;
  genre: string;
  mood: string;
  upload_date: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ArtistProfile() {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  // Read userId or handle from URL params
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const handle = params.get('handle');

  useEffect(() => {
    if (!userId && !handle) {
      setError('No artist specified.');
      setLoading(false);
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Fetch profile by userId or name (handle)
      let query = supabase.from('profiles').select('*');
      if (userId) {
        query = query.eq('id', userId);
      } else if (handle) {
        query = query.ilike('name', handle);
      }
      const { data: profileData, error: profileError } = await query.single();
      if (profileError || !profileData) {
        setError('Artist not found.');
        setLoading(false);
        return;
      }

      setProfile(profileData as ArtistProfile);

      // Update page title
      document.title = `${profileData.name} — Studio2Radio`;

      // Fetch public tracks
      const { data: trackData } = await supabase
        .from('tracks')
        .select('id, title, composer, duration, genre, mood, upload_date')
        .eq('user_id', profileData.id)
        .order('upload_date', { ascending: false });

      setTracks((trackData as Track[]) ?? []);
    } catch (err) {
      setError('Failed to load profile.');
    }
    setLoading(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0B0D' }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#C9FF3B] mx-auto mb-4" />
          <p className="text-[#666] text-sm">Loading artist profile…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0B0D' }}>
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-[#F2F2F2] font-semibold mb-2">{error ?? 'Artist not found'}</p>
          <p className="text-[#666] text-sm">Check the link and try again.</p>
        </div>
      </div>
    );
  }

  const stationUrl = `${WIDGET_BASE}/?userId=${profile.id}`;
  const hasLinks = profile.website || profile.instagram_url || profile.twitter_url || profile.soundcloud_url || profile.mixcloud_url;

  // ── Profile ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0B0D' }}>

      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(11,11,13,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-[#C9FF3B]" />
          <span className="text-[#F2F2F2] font-bold text-sm tracking-tight">STUDIO2RADIO</span>
        </div>
        <a
          href="https://radiostation-murex.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#666] text-xs hover:text-[#C9FF3B] transition-colors"
        >
          Get your own station →
        </a>
      </div>

      <div className="pt-[72px] max-w-4xl mx-auto px-4 pb-20">

        {/* Hero section */}
        <div className="py-12 flex flex-col md:flex-row items-start gap-8">

          {/* Avatar */}
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(201,255,59,0.08)', border: '2px solid rgba(201,255,59,0.15)' }}
          >
            {profile.logo_url ? (
              <img src={profile.logo_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <Radio size={40} className="text-[#C9FF3B]/40" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-[#F2F2F2] text-4xl md:text-5xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', lineHeight: '0.95' }}
            >
              {profile.name}
            </h1>

            {profile.location && (
              <div className="flex items-center gap-1.5 mt-3">
                <MapPin size={13} className="text-[#666]" />
                <span className="text-[#666] text-sm">{profile.location}</span>
              </div>
            )}

            {profile.bio && (
              <p className="text-[#B8B8B8] text-sm leading-relaxed mt-4 max-w-xl">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-5">
              <div>
                <p className="text-[#F2F2F2] text-xl font-bold">{tracks.length}</p>
                <p className="text-[#555] text-xs">Tracks</p>
              </div>
              {tracks.filter((t) => t.genre).length > 0 && (
                <div>
                  <p className="text-[#F2F2F2] text-xl font-bold">
                    {[...new Set(tracks.map((t) => t.genre).filter(Boolean))].length}
                  </p>
                  <p className="text-[#555] text-xs">Genres</p>
                </div>
              )}
            </div>

            {/* Social links */}
            {hasLinks && (
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                {profile.website && (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:text-[#F2F2F2]"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#B8B8B8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Globe size={13} /> Website
                  </a>
                )}
                {profile.instagram_url && (
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'rgba(225,48,108,0.1)', color: '#e1306c', border: '1px solid rgba(225,48,108,0.2)' }}
                  >
                    <Instagram size={13} /> Instagram
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#B8B8B8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Twitter size={13} /> X
                  </a>
                )}
                {profile.soundcloud_url && (
                  <a href={profile.soundcloud_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'rgba(255,85,0,0.1)', color: '#ff5500', border: '1px solid rgba(255,85,0,0.2)' }}
                  >
                    <ExternalLink size={13} /> SoundCloud
                  </a>
                )}
                {profile.mixcloud_url && (
                  <a href={profile.mixcloud_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'rgba(82,65,150,0.15)', color: '#5241AA', border: '1px solid rgba(82,65,150,0.3)' }}
                  >
                    <ExternalLink size={13} /> Mixcloud
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Station widget / CTA */}
        <div
          className="rounded-3xl p-6 md:p-8 mb-10"
          style={{ background: 'rgba(201,255,59,0.04)', border: '1px solid rgba(201,255,59,0.12)' }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#C9FF3B] animate-pulse" />
                <span className="text-[#C9FF3B] text-xs font-semibold uppercase tracking-widest">Live Station</span>
              </div>
              <p className="text-[#F2F2F2] text-xl font-bold">{profile.name} Radio</p>
              <p className="text-[#666] text-sm mt-1">{tracks.length} tracks · Stream live</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setWidgetOpen(!widgetOpen)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: '#C9FF3B', color: '#0B0B0D' }}
              >
                <Play size={16} fill="currentColor" />
                {widgetOpen ? 'Close Player' : 'Open Player'}
              </button>
              <a
                href={stationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm transition-all"
                style={{ background: 'rgba(201,255,59,0.1)', color: '#C9FF3B', border: '1px solid rgba(201,255,59,0.2)' }}
              >
                <ExternalLink size={15} /> Full Page
              </a>
            </div>
          </div>

          {/* Embedded widget */}
          {widgetOpen && (
            <div className="mt-6 flex justify-center">
              <iframe
                src={stationUrl}
                width="380"
                height="520"
                frameBorder="0"
                allow="autoplay"
                style={{ borderRadius: '16px', maxWidth: '100%' }}
                title={`${profile.name} Radio Station`}
              />
            </div>
          )}
        </div>

        {/* Track list */}
        {tracks.length > 0 && (
          <div>
            <h2
              className="text-[#F2F2F2] text-2xl font-bold mb-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Tracks
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-12 gap-3 px-5 py-3 text-xs uppercase tracking-widest text-[#555]"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="col-span-1">#</span>
                <span className="col-span-5">Title</span>
                <span className="col-span-2 hidden md:block">Genre</span>
                <span className="col-span-2 hidden md:block">Mood</span>
                <span className="col-span-2 text-right flex items-center justify-end gap-1">
                  <Clock size={11} /> Time
                </span>
              </div>

              {tracks.map((track, i) => (
                <div
                  key={track.id}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center group"
                  style={{
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="col-span-1 text-[#444] text-xs">{i + 1}</span>
                  <div className="col-span-5 md:col-span-5 min-w-0">
                    <p className="text-[#F2F2F2] text-sm font-medium truncate">{track.title}</p>
                    <p className="text-[#555] text-xs truncate mt-0.5">{track.composer}</p>
                  </div>
                  <span className="col-span-2 hidden md:block text-[#666] text-xs truncate">{track.genre || '—'}</span>
                  <span className="col-span-2 hidden md:block text-[#666] text-xs truncate capitalize">{track.mood || '—'}</span>
                  <span className="col-span-6 md:col-span-2 text-right text-[#555] text-xs font-mono">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              ))}
            </div>

            {/* Genre tags */}
            {tracks.some((t) => t.genre) && (
              <div className="flex flex-wrap gap-2 mt-5">
                {[...new Set(tracks.map((t) => t.genre).filter(Boolean))].map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1.5 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#B8B8B8', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {tracks.length === 0 && (
          <div
            className="p-12 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Music size={32} className="mx-auto mb-3 text-[#333]" />
            <p className="text-[#F2F2F2] font-medium">No tracks yet</p>
            <p className="text-[#555] text-sm mt-1">Check back soon</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={15} className="text-[#C9FF3B]" />
            <span className="text-[#444] text-xs">Studio2Radio</span>
          </div>
          <a
            href="https://radiostation-murex.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#444] text-xs hover:text-[#C9FF3B] transition-colors"
          >
            Create your station →
          </a>
        </div>

      </div>
    </div>
  );
}
