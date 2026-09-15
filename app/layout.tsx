import { Fraunces, Sora } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FloatingContact } from "@/components/floating-contact";
import { RegistrationPopup } from "@/components/registration-popup";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0A0806",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MLA — Mentorship & Leadership Academy",
  description:
    "Learn, mentor, and lead across Nigerian higher institutions and independent learning networks. AI Literacy and Vibe Coding courses, mentorship matching, events, and a curated digital products shop.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MLA Academy",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon.svg" },
    ],
  },
  applicationName: "MLA Academy",
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className={`${fraunces.variable} ${sora.variable} flex min-h-screen flex-col antialiased bg-[#0A0806] text-parchment selection:bg-gold/30 selection:text-gold-light`}>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <RegistrationPopup />
        <FloatingContact />
      </body>
    </html>
  );
}