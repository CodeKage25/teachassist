import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogoMark } from '@/components/brand/Logo'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[24rem] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative text-center space-y-6 max-w-sm animate-page-in">
        <div className="flex justify-center">
          <LogoMark className="w-16 h-16 shadow-lg shadow-primary/25 rounded-2xl" />
        </div>
        <div>
          <h1 className="text-8xl font-black tracking-tight bg-gradient-to-b from-primary to-chart-4 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold mt-2 mb-2">Page not found</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
          asChild
        >
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  )
}
