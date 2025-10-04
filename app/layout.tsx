import './globals.css'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/voice">Voice</a>
            <a href="/api/healthz" target="_blank" rel="noreferrer">/api/healthz</a>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  )
}