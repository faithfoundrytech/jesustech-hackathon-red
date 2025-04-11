import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Remove Geist fonts
import { Poppins, Inter, Fredoka } from "next/font/google"; // Import specified fonts
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner"


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// Setup Poppins font
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700"], // Assuming Bold for headers
});

// Setup Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Include various weights if needed
});

// Setup Fredoka font
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Include various weights if needed
});

export const metadata: Metadata = {
  title: "Play The Word", // Update title
  description: "Play, Learn, Grow.", // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          className={`${poppins.variable} ${inter.variable} ${fredoka.variable} font-inter antialiased`} // Apply Inter as default body font
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
