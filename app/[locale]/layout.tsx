import type React from "react"
import type { Metadata } from "next"

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'

import "./globals.css"


const fontSans = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans', display: 'swap' })
export const metadata: Metadata = {
  title: "Omnia: Tự động Sáng tạo & Phân phối Nội dung Mạng xã hội bằng AI",
  description:
    "Biến một nguồn duy nhất thành hàng loạt nội dung đa phương tiện và lên lịch đăng bài chỉ trong vài phút.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string }
}>) {

  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className={`font-sans ${fontSans.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={null}>
            {children}
          </Suspense>
          <Toaster theme="dark" richColors position="bottom-left"/>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
