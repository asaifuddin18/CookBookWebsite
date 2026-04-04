import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";
import { SearchProvider } from "./components/SearchProvider";
import Providers from "./components/Providers";

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
  title: "The Saifuddin Family Cookbook",
  description: "Our family's favorite recipes, all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('cookbook-theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = stored === 'light' ? false : true;
                  if (shouldBeDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${playfair.variable} ${sourceSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <ThemeProvider>
            <SearchProvider>
              <Navbar />
              {children}
            </SearchProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
