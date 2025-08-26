import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Zifala Distance App",
  description: "Compute great-circle distances between countries",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="container mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}

