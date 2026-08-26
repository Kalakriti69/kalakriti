export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          arrived_at: string | null
          assigned_counter: string | null
          booked_at: string
          booking_date: string
          centre_id: string
          completed_at: string | null
          farmer_id: string
          id: string
          processing_started_at: string | null
          slot_id: string
          status: string
          token_number: number
        }
        Insert: {
          arrived_at?: string | null
          assigned_counter?: string | null
          booked_at?: string
          booking_date?: string
          centre_id: string
          completed_at?: string | null
          farmer_id: string
          id?: string
          processing_started_at?: string | null
          slot_id: string
          status?: string
          token_number: number
        }
        Update: {
          arrived_at?: string | null
          assigned_counter?: string | null
          booked_at?: string
          booking_date?: string
          centre_id?: string
          completed_at?: string | null
          farmer_id?: string
          id?: string
          processing_started_at?: string | null
          slot_id?: string
          status?: string
          token_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "procurement_centres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_profiles: {
        Row: {
          area: number
          created_at: string
          location: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          area: number
          created_at?: string
          location: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          area?: number
          created_at?: string
          location?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      farmers: {
        Row: {
          created_at: string
          district: string | null
          id: string
          land_area: number | null
          profile_id: string
          state: string | null
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          land_area?: number | null
          profile_id: string
          state?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          land_area?: number | null
          profile_id?: string
          state?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_centres: {
        Row: {
          average_processing_minutes: number
          created_at: string
          daily_capacity: number
          district: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          state: string | null
          status: string
        }
        Insert: {
          average_processing_minutes?: number
          created_at?: string
          daily_capacity?: number
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          state?: string | null
          status?: string
        }
        Update: {
          average_processing_minutes?: number
          created_at?: string
          daily_capacity?: number
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          state?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          preferred_language: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          preferred_language?: string
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          preferred_language?: string
          role?: string
        }
        Relationships: []
      }
      slots: {
        Row: {
          booked_count: number
          capacity: number
          centre_id: string
          created_at: string
          end_time: string
          id: string
          slot_date: string
          start_time: string
        }
        Insert: {
          booked_count?: number
          capacity: number
          centre_id: string
          created_at?: string
          end_time: string
          id?: string
          slot_date: string
          start_time: string
        }
        Update: {
          booked_count?: number
          capacity?: number
          centre_id?: string
          created_at?: string
          end_time?: string
          id?: string
          slot_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "slots_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "procurement_centres"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking: {
        Args: { p_centre_id: string; p_farmer_id: string; p_slot_id: string }
        Returns: {
          arrived_at: string | null
          booked_at: string
          booking_date: string
          centre_id: string
          completed_at: string | null
          farmer_id: string
          id: string
          processing_started_at: string | null
          slot_id: string
          status: string
          token_number: number
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
