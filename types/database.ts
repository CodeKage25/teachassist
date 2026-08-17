export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AttendanceStatus = 'present' | 'absent' | 'late'
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'
export type AssessmentType = 'ca' | 'exam' | 'quiz' | 'assignment'
export type ReportStatus = 'draft' | 'published'

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          location: string | null
          contact_email: string | null
          admin_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          location?: string | null
          contact_email?: string | null
          admin_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          location?: string | null
          contact_email?: string | null
          admin_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          school_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string
          role?: UserRole
          school_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          school_id?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          school_id: string
          teacher_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          school_id: string
          teacher_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          school_id?: string
          teacher_id?: string | null
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          full_name: string
          school_id: string
          classroom_id: string | null
          age: number | null
          photo_url: string | null
          parent_name: string | null
          parent_phone: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          school_id: string
          classroom_id?: string | null
          age?: number | null
          photo_url?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          school_id?: string
          classroom_id?: string | null
          age?: number | null
          photo_url?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      direct_messages: {
        Row: {
          id: string
          school_id: string
          sender_id: string
          recipient_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          sender_id: string
          recipient_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          classroom_id: string
          date: string
          status: AttendanceStatus
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          classroom_id: string
          date: string
          status: AttendanceStatus
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          classroom_id?: string
          date?: string
          status?: AttendanceStatus
          recorded_by?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          school_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      student_guardians: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          relationship: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          relationship?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
          relationship?: string | null
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          school_id: string
          classroom_id: string
          subject: string
          title: string
          type: AssessmentType
          term: string
          max_score: number
          assessed_on: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          classroom_id: string
          subject: string
          title: string
          type?: AssessmentType
          term: string
          max_score?: number
          assessed_on?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          classroom_id?: string
          subject?: string
          title?: string
          type?: AssessmentType
          term?: string
          max_score?: number
          assessed_on?: string
          created_by?: string | null
          created_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          assessment_id: string
          student_id: string
          score: number
          remark: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          student_id: string
          score: number
          remark?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          student_id?: string
          score?: number
          remark?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_reports: {
        Row: {
          id: string
          school_id: string
          student_id: string
          classroom_id: string | null
          teacher_id: string | null
          term: string
          status: ReportStatus
          summary: string | null
          strengths: Json
          focus_areas: Json
          teacher_note: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          classroom_id?: string | null
          teacher_id?: string | null
          term: string
          status?: ReportStatus
          summary?: string | null
          strengths?: Json
          focus_areas?: Json
          teacher_note?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          student_id?: string
          classroom_id?: string | null
          teacher_id?: string | null
          term?: string
          status?: ReportStatus
          summary?: string | null
          strengths?: Json
          focus_areas?: Json
          teacher_note?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      my_school_id: {
        Args: Record<string, never>
        Returns: string
      }
      my_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      attendance_status: AttendanceStatus
    }
  }
}

// Convenience types
export type School = Database['public']['Tables']['schools']['Row']
export type UserProfile = Database['public']['Tables']['users']['Row']
export type Classroom = Database['public']['Tables']['classrooms']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type DirectMessage = Database['public']['Tables']['direct_messages']['Row']

// Extended types with joins
export type ClassroomWithTeacher = Classroom & {
  teacher: Pick<UserProfile, 'id' | 'full_name'> | null
  student_count?: number
}

export type MessageWithSender = Message & {
  sender: Pick<UserProfile, 'id' | 'full_name' | 'role'>
}

export type TeacherWithClassroom = UserProfile & {
  classroom: Pick<Classroom, 'id' | 'name'> | null
}

export type DirectMessageWithSender = DirectMessage & {
  sender: Pick<UserProfile, 'id' | 'full_name' | 'role'>
}

// ─── Kcolos ──────────────────────────────────────────────────

export type StudentGuardian = Database['public']['Tables']['student_guardians']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type AssessmentResult = Database['public']['Tables']['assessment_results']['Row']
export type StudentReport = Database['public']['Tables']['student_reports']['Row']

export interface ReportResource {
  type: 'youtube' | 'reading' | 'practice'
  title: string
  url: string
}

export interface ReportFocusArea {
  area: string
  observation: string
  suggestion: string
  home_support: string
  resources: ReportResource[]
}

export type AssessmentWithResults = Assessment & {
  results: AssessmentResult[]
}

export type ReportWithStudent = StudentReport & {
  student: Pick<Student, 'id' | 'full_name' | 'photo_url'>
  classroom?: Pick<Classroom, 'id' | 'name'> | null
}
