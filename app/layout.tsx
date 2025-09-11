import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/stores/auth-store'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Linkfy.',
  description: 'Linkfy. bir Deniz Aksoy Medya projesidir.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Bebas+Neue&family=Press+Start+2P&family=Fredoka+One&family=Rajdhani:wght@300;400;500;600;700&family=Righteous&family=Creepster&family=Bangers&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
