// Hand-written types matching the schema.
// Regenerate after linking Supabase:
//   npx supabase gen types typescript --linked > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FeedType = 'formula' | 'breast_milk' | 'colostrum'
export type PumpOutputType = 'colostrum' | 'transitional' | 'mature_milk'
export type PumpSide = 'left' | 'right' | 'both'
export type PoopColor = 'black' | 'dark_green' | 'brown' | 'yellow' | 'mustard' | 'other'
export type PoopConsistency = 'tarry' | 'seedy' | 'grainy' | 'runny' | 'formed' | 'other'
export type CreamType = 'none' | 'vaseline' | 'aquaphor' | 'desitin' | 'zinc_oxide_40'
export type RashStatus = 'none' | 'mild' | 'moderate' | 'severe' | 'improving' | 'resolved'
export type SleepLocation = 'bassinet' | 'crib' | 'parent_arms' | 'pack_and_play' | 'car_seat' | 'other'
export type SleepWakeReason = 'self' | 'parent_for_feed' | 'diaper' | 'fussy' | 'noise' | 'other'
export type PedNoteType = 'question' | 'instruction_received' | 'observation_to_share'
export type PedNoteStatus = 'open' | 'answered' | 'resolved'
export type CaregiverRole = 'owner' | 'caregiver' | 'viewer'
export type BabySex = 'male' | 'female' | 'unspecified'

// ── Row types (what comes back from SELECT) ────────────────────────────────

