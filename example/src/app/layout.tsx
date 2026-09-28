import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import "react-adblocker-detect/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "react-adblocker-detect — live demo",
  description:
    "Detect ad blockers in React and ask visitors to disable them, with a built-in modal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Analytics packageName="react-adblocker-detect" />
      </body>
    </html>
  );
}
