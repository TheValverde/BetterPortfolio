import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingChatWidget from "@/components/FloatingChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name'} - AI Engineer & Real-Time Graphics Developer`,
  description: "Portfolio showcasing AI engineering expertise and real-time graphics development work.",
  keywords: ["AI Engineer", "Real-Time Graphics", "MCP Server", "AI Agents", "Ventuz", "Unreal Engine", "Riot Games", "NHL"],
  authors: [{ name: process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name' }],
  creator: process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourwebsite.com",
    title: `${process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name'} - AI Engineer & Real-Time Graphics Developer`,
    description: "Portfolio showcasing AI engineering expertise and real-time graphics development work.",
    siteName: `${process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name'} Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${process.env.NEXT_PUBLIC_FULL_NAME || 'Your Name'} - AI Engineer & Real-Time Graphics Developer`,
    description: "Portfolio showcasing AI engineering expertise and real-time graphics development work.",
    creator: "@YourHandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FloatingChatWidget />
      </body>
    </html>
  );
}
