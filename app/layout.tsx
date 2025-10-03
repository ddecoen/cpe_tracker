import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CPE Tracker - Pennsylvania CPA",
  description: "Track your Continuing Professional Education hours for Pennsylvania CPA license",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
