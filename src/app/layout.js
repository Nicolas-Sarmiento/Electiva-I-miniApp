import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Foro Académico de Nim",
  description: "Foro para discutir sobre los temas académicos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
      >
        <AuthProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
