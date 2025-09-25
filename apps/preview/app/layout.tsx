import ActionBoot from '../components/ActionBoot'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ padding: 16, fontFamily: 'ui-sans-serif' }}>
        <ActionBoot />
        {children}
      </body>
    </html>
  )
}
