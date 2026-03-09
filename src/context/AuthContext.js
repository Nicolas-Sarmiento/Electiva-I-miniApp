"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup,
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in with Email:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        // Force refresh user state with the new name
        setUser({ ...userCredential.user });
      }
      return userCredential;
    } catch (error) {
      console.error("Error registering with Email:", error);
      throw error;
    }
  };

  const editUserProfile = async (newName, newPhotoFile, cloudName, uploadPreset) => {
    try {
      if (!user) throw new Error("No hay usuario autenticado.");
      
      let photoURL = user.photoURL;

      // Si subieron una nueva foto, súbela a Cloudinary primero
      if (newPhotoFile) {
        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary no está configurado.");
        }
        // Importación dinámica para evitar dependencias circulares / problemas de servidor
        const { uploadImageToCloudinary } = await import("@/lib/cloudinary");
        photoURL = await uploadImageToCloudinary(newPhotoFile, cloudName, uploadPreset);
      }

      // Actualizar perfil en Firebase Auth
      await updateProfile(user, {
        displayName: newName || user.displayName,
        photoURL: photoURL
      });

      // Forzar recarga del estado local del usuario para reflejar cambios
      setUser({ ...user });
      
      return photoURL; // Útil para actualizar posts antiguos luego
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginWithGoogle,
      loginWithEmail, 
      registerWithEmail, 
      editUserProfile,
      logout, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
