// User Types
export type PROName = 'ASCAP' | 'BMI' | 'SESAC' | 'GMR' | 'SOCAN' | 'PRS' | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  logoUrl?: string;
  primaryPRO?: PROName;
  ascapId?: string;
  bmiId?: string;
  sesacId?: string;
  gmrId?: string;
  socanId?: string;
  prsId?: string;
  soundExchangeId?: string;
  ipiNumber?: string;
  isniNumber?: string;
  publisherName?: string;
  publisherIpiNumber?: string;
  distributorName?: string;
  labelName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Track Types
export interface Track {
  id: string;
  userId: string;
  title: string;
  composer: string;
  duration: number;
  fileUrl: string;
  artworkUrl?: string;
  isrcCode?: string;
  compositionDate?: Date;
  writers?: string[];
  genre?: string;
  tags: string[];
  mood?: string;
  tempo?: number;
  gainDb?: number;
  fileSize?: number;  // bytes — stored for storage quota tracking
  uploadDate: Date;
  updatedAt: Date;
}

// Storage quota constants
export const STORAGE_QUOTA_FREE_BYTES  = 200 * 1024 * 1024;  // 200MB
export const STORAGE_QUOTA_LABEL       = 'Free (200MB)';

export interface TrackMetadata {
  title: string;
  composer: string;
  isrcCode?: string;
  compositionDate?: string;
  writers: string[];
  genre: string;
  tags: string[];
  mood: string;
  tempo: number;
}

// Playlist Types
export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  trackIds: string[];
  tracks: Track[];
  createdDate: Date;
  updatedDate: Date;
  isShuffled: boolean;
  loopMode: 'none' | 'single' | 'all';
}

export interface PlaylistFormData {
  name: string;
  description: string;
}

// Play Log Types
export interface PlayLog {
  id: string;
  trackId: string;
  track: Track;
  userId: string;
  playTimestamp: Date;
  durationPlayed: number;
  percentagePlayed: number;
  sessionId: string;
  counted: boolean;
}

export interface PlayReport {
  trackId: string;
  trackTitle: string;
  composer: string;
  writers: string[];
  totalPlays: number;
  countedPlays: number;
  firstPlayDate: Date;
  lastPlayDate: Date;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  trackIds?: string[];
}

export interface ASCAPReport {
  reportPeriod: { start: Date; end: Date; };
  generatedAt: Date;
  platform: string;
  totalPlays: number;
  tracks: PlayReport[];
}

// Player Types
export interface PlayerState {
  currentTrack: Track | null;
  currentPlaylist: Playlist | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loopMode: 'none' | 'single' | 'all';
  isShuffled: boolean;
}

export interface AudioMetrics {
  playStartTime: number;
  totalPlayedTime: number;
  lastUpdateTime: number;
}

// UI Types
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: unknown;
}

// Filter Types
export interface TrackFilters {
  search: string;
  genre: string | null;
  mood: string | null;
  tags: string[];
  sortBy: 'title' | 'composer' | 'uploadDate' | 'duration';
  sortOrder: 'asc' | 'desc';
}

export interface SavedStation {
  stationUserId: string;
  name: string;
  logoUrl?: string | null;
  savedAt?: string;
}

export interface PublicStation {
  id: string;
  name: string;
  logoUrl?: string | null;
  trackCount: number;
}

// ── DJ Drops ──────────────────────────────────────────────────────────────

export interface Drop {
  id: string;
  userId: string;
  title: string;
  fileUrl: string;
  filePath: string;
  duration: number;
  fileSize: number;
  createdAt: string;
}

export interface DropConfig {
  enabled: boolean;
  interval: number;               // play a drop every N tracks
  order: 'sequential' | 'random';
}

// ── Show Scheduling ───────────────────────────────────────────────────────

export interface Show {
  id: string;
  userId: string;
  name: string;
  playlistId: string;
  dayOfWeek: number;              // 0 = Sun … 6 = Sat
  startTime: string;              // 'HH:MM' 24h
  durationMinutes: number;
  repeat: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AppState {
  auth: AuthState;
  player: PlayerState;
  tracks: Track[];
  playlists: Playlist[];
  playLogs: PlayLog[];
  filters: TrackFilters;
  ui: { toasts: Toast[]; modal: ModalState; isDarkMode: boolean; };
}
