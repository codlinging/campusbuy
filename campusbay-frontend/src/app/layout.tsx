import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusBay",
  description: "The inter-university student marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ADD THE CLASSES HERE 👇 */}
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}