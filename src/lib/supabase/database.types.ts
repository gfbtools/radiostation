export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          handle: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          handle: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          handle?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sets: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          audio_url: string
          duration_seconds: number | null
          artwork_url: string | null
          is_public: boolean
          play_count: number
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          audio_url: string
          duration_seconds?: number | null
          artwork_url?: string | null
          is_public?: boolean
          play_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          audio_url?: string
          duration_seconds?: number | null
          artwork_url?: string | null
          is_public?: boolean
          play_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      genres: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      set_genres: {
        Row: {
          set_id: string
          genre_id: string
        }
        Insert: {
          set_id: string
          genre_id: string
        }
        Update: {
          set_id?: string
          genre_id?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          set_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          set_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          set_id?: string
          created_at?: string
        }
      }
      play_counts: {
        Row: {
          id: string
          set_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          played_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          set_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          played_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          set_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          played_seconds?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_feed: {
        Args: {
          user_uuid: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          set_id: string
          title: string
          description: string | null
          audio_url: string
          duration_seconds: number | null
          artwork_url: string | null
          play_count: number
          likes_count: number
          created_at: string
          user_id: string
          handle: string
          display_name: string | null
          avatar_url: string | null
        }[]
      }
      discover_sets: {
        Args: {
          genre_filter?: string
          sort_by?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          set_id: string
          title: string
          description: string | null
          audio_url: string
          duration_seconds: number | null
          artwork_url: string | null
          play_count: number
          likes_count: number
          created_at: string
          user_id: string
          handle: string
          display_name: string | null
          avatar_url: string | null
        }[]
      }
      is_following: {
        Args: {
          check_follower_id: string
          check_following_id: string
        }
        Returns: boolean
      }
      has_liked: {
        Args: {
          check_user_id: string
          check_set_id: string
        }
        Returns: boolean
      }
      increment_play_count: {
        Args: {
          set_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
