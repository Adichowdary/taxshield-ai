/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  updatePassword
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const AuthContext = createContext()

const defaultAuthValue = {
  currentUser: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loginWithGoogle: async () => {},
  loginWithGoogleRedirect: async () => {},
  resetPassword: async () => {},
  sendVerification: () => {},
  updateUserProfile: async () => {},
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context || defaultAuthValue
}


export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase Auth state change
  useEffect(() => {
    // Check redirect auth result if user returned from Google OAuth redirect
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setCurrentUser(result.user)
      }
    }).catch((err) => {
      if (!err?.message?.includes('Database is closing')) {
        console.warn("Redirect auth error:", err)
      }
    })


    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Firebase Email & Password Registration
  const register = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    if (displayName) {
      await updateProfile(user, { displayName })
    }

    // Send Firebase email verification
    await sendEmailVerification(user, {
      url: 'https://taxshield-87bf9.firebaseapp.com/login',
      handleCodeInApp: false,
    })

    return user
  }

  // Firebase Login
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  // Firebase Google Popup Login
  const loginWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider)
  }

  // Firebase Google Redirect Login
  const loginWithGoogleRedirect = async () => {
    return await signInWithRedirect(auth, googleProvider)
  }

  // Password Reset
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email, {
      url: 'https://taxshield-87bf9.firebaseapp.com/login'
    })
  }

  // Resend Email Verification
  const sendVerification = () => {
    if (currentUser) {
      return sendEmailVerification(currentUser, {
        url: 'https://taxshield-87bf9.firebaseapp.com/login',
        handleCodeInApp: false,
      })
    }
  }

  // Update User Display Name Profile
  const updateUserProfile = async (displayName) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('taxshield_user_name', displayName)
    }
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName })
      setCurrentUser({ ...auth.currentUser, displayName })
    }
  }

  // Update password for signed-in email/password user
  const changePassword = (newPassword) => {
    if (!auth.currentUser) throw new Error('Not signed in')
    return updatePassword(auth.currentUser, newPassword)
  }

  // Logout
  const logout = () => {
    setCurrentUser(null)
    return signOut(auth).catch(() => {})
  }

  const value = {
    currentUser,
    register,
    login,
    loginWithGoogle,
    loginWithGoogleRedirect,
    resetPassword,
    sendVerification,
    updateUserProfile,
    changePassword,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
