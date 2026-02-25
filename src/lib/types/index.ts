export interface Profile {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  website: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  twitter_url: string | null;
  mixcloud_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  genres?: Genre[];
}

export interface DJSearchResult {
  dj_id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  follower_count: number;
  set_count: number;
}

export interface SearchResult {
  result_type: 'dj' | 'set';
  id: string;
  title: string;
  subtitle: string;
  avatar_or_artwork: string | null;
  handle: string;
  url: string;
}

export interface Set {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  artwork_url: string | null;
  is_public: boolean;
  play_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface SetWithProfile extends Set {
  profiles: Profile;
  genres?: Genre[];
  has_liked?: boolean;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface SetGenre {
  set_id: string;
  genre_id: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithProfile extends Follow {
  profiles: Profile;
}

export interface Like {
  id: string;
  user_id: string;
  set_id: string;
  created_at: string;
}

export interface PlayCount {
  id: string;
  set_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  played_seconds: number | null;
  created_at: string;
}

export interface Comment {
  id: string;
  set_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export type NotificationType = 'new_follower' | 'new_like' | 'new_comment';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  set_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  set?: Set;
}

export interface FeedItem {
  set_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  artwork_url: string | null;
  play_count: number;
  likes_count: number;
  created_at: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface PlayerState {
  currentTrack: FeedItem | SetWithProfile | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface UploadFormData {
  title: string;
  description: string;
  audioFile: File;
  artworkFile?: File;
  genres: string[];
  isPublic: boolean;
}

export interface ProfileFormData {
  handle: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  is_public: boolean;
}

// ── Phase 4: Gigs & Bookings ──────────────────────────────

export type EventType =
  | 'club_night'
  | 'festival'
  | 'private_event'
  | 'wedding'
  | 'corporate'
  | 'bar_residency'
  | 'pop_up'
  | 'online_stream'
  | 'other'

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export type BudgetRange =
  | 'under_500'
  | '500_1000'
  | '1000_2500'
  | '2500_5000'
  | '5000_plus'
  | 'negotiable'

export interface Gig {
  id: string
  dj_id: string
  title: string
  venue_name: string
  city: string
  country: string | null
  event_date: string
  event_type: EventType
  description: string | null
  ticket_url: string | null
  flyer_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface BookingRequest {
  id: string
  dj_id: string
  requester_id: string
  event_name: string
  event_date: string
  event_type: EventType
  venue_name: string
  city: string
  country: string | null
  budget: BudgetRange
  guest_count: number | null
  message: string
  contact_email: string
  contact_phone: string | null
  status: BookingStatus
  dj_response: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
  dj?: Profile
  requester?: Profile
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  club_night: 'Club Night',
  festival: 'Festival',
  private_event: 'Private Event',
  wedding: 'Wedding',
  corporate: 'Corporate',
  bar_residency: 'Bar / Residency',
  pop_up: 'Pop-up',
  online_stream: 'Online / Stream',
  other: 'Other',
}

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  under_500: 'Under $500',
  '500_1000': '$500 – $1,000',
  '1000_2500': '$1,000 – $2,500',
  '2500_5000': '$2,500 – $5,000',
  '5000_plus': '$5,000+',
  negotiable: 'Negotiable',
}
