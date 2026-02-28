export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AttendanceStatus = 'present' | 'absent' | 'late'
export type UserRole = 'admin' | 'teacher' | 'student'

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
