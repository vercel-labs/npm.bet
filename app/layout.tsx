import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const title = "npm.bet";
const description = "visualize and compare your npm package downloads.";
const authors = [{ name: "Vercel", url: "https://vercel.com" }];
const creator = "Vercel";
const publisher = "Vercel";
const twitterHandle = "@vercel";

export const metadata: Metadata = {
  title,
  description,
  authors,
  creator,
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title,
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: title,
    locale: "en_US",
  },
  publisher,
  twitter: {
    card: "summary_large_image",
    creator: twitterHandle,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning>
    <body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NuqsAdapter>
          <Suspense>{children}</Suspense>
        </NuqsAdapter>
        <Analytics />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
