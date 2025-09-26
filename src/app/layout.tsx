import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="pt-br" style={{ scrollBehavior: 'smooth' }}>
      <body className="font-inter bg-background-light text-dark-text">
        {children}
      </body>
    </html>
  )
}