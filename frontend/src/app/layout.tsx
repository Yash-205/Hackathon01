import type { Metadata } from "next";
import "./globals.css";

// Polyfill Buffer and process for client-side libraries that expect them
if (typeof window !== "undefined") {
  if (!window.Buffer) {
    const { Buffer } = require("buffer");
    window.Buffer = Buffer;
  }
  if (!window.process) {
    window.process = require("process");
  }
}
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Chat | LangGraph Assistant",
  description:
    "A minimalistic AI chatbot powered by LangGraph and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
