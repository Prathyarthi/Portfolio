import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/query-provider";
import { GlobalFooter } from "@/components/global-footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foliofy - Build Your Portfolio in Minutes",
  description:
    "Create a beautiful portfolio, deploy it instantly, and share a public link with recruiters. Import from GitHub, LeetCode, and your resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col">{children}</div>
            <GlobalFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
