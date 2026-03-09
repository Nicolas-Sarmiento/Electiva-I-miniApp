"use client";
import { useState, useEffect, useCallback } from "react";
import CreatePost from "@/components/CreatePost";
import Post from "@/components/Post";
import { getPosts } from "@/lib/firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // You will set these up from your Cloudinary Account!
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black dark:text-white mb-2">Feed Principal</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Comparte ideas, imágenes y conecta con otros usuarios.
        </p>
      </div>

      {user ? (
         <CreatePost 
            onPostCreated={loadPosts} 
            cloudName={cloudName} 
            uploadPreset={uploadPreset} 
         />
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 rounded-xl p-4 mb-8 text-center">
          Inicia sesión para crear una publicación.
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando publicaciones...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Post 
              key={post.id} 
              post={post} 
              onPostDeleted={loadPosts} 
              onPostUpdated={loadPosts}
              cloudName={cloudName}
              uploadPreset={uploadPreset}
            />
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
            <p className="text-zinc-500 dark:text-zinc-400">No hay publicaciones aún. ¡Sé el primero en compartir algo!</p>
          </div>
        )}
      </div>
    </div>
  );
}
