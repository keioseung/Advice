import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '애비의 조언',
  description: '미래의 나, 그리고 우리 아이를 위한 특별한 메시지',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500">
        {children}
      </body>
    </html>
  )
} 