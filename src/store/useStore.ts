import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { analyzeGain } from '@/lib/analyzeGain';
import { analyzeBPM } from '@/lib/analyzeBPM';
import type {
  User,
  Track,
  Playlist,
  PlayLog,
  PlayerState,
  TrackFilters,
  Toast,
  SavedStation,
} from '@/types';
import { STORAGE_QUOTA_FREE_BYTES } from '@/types';

// Resolve a stored logo path (or already-signed URL) to a fresh signed URL
async function resolveLogoUrl(logoPath: string): Promise<string> {
  if (!logoPath) return '';
  // Already a full URL (signed or public)
  if (logoPath.startsWith('http')) return logoPath;
  const { data } = await supabase.storage.from('audio').createSignedUrl(logoPath, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? '';
}

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  uploadLogo: (file: File) => Promise<string | null>;
  initAuth: () => Promise<void>;
  tracks: Track[];
  tracksLoading: boolean;
  fetchTracks: () => Promise<void>;
  addTrack: (track: Omit<Track, 'id' | 'uploadDate' | 'updatedAt'>, file?: File) => Promise<void>;
  updateTrack: (id: string, data: Partial<Track>) => Promise<void>;
  deleteTrack: (id: string) => Promise<void>;
  reorderTracks: (trackIds: string[]) => void;
  getTrackById: (id: string) => Track | undefined;
  // On-Air config
  onAirTrackIds: string[];
  onAirPlaylistIds: string[];
  onAirMode: 'all' | 'selected';
  setOnAir: (trackIds: string[], playlistIds: string[], mode: 'all' | 'selected') => Promise<void>;
  playlists: Playlist[];
  playlistsLoading: boolean;
  fetchPlaylists: () => Promise<void>;
  addPlaylist: (playlist: Omit<Playlist, 'id' | 'createdDate' | 'updatedDate'>) => Promise<void>;
  updatePlaylist: (id: string, data: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  reorderPlaylistTracks: (playlistId: string, trackIds: string[]) => Promise<void>;
  getPlaylistById: (id: string) => Playlist | undefined;
  playLogs: PlayLog[];
  addPlayLog: (log: Omit<PlayLog, 'id'>) => Promise<void>;
  fetchPlayLogs: () => Promise<void>;
  getPlayLogs: (filters?: { startDate?: Date; endDate?: Date; trackId?: string }) => PlayLog[];
  generateASCAPReport: (startDate: Date, endDate: Date) => unknown;
  player: PlayerState;
  playTrack: (track: Track, playlist?: Playlist) => void;
  playPlaylist: (playlist: Playlist, startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setLoopMode: (mode: 'none' | 'single' | 'all') => void;
  toggleShuffle: () => void;
  updatePlayerTime: (currentTime: number, duration: number) => void;
  filters: TrackFilters;
  setFilters: (filters: Partial<TrackFilters>) => void;
  resetFilters: () => void;
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  libraryPanelOpen: boolean;
  setLibraryPanelOpen: (open: boolean) => void;
  stationPanelOpen: boolean;
  setStationPanelOpen: (open: boolean) => void;
  playlistPanelOpen: boolean;
  setPlaylistPanelOpen: (open: boolean) => void;
  reportsPanelOpen: boolean;
  setReportsPanelOpen: (open: boolean) => void;
  // Discover
  savedStations: SavedStation[];
  fetchSavedStations: () => Promise<void>;
  saveStation: (station: SavedStation) => Promise<void>;
  removeSavedStation: (userId: string) => Promise<void>;
}

const initialPlayerState: PlayerState = {
  currentTrack: null,
  currentPlaylist: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  loopMode: 'none',
  isShuffled: false,
};

const initialFilters: TrackFilters = {
  search: '',
  genre: null,
  mood: null,
  tags: [],
  sortBy: 'uploadDate',
  sortOrder: 'desc',
};

function rowToTrack(row: Record<string, unknown>): Track {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    composer: row.composer as string,
    duration: (row.duration as number) || 0,
    fileUrl: (row.file_url as string) || '',
    artworkUrl: (row.artwork_url as string) || '',
    isrcCode: (row.isrc_code as string) || '',
    writers: (row.writers as string[]) || [],
    genre: (row.genre as string) || '',
    tags: (row.tags as string[]) || [],
    mood: (row.mood as string) || '',
    tempo: (row.tempo as number) || 0,
    gainDb: (row.gain_db as number) ?? 0,
    fileSize: (row.file_size as number) ?? 0,
    uploadDate: new Date(row.upload_date as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function rowToPlaylist(row: Record<string, unknown>, tracks: Track[]): Playlist {
  const trackIds = (row.track_ids as string[]) || [];
  const playlistTracks = trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as Track[];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    trackIds,
    tracks: playlistTracks,
    createdDate: new Date(row.created_date as string),
    updatedDate: new Date(row.updated_date as string),
    isShuffled: (row.is_shuffled as boolean) || false,
    loopMode: (row.loop_mode as 'none' | 'single' | 'all') || 'none',
  };
}

function rowToPlayLog(row: Record<string, unknown>, tracks: Track[]): PlayLog {
  const track = tracks.find((t) => t.id === (row.track_id as string));
  return {
    id: row.id as string,
    trackId: row.track_id as string,
    track: track!,
    userId: row.user_id as string,
    playTimestamp: new Date(row.play_timestamp as string),
    durationPlayed: (row.duration_played as number) || 0,
    percentagePlayed: (row.percentage_played as number) || 0,
    sessionId: (row.session_id as string) || '',
    counted: (row.counted as boolean) || false,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoadingAuth: true,

      initAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          const user: User = {
            id: session.user.id,
            email: session.user.email ?? '',
            name: profile?.name ?? session.user.email?.split('@')[0] ?? '',
            logoUrl:            await resolveLogoUrl(profile?.logo_url ?? ''),
            ascapId: profile?.ascap_id ?? '',
            primaryPRO:         profile?.primary_pro ?? undefined,
            bmiId:              profile?.bmi_id ?? '',
            sesacId:            profile?.sesac_id ?? '',
            gmrId:              profile?.gmr_id ?? '',
            socanId:            profile?.socan_id ?? '',
            prsId:              profile?.prs_id ?? '',
            soundExchangeId:    profile?.sound_exchange_id ?? '',
            ipiNumber:          profile?.ipi_number ?? '',
            isniNumber:         profile?.isni_number ?? '',
            publisherName:      profile?.publisher_name ?? '',
            publisherIpiNumber: profile?.publisher_ipi ?? '',
            distributorName:    profile?.distributor_name ?? '',
            labelName:          profile?.label_name ?? '',
            createdAt: new Date(session.user.created_at),
            updatedAt: new Date(),
          };
          set({ user, isAuthenticated: true, isLoadingAuth: false });
          // Load radio config if saved
          if (profile?.radio_config) {
            try {
              const rc = JSON.parse(profile.radio_config as string);
              set({ onAirTrackIds: rc.trackIds ?? [], onAirPlaylistIds: rc.playlistIds ?? [], onAirMode: rc.mode ?? 'all' });
            } catch { /* ignore parse errors */ }
          }
          await get().fetchTracks();
          await get().fetchPlaylists();
          await get().fetchPlayLogs();
        } else {
          set({ isLoadingAuth: false });
        }
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          const msg = error?.message?.toLowerCase().includes('email not confirmed')
            ? 'Please confirm your email before signing in — check your inbox.'
            : error?.message ?? 'Invalid email or password';
          get().addToast(msg, 'error');
          return false;
        }
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        const user: User = {
          id: data.user.id, email: data.user.email ?? '',
          name: profile?.name ?? email.split('@')[0],
          logoUrl:            await resolveLogoUrl(profile?.logo_url ?? ''),
          ascapId: profile?.ascap_id ?? '',
          primaryPRO:         profile?.primary_pro ?? undefined,
          bmiId:            profile?.bmi_id ?? '',
          sesacId:          profile?.sesac_id ?? '',
          gmrId:            profile?.gmr_id ?? '',
          socanId:          profile?.socan_id ?? '',
          prsId:            profile?.prs_id ?? '',
          soundExchangeId:    profile?.sound_exchange_id ?? '',
          ipiNumber:          profile?.ipi_number ?? '',
          isniNumber:         profile?.isni_number ?? '',
          publisherName:      profile?.publisher_name ?? '',
          publisherIpiNumber: profile?.publisher_ipi ?? '',
          distributorName:    profile?.distributor_name ?? '',
          labelName:          profile?.label_name ?? '',
          createdAt: new Date(data.user.created_at), updatedAt: new Date(),
        };
        set({ user, isAuthenticated: true });
        await get().fetchTracks(); await get().fetchPlaylists(); await get().fetchPlayLogs();
        get().addToast(`Welcome back, ${user.name}!`, 'success');
        return true;
      },

      register: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) { get().addToast(error.message ?? 'Registration failed', 'error'); return false; }
        if (!data.user) { get().addToast('Registration failed — please try again', 'error'); return false; }

        // If session exists, email confirmation is disabled — log them straight in
        if (data.session) {
          const user: User = {
            id: data.user.id, email: data.user.email ?? '', name,
            ascapId: '', createdAt: new Date(data.user.created_at), updatedAt: new Date(),
          };
          set({ user, isAuthenticated: true });
          await get().fetchTracks(); await get().fetchPlaylists(); await get().fetchPlayLogs();
          get().addToast(`Welcome, ${name}! Your account is ready.`, 'success');
          return true;
        }

        // No session means email confirmation is required — return 'confirm' signal
        return 'confirm' as unknown as boolean;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, tracks: [], playlists: [], playLogs: [], player: initialPlayerState });
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        await supabase.from('profiles').update({
          name:               data.name,
          logo_url:           data.logoUrl,
          ascap_id:           data.ascapId,
          primary_pro:        data.primaryPRO,
          bmi_id:             data.bmiId,
          sesac_id:           data.sesacId,
          gmr_id:             data.gmrId,
          socan_id:           data.socanId,
          prs_id:             data.prsId,
          sound_exchange_id:  data.soundExchangeId,
          ipi_number:         data.ipiNumber,
          isni_number:        data.isniNumber,
          publisher_name:     data.publisherName,
          publisher_ipi:      data.publisherIpiNumber,
          distributor_name:   data.distributorName,
          label_name:         data.labelName,
          updated_at:         new Date().toISOString(),
        }).eq('id', user.id);
        set({ user: { ...user, ...data, updatedAt: new Date() } });
      },

      uploadLogo: async (file: File) => {
        const { user } = get();
        if (!user) return null;
        const ext = file.name.split('.').pop();
        const path = `logos/${user.id}/logo.${ext}`;
        const { error } = await supabase.storage.from('audio').upload(path, file, { upsert: true, contentType: file.type });
        if (error) {
          console.error('Logo upload error:', error);
          get().addToast(`Logo upload failed: ${error.message}`, 'error');
          return null;
        }
        const { data: urlData } = await supabase.storage.from('audio').createSignedUrl(path, 60 * 60 * 24 * 365);
        const logoUrl = urlData?.signedUrl ?? '';
        const { error: dbError } = await supabase.from('profiles').update({ logo_url: path }).eq('id', user.id);
        if (dbError) {
          console.error('Logo DB update error:', dbError);
          get().addToast(`Logo saved to storage but profile update failed: ${dbError.message}`, 'error');
        } else {
          console.log('Logo path saved to DB:', path);
        }
        set({ user: { ...user, logoUrl } });
        return logoUrl;
      },

      tracks: [],
      tracksLoading: false,

      fetchTracks: async () => {
        const { user } = get();
        if (!user) return;
        set({ tracksLoading: true });
        const { data, error } = await supabase.from('tracks').select('*').eq('user_id', user.id).order('upload_date', { ascending: false });
        if (!error && data) {
          const tracks = await Promise.all(data.map(async (row) => {
            const track = rowToTrack(row);
            if (row.file_path) {
              const { data: urlData } = await supabase.storage.from('audio').createSignedUrl(row.file_path as string, 3600);
              track.fileUrl = urlData?.signedUrl ?? '';
            }
            return track;
          }));
          set({ tracks, tracksLoading: false });
        } else { set({ tracksLoading: false }); }
      },

      addTrack: async (trackData, file) => {
        const { user, tracks } = get();
        if (!user) return;

        // ── Storage quota check ──
        if (file) {
          const usedBytes = tracks.reduce((sum, t) => sum + (t.fileSize ?? 0), 0);
          if (usedBytes + file.size > STORAGE_QUOTA_FREE_BYTES) {
            const usedMB  = (usedBytes / 1024 / 1024).toFixed(1);
            const limitMB = (STORAGE_QUOTA_FREE_BYTES / 1024 / 1024).toFixed(0);
            get().addToast(`Storage full — ${usedMB}MB of ${limitMB}MB used. Delete tracks to free space.`, 'error');
            return;
          }
        }

        let filePath = '';
        let fileUrl  = trackData.fileUrl ?? '';
        let gainDb   = 0;
        let bpm      = trackData.tempo ?? 0;

        if (file) {
          const ext  = file.name.split('.').pop();
          filePath   = `${user.id}/${Date.now()}.${ext}`;

          // Run gain + BPM analysis in parallel
          const [detectedGain, detectedBpm] = await Promise.all([
            analyzeGain(file).catch(() => 0),
            analyzeBPM(file).catch(() => 0),
          ]);
          gainDb = detectedGain;
          if (detectedBpm > 0) bpm = detectedBpm;

          const { error: uploadError } = await supabase.storage.from('audio').upload(filePath, file, { contentType: file.type });
          if (uploadError) { get().addToast('File upload failed: ' + uploadError.message, 'error'); return; }
          const { data: urlData } = await supabase.storage.from('audio').createSignedUrl(filePath, 3600);
          fileUrl = urlData?.signedUrl ?? '';
        }

        const { data, error } = await supabase.from('tracks').insert({
          user_id: user.id, title: trackData.title, composer: trackData.composer,
          duration: trackData.duration, file_url: fileUrl, file_path: filePath,
          isrc_code: trackData.isrcCode ?? '', writers: trackData.writers ?? [],
          genre: trackData.genre ?? '', tags: trackData.tags ?? [],
          mood: trackData.mood ?? '', tempo: bpm,
          gain_db: gainDb,
          file_size: file?.size ?? 0,
        }).select().single();

        if (!error && data) {
          const newTrack = rowToTrack(data);
          newTrack.fileUrl = fileUrl;
          set((state) => ({ tracks: [newTrack, ...state.tracks] }));
          if (bpm > 0) get().addToast(`Uploaded · ${bpm} BPM detected`, 'success');
        } else {
          get().addToast('Failed to save track: ' + error?.message, 'error');
        }
      },

      updateTrack: async (id, data) => {
        const u: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.title !== undefined) u.title = data.title;
        if (data.composer !== undefined) u.composer = data.composer;
        if (data.genre !== undefined) u.genre = data.genre;
        if (data.mood !== undefined) u.mood = data.mood;
        if (data.tempo !== undefined) u.tempo = data.tempo;
        if (data.isrcCode !== undefined) u.isrc_code = data.isrcCode;
        if (data.writers !== undefined) u.writers = data.writers;
        if (data.tags !== undefined) u.tags = data.tags;
        await supabase.from('tracks').update(u).eq('id', id);
        set((state) => ({ tracks: state.tracks.map((t) => t.id === id ? { ...t, ...data, updatedAt: new Date() } : t) }));
      },

      deleteTrack: async (id) => {
        const { data: row } = await supabase.from('tracks').select('file_path').eq('id', id).single();
        if (row?.file_path) await supabase.storage.from('audio').remove([row.file_path]);
        await supabase.from('tracks').delete().eq('id', id);
        set((state) => ({ tracks: state.tracks.filter((t) => t.id !== id) }));
      },

      getTrackById: (id) => get().tracks.find((t) => t.id === id),

      reorderTracks: (trackIds) => {
        const { tracks } = get();
        const reordered = trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as Track[];
        set({ tracks: reordered });
      },

      onAirTrackIds: [],
      onAirPlaylistIds: [],
      onAirMode: 'all',
      setOnAir: async (trackIds, playlistIds, mode) => {
        const { user } = get();
        set({ onAirTrackIds: trackIds, onAirPlaylistIds: playlistIds, onAirMode: mode });
        if (!user) return;
        // Persist to profiles as radio_config JSON
        const config = JSON.stringify({ trackIds, playlistIds, mode });
        await supabase.from('profiles').update({ radio_config: config } as Record<string, unknown>).eq('id', user.id);
      },

      playlists: [],
      playlistsLoading: false,

      fetchPlaylists: async () => {
        const { user, tracks } = get();
        if (!user) return;
        const { data, error } = await supabase.from('playlists').select('*').eq('user_id', user.id).order('created_date', { ascending: false });
        if (!error && data) set({ playlists: data.map((row) => rowToPlaylist(row, tracks)) });
      },

      addPlaylist: async (playlist) => {
        const { user, tracks } = get();
        if (!user) return;
        const { data, error } = await supabase.from('playlists').insert({
          user_id: user.id, name: playlist.name, description: playlist.description,
          track_ids: playlist.trackIds, is_shuffled: playlist.isShuffled, loop_mode: playlist.loopMode,
        }).select().single();
        if (!error && data) set((state) => ({ playlists: [rowToPlaylist(data, tracks), ...state.playlists] }));
      },

      updatePlaylist: async (id, data) => {
        const { tracks } = get();
        const u: Record<string, unknown> = { updated_date: new Date().toISOString() };
        if (data.name !== undefined) u.name = data.name;
        if (data.description !== undefined) u.description = data.description;
        if (data.trackIds !== undefined) u.track_ids = data.trackIds;
        if (data.isShuffled !== undefined) u.is_shuffled = data.isShuffled;
        if (data.loopMode !== undefined) u.loop_mode = data.loopMode;
        await supabase.from('playlists').update(u).eq('id', id);
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== id) return p;
            const updated = { ...p, ...data, updatedDate: new Date() };
            if (data.trackIds) updated.tracks = data.trackIds.map((tid) => tracks.find((t) => t.id === tid)).filter(Boolean) as Track[];
            return updated;
          }),
        }));
      },

      deletePlaylist: async (id) => {
        await supabase.from('playlists').delete().eq('id', id);
        set((state) => ({ playlists: state.playlists.filter((p) => p.id !== id) }));
      },

      reorderPlaylistTracks: async (playlistId, trackIds) => {
        const { tracks } = get();
        await supabase.from('playlists').update({ track_ids: trackIds, updated_date: new Date().toISOString() }).eq('id', playlistId);
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds, tracks: trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as Track[], updatedDate: new Date() }
              : p
          ),
        }));
      },

      getPlaylistById: (id) => get().playlists.find((p) => p.id === id),

      playLogs: [],

      fetchPlayLogs: async () => {
        const { user, tracks } = get();
        if (!user) return;
        const { data, error } = await supabase.from('play_logs').select('*').eq('user_id', user.id).order('play_timestamp', { ascending: false }).limit(1000);
        if (!error && data) set({ playLogs: data.map((row) => rowToPlayLog(row, tracks)).filter((l) => l.track) });
      },

      addPlayLog: async (log) => {
        const { user } = get();
        if (!user) return;
        const { data, error } = await supabase.from('play_logs').insert({
          user_id: user.id, track_id: log.trackId,
          play_timestamp: log.playTimestamp.toISOString(),
          duration_played: log.durationPlayed, percentage_played: log.percentagePlayed,
          session_id: log.sessionId, counted: log.counted,
        }).select().single();
        if (!error && data) set((state) => ({ playLogs: [{ ...log, id: data.id }, ...state.playLogs] }));
      },

      getPlayLogs: (filters) => {
        let logs = get().playLogs;
        if (filters?.startDate) logs = logs.filter((l) => l.playTimestamp >= filters.startDate!);
        if (filters?.endDate) logs = logs.filter((l) => l.playTimestamp <= filters.endDate!);
        if (filters?.trackId) logs = logs.filter((l) => l.trackId === filters.trackId);
        return logs;
      },

      generateASCAPReport: (startDate, endDate) => {
        const logs = get().getPlayLogs({ startDate, endDate });
        const trackMap = new Map<string, { track: Track; plays: PlayLog[] }>();
        logs.forEach((log) => {
          if (!log.track) return;
          if (!trackMap.has(log.trackId)) trackMap.set(log.trackId, { track: log.track, plays: [] });
          trackMap.get(log.trackId)!.plays.push(log);
        });
        const tracks = Array.from(trackMap.entries()).map(([trackId, d]) => ({
          trackId, trackTitle: d.track.title, composer: d.track.composer,
          writers: d.track.writers || [d.track.composer],
          totalPlays: d.plays.length, countedPlays: d.plays.filter((p) => p.counted).length,
          firstPlayDate: new Date(Math.min(...d.plays.map((p) => p.playTimestamp.getTime()))),
          lastPlayDate: new Date(Math.max(...d.plays.map((p) => p.playTimestamp.getTime()))),
        }));
        return { reportPeriod: { start: startDate, end: endDate }, generatedAt: new Date(), platform: 'Studio2Radio', totalPlays: logs.length, tracks };
      },

      player: initialPlayerState,
      playTrack: (track, playlist) => set((s) => ({ player: { ...s.player, currentTrack: track, currentPlaylist: playlist || null, isPlaying: true, currentTime: 0, duration: track.duration } })),
      playPlaylist: (playlist, startIndex = 0) => {
        const track = playlist.tracks[startIndex];
        if (track) set((s) => ({ player: { ...s.player, currentTrack: track, currentPlaylist: playlist, queue: playlist.tracks, currentIndex: startIndex, isPlaying: true, currentTime: 0, duration: track.duration } }));
      },
      togglePlay: () => set((s) => ({ player: { ...s.player, isPlaying: !s.player.isPlaying } })),
      pause: () => set((s) => ({ player: { ...s.player, isPlaying: false } })),
      resume: () => set((s) => ({ player: { ...s.player, isPlaying: true } })),
      stop: () => set((s) => ({ player: { ...s.player, isPlaying: false, currentTime: 0 } })),
      nextTrack: () => {
        const { player } = get();
        if (!player.currentPlaylist) return;
        const nextIndex = player.isShuffled ? Math.floor(Math.random() * player.currentPlaylist.tracks.length) : (player.currentIndex + 1) % player.currentPlaylist.tracks.length;
        const nextTrack = player.currentPlaylist.tracks[nextIndex];
        if (nextTrack) set((s) => ({ player: { ...s.player, currentTrack: nextTrack, currentIndex: nextIndex, isPlaying: true, currentTime: 0, duration: nextTrack.duration } }));
      },
      prevTrack: () => {
        const { player } = get();
        if (!player.currentPlaylist) return;
        const prevIndex = player.currentIndex === 0 ? player.currentPlaylist.tracks.length - 1 : player.currentIndex - 1;
        const prevTrack = player.currentPlaylist.tracks[prevIndex];
        if (prevTrack) set((s) => ({ player: { ...s.player, currentTrack: prevTrack, currentIndex: prevIndex, isPlaying: true, currentTime: 0, duration: prevTrack.duration } }));
      },
      seekTo: (time) => set((s) => ({ player: { ...s.player, currentTime: time } })),
      setVolume: (volume) => set((s) => ({ player: { ...s.player, volume } })),
      toggleMute: () => set((s) => ({ player: { ...s.player, isMuted: !s.player.isMuted } })),
      setLoopMode: (mode) => set((s) => ({ player: { ...s.player, loopMode: mode } })),
      toggleShuffle: () => set((s) => ({ player: { ...s.player, isShuffled: !s.player.isShuffled } })),
      updatePlayerTime: (currentTime, duration) => set((s) => ({ player: { ...s.player, currentTime, duration } })),

      filters: initialFilters,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: initialFilters }),

      toasts: [],
      addToast: (message, type) => {
        const toast: Toast = { id: Math.random().toString(36).substr(2, 9), message, type };
        set((s) => ({ toasts: [...s.toasts, toast] }));
        setTimeout(() => get().removeToast(toast.id), 3500);
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      isDarkMode: true,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      libraryPanelOpen: false,
      setLibraryPanelOpen: (open) => set({ libraryPanelOpen: open }),
      stationPanelOpen: false,
      setStationPanelOpen: (open) => set({ stationPanelOpen: open }),
      playlistPanelOpen: false,
      setPlaylistPanelOpen: (open) => set({ playlistPanelOpen: open }),
      reportsPanelOpen: false,
      setReportsPanelOpen: (open) => set({ reportsPanelOpen: open }),

      // ── Discover / Saved Stations ──
      savedStations: [],
      fetchSavedStations: async () => {
        const { user } = get();
        if (!user) return;
        const { data } = await supabase.from('saved_stations').select('*').eq('user_id', user.id).order('saved_at', { ascending: false });
        if (data) set({ savedStations: data as SavedStation[] });
      },
      saveStation: async (station) => {
        const { user, savedStations } = get();
        if (!user) return;
        const { error } = await supabase.from('saved_stations').upsert({
          user_id: user.id,
          station_user_id: station.stationUserId,
          name: station.name,
          logo_url: station.logoUrl ?? null,
          saved_at: new Date().toISOString(),
        });
        if (!error) set({ savedStations: [station, ...savedStations.filter(s => s.stationUserId !== station.stationUserId)] });
      },
      removeSavedStation: async (stationUserId) => {
        const { user } = get();
        if (!user) return;
        await supabase.from('saved_stations').delete().eq('user_id', user.id).eq('station_user_id', stationUserId);
        set((s) => ({ savedStations: s.savedStations.filter(x => x.stationUserId !== stationUserId) }));
      },
    }),
    {
      name: 'radio-station-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        player: { volume: state.player.volume, isMuted: state.player.isMuted, loopMode: state.player.loopMode, isShuffled: state.player.isShuffled },
      }),
    }
  )
);
