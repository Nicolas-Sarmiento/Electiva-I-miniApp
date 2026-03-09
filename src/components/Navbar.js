"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "./ProfileModal";
import { updateAllUserPosts } from "@/lib/firebase/firestore";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleProfileUpdated = async (userId, newName, newPhoto) => {
    try {
      await updateAllUserPosts(userId, newName, newPhoto);
      // Posts will be naturally re-fetched if the main Feed forces a refresh, 
      // or at least next time they load. Realistically, we leave it here.
    } catch (e) {
      console.error("Error al actualizar posts del usuario:", e);
    }
  };

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
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center space-x-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 pr-3 rounded-full transition-colors group cursor-pointer"
                  title="Editar Perfil"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 group-hover:border-blue-500 transition-colors" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {(user.displayName || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                </button>
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

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        cloudName={cloudName}
        uploadPreset={uploadPreset}
        onProfileUpdated={handleProfileUpdated}
      />
    </nav>
  );
}
