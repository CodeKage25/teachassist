import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-8xl font-black text-indigo-100">404</h1>
          <h2 className="text-2xl font-bold -mt-4 mb-2">Page not found</h2>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  )
}
