import type React from "react"
import type { Metadata } from "next"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import "./globals.css"

export const metadata: Metadata = {
  title: "MarketAI: Tự động Sáng tạo & Phân phối Nội dung Mạng xã hội bằng AI",
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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={null}>
            {children}
          </Suspense>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
