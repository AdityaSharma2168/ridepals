import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CollegeProvider } from "@/contexts/college-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ridepals.ai - Bay Area College Ridesharing",
  description:
    "Share rides with verified college peers across the Bay Area, save money, and support local businesses with purposeful pit stops.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CollegeProvider>{children}</CollegeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
