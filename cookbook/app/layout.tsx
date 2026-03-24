import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";
import { SearchProvider } from "./components/SearchProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cookbook — Share & Discover Recipes",
  description: "Discover, share, and save your favorite recipes. Build your personal collection and explore dishes from around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('cookbook-theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = stored === 'dark' || (!stored && systemDark);
                  if (shouldBeDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${playfair.variable} ${sourceSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SearchProvider>
            <Navbar />
            {children}
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
