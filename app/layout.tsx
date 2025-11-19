import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ModernNavbar } from "../components/layout/ModernNavbar";
import { ModernFooter } from "../components/layout/ModernFooter";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Showg — Shareable GitHub Developer Cards",
  description:
    "Transform your GitHub profile into beautiful, shareable developer cards with Showg.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[--background] text-[--text-primary]">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0A0A0A]">
          <ModernNavbar />
          <main className="flex-1">{children}</main>
          <ModernFooter />
        </div>
      </body>
    </html>
  );
}
