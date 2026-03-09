"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/firebase/firestore";
import { uploadMultipleImages } from "@/lib/cloudinary";

export default function CreatePost({ onPostCreated, cloudName, uploadPreset }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!user) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - images.length;
    
    if (availableSlots <= 0) {
      setError("Ya has alcanzado el límite de 4 fotos por post.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    let filesToAdd = files;

    if (files.length > availableSlots) {
      setError(`Aviso: Límite de 4 fotos por post. Solo se añadieron ${availableSlots} foto(s) de las seleccionadas.`);
      filesToAdd = files.slice(0, availableSlots);
    } else {
      setError("");
    }

    if (filesToAdd.length > 0) {
      setImages([...images, ...filesToAdd]);
      const previews = filesToAdd.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      setError("El post no puede estar vacío");
      return;
    }

    if (!cloudName || !uploadPreset) {
      setError("Cloudinary no está configurado. Revisa tu archivo .env.local");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let imageUrls = [];
      
      // 1. Upload images to Cloudinary if they exist
      if (images.length > 0) {
        imageUrls = await uploadMultipleImages(images, cloudName, uploadPreset);
      }

      // 2. Save post to Firestore
      const newPost = {
        autorNombre: user.displayName || user.email.split('@')[0],
        userId: user.uid,
        userPhoto: user.photoURL || null,
        contenido: content,
        imagenes: imageUrls,
      };

      await createPost(newPost);
      
      // 3. Clean up form
      setContent("");
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // 4. Notify parent to refresh feed
      if (onPostCreated) onPostCreated();

    } catch (err) {
      console.error(err);
      // Muestra el mensaje de error exacto de la API o de la validación
      setError("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {(user.displayName || user.email)[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué quieres compartir en el Foro Académico uwu?"
              className="w-full bg-transparent border-none resize-none focus:ring-0 text-black dark:text-white placeholder-zinc-500 min-h-[80px]"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

        {/* Image Previews Layout */}
        {imagePreviews.length > 0 && (
          <div className={`mt-4 grid gap-2 ${imagePreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {imagePreviews.map((preview, index) => (
               <div key={index} className="relative group rounded-xl overflow-hidden aspect-video bg-black">
                 <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                 <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                 </button>
               </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label 
              htmlFor="image-upload"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Fotos</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && images.length === 0)}
            className="px-5 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
