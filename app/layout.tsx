import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NFSU Projects Database | National Forensic Sciences University',
  description: 'Official projects database of National Forensic Sciences University - Browse major and minor projects across all campuses, courses, and batches.',
  keywords: 'NFSU, National Forensic Sciences University, projects, cyber security, digital forensics, student projects',
  icons: {
    icon: '/favicon.ico',
  },
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
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-nfsu-offwhite min-h-screen">
        {children}
      </body>
    </html>
  )
}
