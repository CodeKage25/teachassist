'use client'

import { useState } from 'react'
import { updateSchool } from '@/lib/actions/school'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2, MapPin, Mail, Save } from 'lucide-react'
import type { School } from '@/types/database'
import Image from 'next/image'

interface Props {
  school: School
}

export function SettingsClient({ school }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateSchool(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('School settings saved!')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* School Logo */}
      {school.logo_url && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-bold mb-4">School Logo</h2>
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-border">
            <Image
              src={school.logo_url}
              alt="School logo"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      {/* School Info */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-bold mb-6">School Information</h2>
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">School name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                defaultValue={school.name}
                required
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                name="location"
                defaultValue={school.location ?? ''}
                placeholder="City, Country"
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={school.contact_email ?? ''}
                placeholder="info@school.edu"
                className="h-11 pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
