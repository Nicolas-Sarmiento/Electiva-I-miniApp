import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
 } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { exp } from "firebase/firestore/pipelines";


export async function registerWithEmailAndPassword(name,email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "usuarios", user.uid), {
        name: name,
        email: email,
        uid: user.uid,
        registryDate: new Date()
    });
    return user;
}
export async function loginWithEmailAndPassword(email, password) {
    try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }catch(error){
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
}
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try{
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    // Solo guarda si es primera vez
  const docRef = doc(db, "usuarios", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      nombre: user.displayName,
      email: user.email,
      fechaRegistro: new Date()
    });

  }
  }catch(error){
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  }
}
export async function logout() {
    try{
        await signOut(auth);
    }catch(error){
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
}