'use client'

import { useState, useRef } from 'react'
import { uploadStudentPhoto } from '@/lib/actions/students'
import { toast } from 'sonner'
import { Loader2, Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface StudentPhotoUploadProps {
  studentId: string
  currentPhotoUrl: string | null
  studentName: string
}

export function StudentPhotoUpload({
  studentId,
  currentPhotoUrl,
  studentName,
}: StudentPhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set('student_id', studentId)
    formData.set('photo', file)

    setLoading(true)
    const result = await uploadStudentPhoto(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.url) {
      setPhotoUrl(result.url)
      toast.success('Photo updated')
    }
  }

  return (
    <div
      className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group"
      onClick={() => inputRef.current?.click()}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={studentName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-700 font-bold text-xl">{getInitials(studentName)}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {loading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
