import { Fraunces, Sora } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLA — Mentorship & Leadership Academy",
  description:
    "Learn, mentor, and lead across Nigerian higher institutions. AI Literacy and Vibe Coding courses, mentorship matching, events, and a curated digital products shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}