import type { Metadata } from "next";

import "react-adblocker-detect/dist/index.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Example App for react-adblock-detect",
  description:
    "A lightweight React component that detects if an ad blocker is active in the user's browser. It allows developers to conditionally render UI elements or trigger custom actions when ad blocking is detected, enhancing user messaging or monetization strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
