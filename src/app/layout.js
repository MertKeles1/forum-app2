import './globals.css'

export const metadata = {
  title: 'Forum Sitesi',
  description: 'Modern forum uygulaması',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  )
}