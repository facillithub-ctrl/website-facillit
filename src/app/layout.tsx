import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Facillit HUB',
  description: 'Facillit Hub é um ecossistema digital integrado que unifica educação, produtividade e bem-estar.',
  icons: {
    icon: '/assets/images/LOGO/png/logoazul.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <body className="font-inter bg-background-light text-dark-text">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}