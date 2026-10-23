import { Poppins } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FloatingContact } from "@/components/floating-contact";
import { AppProviders } from "@/components/providers/app-providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#140F47",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MLA — Mentorship & Leadership Academy",
  description:
    "We solve business and career problems with technology. Applied AI literacy, verified 1-on-1 industry mentorship, and licensed digital toolkits across Nigeria.",
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className={`${poppins.variable} font-sans flex min-h-screen flex-col antialiased bg-[#FAFAFD] text-slate-800 selection:bg-cyan-400 selection:text-slate-950`}>
        <AppProviders>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingContact />
        </AppProviders>
      </body>
    </html>
  );
}