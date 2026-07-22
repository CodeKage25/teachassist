'use client'

import { useState } from 'react'
import { createSchool } from '@/lib/actions/school'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Loader2, MapPin, Mail, ArrowRight } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'

export function SchoolSetupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createSchool(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted/50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <LogoMark className="w-16 h-16 mx-auto mb-6 shadow-lg shadow-primary/25 rounded-2xl" />
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Set up your school
          </h1>
          <p className="text-muted-foreground">
            You&apos;re almost done! Tell us a little about your school.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl shadow-foreground/5 p-8">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">School name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Greenwood Academy"
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
                  type="text"
                  placeholder="Lagos, Nigeria"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">School contact email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="info@greenwood.edu"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create my school
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can update these details anytime from your school settings.
        </p>
      </div>
    </div>
  )
}
