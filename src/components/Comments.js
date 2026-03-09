"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addComment, getPostComments, deleteComment, updateComment } from "@/lib/firebase/firestore";
import Modal from "./Modal";

export default function Comments({ postId, postAuthorId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState("");

  // Edición
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // Modal de Sistema
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
  const showAlert = (title, message) => setModalConfig({ isOpen: true, title, message, type: "alert", onConfirm: null });
  const showConfirm = (title, message, onConfirm) => setModalConfig({ isOpen: true, title, message, type: "confirm", onConfirm });

  const loadComments = async () => {
    try {
      const fetchedComments = await getPostComments(postId);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [postId, showComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    setError("");

    try {
      const commentData = {
        userId: user.uid,
        autorNombre: user.displayName || user.email.split('@')[0],
        userPhoto: user.photoURL || null,
        contenido: newComment.trim(),
      };

      await addComment(postId, commentData);
      setNewComment("");
      
      // Reload comments to show the new one
      await loadComments();
    } catch (err) {
      console.error(err);
      setError("Error al publicar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      closeModal();
    } catch (err) {
      console.error(err);
      showAlert("Error", "No fue posible eliminar el comentario. Revisa los permisos.");
    }
  };

  const handleDelete = (commentId) => {
    showConfirm("Eliminar Comentario", "Esta acción no se puede deshacer. ¿Deseas eliminar este comentario permanentemente?", () => handleDeleteConfirm(commentId));
  };

  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editingContent.trim()) return;

    try {
      await updateComment(postId, commentId, editingContent.trim());
      setComments(comments.map(c => c.id === commentId ? { ...c, contenido: editingContent.trim() } : c));
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err) {
      console.error(err);
      showAlert("Error", "No fue posible guardar los cambios en el comentario.");
    }
  };

  return (
    <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
      {/* Toggle Comments Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-2 mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {showComments ? "Ocultar comentarios" : "Ver comentarios"}
      </button>

      {showComments && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Comments List */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-4 pt-4 pb-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-2">No hay comentarios aún. ¡Sé el primero!</p>
            ) : (
              comments.map((comment) => {
                const isCommentOwner = user?.uid === comment.userId;
                const isPostOwner = user?.uid === postAuthorId;
                
                // Formatear fecha
                const dateObj = comment.fecha ? comment.fecha.toDate() : new Date();
                const formattedDate = dateObj.toLocaleDateString("es-ES", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                });

                return (
                  <div key={comment.id} className="flex gap-3 group">
                    {/* Avatar */}
                    <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mt-1 shadow-sm">
                      {comment.userPhoto ? (
                        <img src={comment.userPhoto} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                          {comment.autorNombre ? comment.autorNombre[0].toUpperCase() : "?"}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow bg-white dark:bg-zinc-800/80 rounded-2xl rounded-tl-none px-4 py-3 border border-zinc-200 dark:border-zinc-700 shadow-sm relative transition-all">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                          {comment.autorNombre}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500">{formattedDate}</span>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <form onSubmit={(e) => handleEditSubmit(e, comment.id)} className="mt-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-blue-500/50 rounded-xl p-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[60px]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleEditSubmit(e, comment.id);
                              } else if (e.key === 'Escape') {
                                setEditingCommentId(null);
                              }
                            }}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="text-xs px-2.5 py-1.5 font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={!editingContent.trim()}
                              className="text-xs px-2.5 py-1.5 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                            >
                              Guardar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 break-words whitespace-pre-wrap leading-snug">
                          {comment.contenido}
                        </p>
                      )}

                      {/* Botones Acciones - Visibles al hacer hover */}
                      {!editingCommentId && (isCommentOwner || isPostOwner) && (
                        <div className="absolute -right-2 -top-3 flex flex-row-reverse gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Eliminar (cualquier creador del post o dueño del comentario) */}
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-red-500 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transform hover:scale-110 transition-all"
                            title="Eliminar comentario"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {/* Editar (Solo si es dueño) */}
                          {isCommentOwner && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingContent(comment.contenido);
                              }}
                              className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-blue-500 rounded-full shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transform hover:scale-110 transition-all"
                              title="Editar comentario"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* New Comment Input */}
          {user ? (
            <form onSubmit={handleSubmit} className="mt-4 flex gap-3 items-end">
              <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-1">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                    {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-grow bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-1 flex items-end transition-colors focus-within:border-blue-500 dark:focus-within:border-blue-500">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm p-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 min-h-[40px] max-h-32"
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="p-2 mb-1 mr-1 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-zinc-500 italic mt-4 text-center">Inicia sesión para comentar.</p>
          )}
          {error && <p className="text-xs text-red-500 mt-2 ml-11">{error}</p>}
        </div>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.type === "confirm" ? "Confirmar" : "Entendido"}
      />
    </div>
  );
}
