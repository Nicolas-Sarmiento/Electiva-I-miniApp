import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toggleLike, getPostLikes } from "@/lib/firebase/firestore";

export default function Post({ post, onPostDeleted, onPostUpdated }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.contenido);
  
  // LIKES
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

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

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      try {
        await deleteDoc(doc(db, "posts", post.id));
        if (onPostDeleted) onPostDeleted();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el post. Puede ser un problema de permisos en Firebase. Revisa las reglas de Firestore.");
      }
    }
  };

  const handleUpdate = async () => {
    if (!editedContent.trim()) return;
    try {
      await updateDoc(doc(db, "posts", post.id), { contenido: editedContent });
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar el post. Puede ser un problema de permisos.");
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Debes iniciar sesión para dar me gusta.");
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
                onClick={() => setIsEditing(!isEditing)}
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
            // User requested to see Edit and Delete buttons on all posts for practice
            <>
              <button 
                 onClick={() => alert("Práctica: Solo el dueño puede editar este post, pero el botón está aquí como pediste.")}
                 className="text-sm px-3 py-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                 Editar (Práctica)
              </button>
              <button 
                onClick={() => alert("Práctica: Solo el dueño puede eliminar este post, pero el botón está aquí como pediste.")}
                className="text-sm px-3 py-1 text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                Eliminar (Práctica)
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
          <button 
            onClick={handleUpdate}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Guardar Cambios
          </button>
        </div>
      ) : (
        <p className="text-zinc-800 dark:text-zinc-200 mt-2 whitespace-pre-wrap">
          {post.contenido}
        </p>
      )}

      {/* Render Images if exist */}
      {post.imagenes && post.imagenes.length > 0 && (
        <div className={`mt-4 grid gap-2 ${post.imagenes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.imagenes.map((imgUrl, index) => (
             <div key={index} className="rounded-xl overflow-hidden bg-black/5 aspect-video border border-zinc-100 dark:border-zinc-800">
               <img src={imgUrl} alt="Post Attachment" className="w-full h-full object-cover" loading="lazy" />
             </div>
          ))}
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
    </div>
  );
}
