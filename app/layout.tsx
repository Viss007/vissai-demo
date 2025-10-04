import './globals.css';

export const metadata = {
  title: 'Voice Bot Demo',
  description: 'Real-time voice conversation with OpenAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}