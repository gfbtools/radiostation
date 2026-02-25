import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { PlayerProvider } from '@/components/player-provider'
import { PlayerBar } from '@/components/player-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DJ Platform - Share Your Mixes',
  description: 'A social platform for DJs to share and discover mixes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PlayerProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50 pb-24">
            {children}
          </main>
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  )
}
