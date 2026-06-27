// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title:       "StockSense AI — Learn Valuation. Look Up Stocks.",
  description: "An educational tool for understanding P/E, Forward P/E, and PEG ratios — with live stock lookup and analysis. For educational purposes only.",
  keywords:    ["stock valuation", "P/E ratio", "PEG ratio", "forward P/E", "stock analysis", "invest education"],
  openGraph: {
    title:       "StockSense AI",
    description: "Understand stock valuations. Look up any ticker. Educational use only.",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = localStorage.getItem('theme');
                const d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (s === 'dark' || (!s && d)) document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased min-h-screen flex flex-col`}>
        <SessionProvider>
          <Navbar />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
