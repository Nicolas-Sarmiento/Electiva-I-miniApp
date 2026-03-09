"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-zinc-200 dark:bg-black dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              Foro Académico 
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700" 
                    />
                  )}
                  <span className="hidden sm:inline-block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Acceder
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
