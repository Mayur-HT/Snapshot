import "./globals.css";
import type { ReactNode } from "react";
import backgroundImage from "../assets/images/capturing.jpg";
import Header from "../components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen text-gray-900" 
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0  backdrop-blur-sm"></div>
        <Header />
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 ">
          {children}
        </main>
      </body>
    </html>
  );
}