export interface BabyRow {
  id: string
  name: string
  birth_date: string
  birth_time: string | null
  sex: BabySex
  birth_weight_oz: number | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface CaregiverRow {
  id: string
  baby_id: string
  user_id: string
  role: CaregiverRole
  display_name: string | null
  created_at: string
}

export interface FeedRow {
  id: string
  baby_id: string
  logged_by: string | null
  start_at: string
  end_at: string | null
  type: FeedType
  formula_brand: string | null
  volume_ml: number
  volume_offered_ml: number | null
  bottle_type: string | null
  spit_up: boolean
  spit_up_notes: string | null
  diaper_change_during: boolean
  fussiness_notes: string | null
  linked_feed_id: string | null
  voice_note_url: string | null
  created_at: string
  updated_at: string
}

export interface PumpRow {
  id: string
  baby_id: string
  logged_by: string | null
  start_at: string
  duration_min: number | null
  volume_ml: number
  output_type: PumpOutputType
  consistency_notes: string | null
  side: PumpSide | null
  voice_note_url: string | null
  created_at: string
  updated_at: string
}

export interface DiaperRow {
  id: string
  baby_id: string
  logged_by: string | null
  changed_at: string
  pee: boolean
  poop: boolean
  poop_color: PoopColor | null
  poop_consistency: PoopConsistency | null
  volume_notes: string | null
  cream_applied: CreamType
  rash_status: RashStatus | null
  notes: string | null
  voice_note_url: string | null
  created_at: string
  updated_at: string
}

export interface SleepRow {
  id: string
  baby_id: string
  logged_by: string | null
  start_at: string
  end_at: string | null
  location: SleepLocation
  woken_by: SleepWakeReason | null
  notes: string | null
  voice_note_url: string | null
  created_at: string
  updated_at: string
}

export interface WeightRow {
  id: string
  baby_id: string
  logged_by: string | null
  measured_at: string
  weight_oz: number
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PedNoteRow {
  id: string
  baby_id: string
  logged_by: string | null
  occurred_at: string
  type: PedNoteType
  status: PedNoteStatus
  content: string
  answer: string | null
  answered_at: string | null
  created_at: string
  updated_at: string
}

export interface PedNoteLinkRow {
  id: string
  note_id: string
  event_type: 'feed' | 'pump' | 'diaper' | 'sleep' | 'weight'
  event_id: string
  created_at: string
}

export interface ShareLinkRow {
  id: string
  baby_id: string
  created_by: string
  token: string
  date_range_start: string | null
  date_range_end: string | null
  expires_at: string | null
  revoked_at: string | null
  last_viewed_at: string | null
  view_count: number
  label: string | null
  created_at: string
}

export interface DailyRollupRow {
  baby_id: string
  day: string
  formula_ml: number
  breast_milk_ml: number
  colostrum_ml: number
  feed_count: number
  pee_count: number
  poop_count: number
  sleep_hours: number
  pump_ml: number
  weight_oz: number | null
}

// ── Database shape for supabase-js generics ────────────────────────────────

export interface Database {
  public: {
    Tables: {
      babies: {
        Row: BabyRow
        Insert: {
          id?: string
          name: string
          birth_date: string
          birth_time?: string | null
          sex?: BabySex
          birth_weight_oz?: number | null
          timezone?: string
        }
        Update: {
          id?: string
          name?: string
          birth_date?: string
          birth_time?: string | null
          sex?: BabySex
          birth_weight_oz?: number | null
          timezone?: string
        }
        Relationships: []
      }
      caregivers: {
        Row: CaregiverRow
        Insert: {
          id?: string
          baby_id: string
          user_id: string
          role?: CaregiverRole
          display_name?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          user_id?: string
          role?: CaregiverRole
          display_name?: string | null
        }
        Relationships: []
      }
      feeds: {
        Row: FeedRow
        Insert: {
          id?: string
          baby_id: string
          logged_by?: string | null
          start_at: string
          end_at?: string | null
          type: FeedType
          formula_brand?: string | null
          volume_ml: number
          volume_offered_ml?: number | null
          bottle_type?: string | null
          spit_up?: boolean
          spit_up_notes?: string | null
          diaper_change_during?: boolean
          fussiness_notes?: string | null
          linked_feed_id?: string | null
          voice_note_url?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          logged_by?: string | null
          start_at?: string
          end_at?: string | null
          type?: FeedType
          formula_brand?: string | null
          volume_ml?: number
          volume_offered_ml?: number | null
          bottle_type?: string | null
          spit_up?: boolean
          spit_up_notes?: string | null
          diaper_change_during?: boolean
          fussiness_notes?: string | null
          linked_feed_id?: string | null
          voice_note_url?: string | null
        }
        Relationships: []
      }
      pumps: {
        Row: PumpRow
        Insert: {
          id?: string
          baby_id: string
          logged_by?: string | null
          start_at: string
          duration_min?: number | null
          volume_ml: number
          output_type: PumpOutputType
          consistency_notes?: string | null
          side?: PumpSide | null
          voice_note_url?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          logged_by?: string | null
          start_at?: string
          duration_min?: number | null
          volume_ml?: number
          output_type?: PumpOutputType
          consistency_notes?: string | null
          side?: PumpSide | null
          voice_note_url?: string | null
        }
        Relationships: []
      }
      diapers: {
        Row: DiaperRow
        Insert: {
          id?: string
          baby_id: string
          logged_by?: string | null
          changed_at: string
          pee?: boolean
          poop?: boolean
          poop_color?: PoopColor | null
          poop_consistency?: PoopConsistency | null
          volume_notes?: string | null
          cream_applied?: CreamType
          rash_status?: RashStatus | null
          notes?: string | null
          voice_note_url?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          logged_by?: string | null
          changed_at?: string
          pee?: boolean
          poop?: boolean
          poop_color?: PoopColor | null
          poop_consistency?: PoopConsistency | null
          volume_notes?: string | null
          cream_applied?: CreamType
          rash_status?: RashStatus | null
          notes?: string | null
          voice_note_url?: string | null
        }
        Relationships: []
      }
      sleeps: {
        Row: SleepRow
        Insert: {
          id?: string
          baby_id: string
          logged_by?: string | null
          start_at: string
          end_at?: string | null
          location?: SleepLocation
          woken_by?: SleepWakeReason | null
          notes?: string | null
          voice_note_url?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          logged_by?: string | null
          start_at?: string
          end_at?: string | null
          location?: SleepLocation
          woken_by?: SleepWakeReason | null
          notes?: string | null
          voice_note_url?: string | null
        }
        Relationships: []
      }
      weights: {
        Row: WeightRow
        Insert: {
          id?: string
          baby_id: string
          logged_by?: string | null
          measured_at: string
          weight_oz: number
          location?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          logged_by?: string | null
          measured_at?: string
          weight_oz?: number
          location?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      pediatrician_notes: {
        Row: PedNoteRow
        Insert: {
          id?: string
          baby_id: string
          logged_by?: string | null
          occurred_at?: string
          type: PedNoteType
          status?: PedNoteStatus
          content: string
          answer?: string | null
          answered_at?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          logged_by?: string | null
          occurred_at?: string
          type?: PedNoteType
          status?: PedNoteStatus
          content?: string
          answer?: string | null
          answered_at?: string | null
        }
        Relationships: []
      }
      pediatrician_note_links: {
        Row: PedNoteLinkRow
        Insert: {
          id?: string
          note_id: string
          event_type: 'feed' | 'pump' | 'diaper' | 'sleep' | 'weight'
          event_id: string
        }
        Update: {
          id?: string
          note_id?: string
          event_type?: 'feed' | 'pump' | 'diaper' | 'sleep' | 'weight'
          event_id?: string
        }
        Relationships: []
      }
      share_links: {
        Row: ShareLinkRow
        Insert: {
          id?: string
          baby_id: string
          created_by: string
          token?: string
          date_range_start?: string | null
          date_range_end?: string | null
          expires_at?: string | null
          revoked_at?: string | null
          label?: string | null
        }
        Update: {
          id?: string
          baby_id?: string
          created_by?: string
          token?: string
          date_range_start?: string | null
          date_range_end?: string | null
          expires_at?: string | null
          revoked_at?: string | null
          last_viewed_at?: string | null
          label?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_rollup: {
        Row: DailyRollupRow
        Relationships: []
      }
    }
    Functions: {
      is_caregiver_for: {
        Args: { target_baby_id: string }
        Returns: boolean
      }
      resolve_share_link: {
        Args: { p_token: string }
        Returns: Array<{
          baby_id: string
          date_range_start: string | null
          date_range_end: string | null
        }>
      }
    }
    Enums: {
      feed_type: FeedType
      pump_output_type: PumpOutputType
      pump_side: PumpSide
      poop_color: PoopColor
      poop_consistency: PoopConsistency
      cream_type: CreamType
      rash_status: RashStatus
      sleep_location: SleepLocation
      sleep_wake_reason: SleepWakeReason
      ped_note_type: PedNoteType
      ped_note_status: PedNoteStatus
      caregiver_role: CaregiverRole
      baby_sex: BabySex
    }
  }
}
