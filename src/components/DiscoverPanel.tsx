import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Radio, Bookmark, BookmarkCheck, ExternalLink, Search, Users, Music, UserCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import type { PublicStation, SavedStation } from '@/types';

interface Props { onClose: () => void; }

const WIDGET_BASE = 'https://radio-station-widget.pages.dev';

export default function DiscoverPanel({ onClose }: Props) {
  const { user, savedStations, fetchSavedStations, saveStation, removeSavedStation, addToast } = useStore();

  const [tab, setTab]               = useState<'browse' | 'saved'>('browse');
  const [stations, setStations]     = useState<PublicStation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  // Load saved stations and public stations on open
  useEffect(() => {
    fetchSavedStations();
    loadPublicStations();
  }, []);

  const loadPublicStations = async () => {
    setLoading(true);
    try {
      // Get profiles that have at least one track, exclude current user
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, logo_url, bio, location')
        .neq('id', user?.id ?? '')
        .not('name', 'is', null);

      if (!profilesData || profilesData.length === 0) { setStations([]); setLoading(false); return; }

      // Get track counts for each profile
      const ids = profilesData.map((p) => p.id);
      const { data: trackCounts } = await supabase
        .from('tracks')
        .select('user_id')
        .in('user_id', ids);

      const countMap: Record<string, number> = {};
      (trackCounts ?? []).forEach((t) => { countMap[t.user_id] = (countMap[t.user_id] ?? 0) + 1; });

      // Only show profiles that have tracks
      const result: PublicStation[] = profilesData
        .filter((p) => (countMap[p.id] ?? 0) > 0)
        .map((p) => ({
          id: p.id,
          name: p.name,
          logoUrl: p.logo_url ?? null,
          trackCount: countMap[p.id] ?? 0,
          bio: p.bio ?? null,
          location: p.location ?? null,
        }));

      setStations(result);
    } catch (err) {
      console.error('Failed to load stations:', err);
    }
    setLoading(false);
  };

  const isSaved = (id: string) => savedStations.some((s) => s.stationUserId === id);

  const handleSave = async (station: PublicStation) => {
    if (isSaved(station.id)) {
      await removeSavedStation(station.id);
      addToast(`Removed ${station.name} from saved stations`, 'info');
    } else {
      const s: SavedStation = { stationUserId: station.id, name: station.name, logoUrl: station.logoUrl };
      await saveStation(s);
      addToast(`Saved ${station.name}!`, 'success');
    }
  };

  const openStation = (id: string) => {
    window.open(`${WIDGET_BASE}/?userId=${id}`, '_blank');
  };

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSaved = savedStations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const StationCard = ({ id, name, logoUrl, trackCount, bio, location, saved }: { id: string; name: string; logoUrl?: string | null; trackCount?: number; bio?: string | null; location?: string | null; saved?: boolean }) => (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl transition-all group"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo / placeholder */}
      <div
        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {logoUrl
          ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
          : <Radio size={20} className="text-[#444]" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[#F2F2F2] text-sm font-medium truncate">{name}</p>
        {location && (
          <p className="text-[#555] text-xs truncate mt-0.5">📍 {location}</p>
        )}
        {bio && (
          <p className="text-[#555] text-xs leading-relaxed mt-1 line-clamp-2">{bio}</p>
        )}
        {trackCount !== undefined && (
          <p className="text-[#555] text-xs flex items-center gap-1 mt-1">
            <Music size={10} /> {trackCount} track{trackCount !== 1 ? 's' : ''}
          </p>
        )}
        {saved && !bio && (
          <p className="text-[#555] text-xs mt-0.5">Saved station</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => window.open(`./artist.html?userId=${id}`, '_blank')}
          className="p-2 rounded-xl transition-all text-[#666] hover:text-[#B8B8B8] hover:bg-white/5"
          title="View artist profile"
        >
          <UserCircle size={16} />
        </button>
        <button
          onClick={() => handleSave({ id, name, logoUrl: logoUrl ?? null, trackCount: trackCount ?? 0 })}
          className="p-2 rounded-xl transition-all"
          style={{
            background: isSaved(id) ? 'rgba(201,255,59,0.12)' : 'rgba(255,255,255,0.05)',
            color: isSaved(id) ? '#C9FF3B' : '#666',
          }}
          title={isSaved(id) ? 'Remove from saved' : 'Save station'}
        >
          {isSaved(id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
        <button
          onClick={() => openStation(id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
          style={{ background: 'rgba(201,255,59,0.1)', color: '#C9FF3B', border: '1px solid rgba(201,255,59,0.2)' }}
        >
          <ExternalLink size={13} /> Listen
        </button>
      </div>
    </div>
  );

  const content = (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col glass-card z-10" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-5 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,255,59,0.15)' }}>
              <Users size={18} className="text-[#C9FF3B]" />
            </div>
            <div>
              <h2 className="text-[#F2F2F2] text-xl font-semibold">Discover Stations</h2>
              <p className="text-[#666] text-xs mt-0.5">Browse and save other artists' stations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-8 pt-5 flex-shrink-0">
          {(['browse', 'saved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-sm capitalize transition-all"
              style={{
                background: tab === t ? 'rgba(201,255,59,0.12)' : 'transparent',
                color: tab === t ? '#C9FF3B' : '#666',
                border: tab === t ? '1px solid rgba(201,255,59,0.2)' : '1px solid transparent',
              }}
            >
              {t === 'browse' ? `Browse (${stations.length})` : `Saved (${savedStations.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-8 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by artist name…"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-[#F2F2F2] text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        {/* Station list */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-3">
          {tab === 'browse' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C9FF3B] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#C9FF3B] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#C9FF3B] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : filteredStations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Radio size={32} className="text-[#333] mb-3" />
                  <p className="text-[#F2F2F2] font-medium mb-1">
                    {search ? 'No stations match your search' : 'No other stations yet'}
                  </p>
                  <p className="text-[#555] text-sm">
                    {search ? 'Try a different name' : 'Be the first — invite other artists to join!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStations.map((s) => (
                    <StationCard key={s.id} id={s.id} name={s.name} logoUrl={s.logoUrl} trackCount={s.trackCount} bio={s.bio} location={s.location} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'saved' && (
            <>
              {filteredSaved.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bookmark size={32} className="text-[#333] mb-3" />
                  <p className="text-[#F2F2F2] font-medium mb-1">
                    {search ? 'No saved stations match' : 'No saved stations yet'}
                  </p>
                  <p className="text-[#555] text-sm">
                    {search ? 'Try a different name' : 'Browse the Discover tab and bookmark stations you like'}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setTab('browse')}
                      className="mt-4 px-4 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(201,255,59,0.1)', color: '#C9FF3B', border: '1px solid rgba(201,255,59,0.2)' }}
                    >
                      Browse Stations
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSaved.map((s) => (
                    <StationCard key={s.stationUserId} id={s.stationUserId} name={s.name} logoUrl={s.logoUrl} saved />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-white/5 flex-shrink-0">
          <p className="text-[#444] text-xs">Powered by Studio2Radio</p>
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
