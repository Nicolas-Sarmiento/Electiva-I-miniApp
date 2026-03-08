import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";

// --- POSTS CRUD ---

export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...postData,
      fecha: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post: ", error);
    throw error;
  }
};

export const getPosts = async () => {
  try {
    const q = query(collection(db, "posts"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting posts: ", error);
    throw error;
  }
};

export const updatePost = async (postId, updatedData) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, updatedData);
  } catch (error) {
    console.error("Error updating post: ", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Error deleting post: ", error);
    throw error;
  }
};

// --- LIKES SYSTEM ---

export const toggleLike = async (postId, userId) => {
  try {
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const likeDoc = await getDoc(likeRef);

    if (likeDoc.exists()) {
      // User already liked it, so remove the like
      await deleteDoc(likeRef);
      return false; // Returns false to indicate "unliked"
    } else {
      // User hasn't liked it, so add the like
      await setDoc(likeRef, { timestamp: serverTimestamp() });
      return true; // Returns true to indicate "liked"
    }
  } catch (error) {
    console.error("Error toggling like: ", error);
    throw error;
  }
};

export const getPostLikes = async (postId) => {
  try {
    const likesRef = collection(db, "posts", postId, "likes");
    const likesSnapshot = await getDocs(likesRef);
    return likesSnapshot.docs.map(doc => doc.id); // Return array of userIds who liked
  } catch (error) {
    console.error("Error getting likes: ", error);
    return [];
  }
};
