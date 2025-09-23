import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

// Fonts are loaded via CSS @import to avoid hydration issues

export const metadata: Metadata = {
  title: "SuiDentity - AI-Powered On-Chain Identity",
  description: "Build your Web3 reputation with AI-powered identity scoring on Sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
