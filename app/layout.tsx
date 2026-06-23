import type { Metadata } from "next";
import { JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/query-provider";
import { GlobalFooter } from "@/components/global-footer";
import { siteConfig } from "@/lib/site";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} - Build Your Portfolio in Minutes`,
  description:
    "Create a beautiful portfolio, deploy it instantly, and share a public link with recruiters. Import from GitHub, LeetCode, and your resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
