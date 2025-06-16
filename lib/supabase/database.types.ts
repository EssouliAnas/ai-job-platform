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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          user_type: 'individual' | 'company'
          company_id: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          user_type?: 'individual' | 'company'
          company_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          user_type?: 'individual' | 'company'
          company_id?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          industry: string | null
          size: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          content: Json
          feedback: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: Json
          feedback?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: Json
          feedback?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          title: string
          description: string
          required_skills: string[]
          location: string
          job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
          salary_range: string | null
          company_id: string
          status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          required_skills: string[]
          location: string
          job_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
          salary_range?: string | null
          company_id: string
          status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          required_skills?: string[]
          location?: string
          job_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
          salary_range?: string | null
          company_id?: string
          status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          id: string
          job_id: string
          applicant_id: string
          resume_url: string
          cover_letter_url: string | null
          status: 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
          matching_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          applicant_id: string
          resume_url: string
          cover_letter_url?: string | null
          status?: 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
          matching_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          applicant_id?: string
          resume_url?: string
          cover_letter_url?: string | null
          status?: 'NEW' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
          matching_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 