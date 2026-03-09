"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfileModal({ isOpen, onClose, cloudName, uploadPreset, onProfileUpdated }) {
  const { user, editUserProfile } = useAuth();
  
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Initialize state when modal opens
  if (isOpen && name === "" && user && !photoPreview) {
    setName(user.displayName || user.email.split('@')[0]);
    setPhotoPreview(user.photoURL || null);
  }

  if (!isOpen || !user) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await editUserProfile(name, photo, cloudName, uploadPreset);
      if (onProfileUpdated) await onProfileUpdated(user.uid, name, photoPreview);
      
      // Reset form and close
      setPhoto(null);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al actualizar el perfil.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all border border-zinc-200 dark:border-zinc-800 scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 text-center">Editar Perfil</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          
          {/* Avatar Picker */}
          <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 mx-auto relative flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-zinc-400">
                  {name ? name[0].toUpperCase() : "?"}
                </span>
              )}
              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Name Field */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre a mostrar
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Tu nombre..."
              maxLength={30}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4 text-center w-full">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                setPhotoPreview(user.photoURL);
                setName(user.displayName);
                setError("");
                onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 w-full text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 w-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex justify-center"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Guardar"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
