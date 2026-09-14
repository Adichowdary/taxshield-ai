import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'


// Firebase Configuration for project taxshield-87bf9
const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "AIzaSy_demo",
  authDomain: "taxshield-87bf9.firebaseapp.com",
  projectId: "taxshield-87bf9",
  storageBucket: "taxshield-87bf9.firebasestorage.app",
  messagingSenderId: "499247292549",
  appId: "1:499247292549:web:5c52d78f8244ff1b0089ec"
}

// Initialize Firebase App
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

