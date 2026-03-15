import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/styles/globals.css'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Blog'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''
const AUTHOR = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Ian'

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Personal blog by ${AUTHOR}`,
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Inline script to apply theme before first paint.
          Prevents flash of wrong theme (FOUC).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
