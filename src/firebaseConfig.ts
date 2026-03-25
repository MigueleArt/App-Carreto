// Import the functions you need from the SDKs you need
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// --- Servicios principales ---
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Crea un usuario en Firebase Auth usando una instancia secundaria de Firebase.
 * Esto evita que el admin actual sea deslogueado al llamar createUserWithEmailAndPassword.
 * 
 * @returns El UID del usuario creado en Auth
 */
export const createAuthUser = async (email: string, password: string): Promise<string> => {
  // Crear una instancia temporal de Firebase
  const secondaryApp = initializeApp(firebaseConfig, "auth-worker");
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    return uid;
  } finally {
    // Siempre eliminar la instancia secundaria
    await deleteApp(secondaryApp);
  }
};
