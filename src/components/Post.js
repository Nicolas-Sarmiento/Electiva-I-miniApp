import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toggleLike, getPostLikes } from "@/lib/firebase/firestore";
import { uploadMultipleImages } from "@/lib/cloudinary";
import Modal from "./Modal";

export default function Post({ post, onPostDeleted, onPostUpdated, cloudName, uploadPreset }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.contenido);
  const [existingImages, setExistingImages] = useState(post.imagenes || []);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  
  // MODAL
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const showAlert = (title, message) => setModalConfig({ isOpen: true, title, message, type: "alert", onConfirm: null });
  const showConfirm = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, type: "confirm", onConfirm });
  
  // LIKES
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  
  // CAROUSEL
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset carousel index if images change
  useEffect(() => {
    if (post.imagenes && currentImageIndex >= post.imagenes.length) {
      setCurrentImageIndex(Math.max(0, post.imagenes.length - 1));
    }
  }, [post.imagenes, currentImageIndex]);

  const handleNextImage = () => {
    if (post.imagenes && currentImageIndex < post.imagenes.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const isOwner = user?.uid === post.userId;

  useEffect(() => {
    const fetchLikes = async () => {
      const postLikes = await getPostLikes(post.id);
      setLikes(postLikes);
      if (user) {
        setIsLiked(postLikes.includes(user.uid));
      }
    };
    fetchLikes();
  }, [post.id, user]);

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "posts", post.id));
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showAlert("Atención", "No fue posible eliminar la publicación en este momento. Inténtalo más tarde.");
    }
  };

  const handleDelete = () => {
    showConfirm("Eliminar Publicación", "Esta acción no se puede deshacer. ¿Deseas eliminar esta publicación permanentemente?", handleDeleteConfirm);
  };
  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancelar edición: restaurar estados originales
      setEditedContent(post.contenido);
      setExistingImages(post.imagenes || []);
      setNewImages([]);
      setImagePreviews([]);
      setError("");
    }
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = existingImages.length + newImages.length;
    const availableSlots = 4 - currentTotal;
    
    let filesToAdd = files;

    if (files.length > availableSlots) {
      setError(`Aviso: Límite de 4 fotos por post. Solo se ${availableSlots === 1 ? 'añadió' : 'añadieron'} ${Math.max(0, availableSlots)} foto(s) de las seleccionadas.`);
      filesToAdd = files.slice(0, Math.max(0, availableSlots));
    } else {
      setError("");
    }

    if (filesToAdd.length > 0) {
      setNewImages([...newImages, ...filesToAdd]);
      const previews = filesToAdd.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages(newImages.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleUpdate = async () => {
    if (!editedContent.trim() && existingImages.length === 0 && newImages.length === 0) {
      setError("El post no puede estar vacío");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let finalImages = [...existingImages];

      if (newImages.length > 0) {
        if (!cloudName || !uploadPreset) {
          setError("Cloudinary no está configurado.");
          setIsSubmitting(false);
          return;
        }
        const uploadedUrls = await uploadMultipleImages(newImages, cloudName, uploadPreset);
        finalImages = [...finalImages, ...uploadedUrls];
      }

      await updateDoc(doc(db, "posts", post.id), { 
        contenido: editedContent,
        imagenes: finalImages
      });
      
      setIsEditing(false);
      setNewImages([]);
      setImagePreviews([]);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError("No fue posible guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleLike = async () => {
    if (!user) {
      showAlert("Atención", "Debes iniciar sesión para dar me gusta.");
      return;
    }
    
    // Optimistic UI update
    const previousState = isLiked;
    setIsLiked(!previousState);
    if (previousState) {
      setLikes(likes.filter(id => id !== user.uid));
    } else {
      setLikes([...likes, user.uid]);
    }

    try {
      await toggleLike(post.id, user.uid);
    } catch (error) {
       console.error("Error al dar like:", error);
       // Revert on failure
       setIsLiked(previousState);
       if (previousState) {
          setLikes([...likes, user.uid]);
       } else {
          setLikes(likes.filter(id => id !== user.uid));
       }
    }
  };

  // Format date from Firestore Timestamp
  const dateObj = post.fecha ? post.fecha.toDate() : new Date();
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 mb-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          {post.userPhoto ? (
            <img src={post.userPhoto} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {post.autorNombre ? post.autorNombre[0].toUpperCase() : "?"}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-black dark:text-white leading-tight">
              {post.autorNombre}
            </h3>
            <p className="text-xs text-zinc-500">{formattedDate}</p>
          </div>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <button 
                onClick={handleToggleEdit}
                className="text-sm px-3 py-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                 {isEditing ? "Cancelar" : "Editar"}
              </button>
              <button 
                onClick={handleDelete}
                className="text-sm px-3 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                Eliminar
              </button>
            </>
          ) : (
            // Disabled state options instead of hiding them completely
            <>
              <button 
                 onClick={() => showAlert("Acceso restringido", "Solo el autor original puede modificar esta publicación.")}
                 className="text-sm px-3 py-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                 Editar
              </button>
              <button 
                onClick={() => showAlert("Acceso restringido", "Solo el autor original puede eliminar esta publicación.")}
                className="text-sm px-3 py-1 text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-black dark:text-white mb-2"
            rows="3"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className={`mb-3 grid gap-2 ${(existingImages.length + imagePreviews.length) === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {existingImages.map((imgUrl, index) => (
                 <div key={`existing-${index}`} className="relative group rounded-xl overflow-hidden aspect-video bg-black/5 border border-zinc-200 dark:border-zinc-800">
                   <img src={imgUrl} alt="Existing" className="w-full h-full object-cover" />
                   <button 
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                   </button>
                 </div>
              ))}
              {imagePreviews.map((preview, index) => (
                 <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden aspect-video bg-black/5 border border-zinc-200 dark:border-zinc-800">
                   <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover" />
                   <button 
                    type="button"
                    onClick={() => removeNewImage(index)}
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

          <div className="flex items-center justify-between mt-2">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
                id={`edit-image-upload-${post.id}`}
              />
              <label 
                htmlFor={`edit-image-upload-${post.id}`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full cursor-pointer transition-colors"
                title="Añadir fotos"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Fotos</span>
              </label>
            </div>
            
            <button 
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-zinc-800 dark:text-zinc-200 mt-2 whitespace-pre-wrap">
          {post.contenido}
        </p>
      )}

      {/* Render Images if exist */}
      {post.imagenes && post.imagenes.length > 0 && (
        <div className="mt-4 relative rounded-xl overflow-hidden bg-black/5 aspect-video border border-zinc-100 dark:border-zinc-800 group">
          <img 
            src={post.imagenes[currentImageIndex] || post.imagenes[0]} 
            alt={`Post Attachment ${currentImageIndex + 1}`} 
            className="w-full h-full object-cover transition-opacity duration-300" 
            loading="lazy" 
          />
          
          {/* Navigation Arrows */}
          {post.imagenes.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {currentImageIndex < post.imagenes.length - 1 && (
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  aria-label="Siguiente imagen"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Dots Indicators */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {post.imagenes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                    aria-label={`Ir a la imagen ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* LIKES */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">
              {likes.length} {likes.length === 1 ? 'Me gusta' : 'Me gustas'}
            </span>
          </button>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.type === "confirm" ? "Eliminar" : "Entendido"}
      />
    </div>
  );
}
