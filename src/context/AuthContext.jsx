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
  loginAsDemo: async () => {},
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


    // Check for demo session if offline or testing
    const storedDemo = typeof localStorage !== 'undefined' ? localStorage.getItem('taxshield_demo_session') : null
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo)
        if (parsed?.uid) {
          setCurrentUser(parsed)
          setLoading(false)
        }
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        const demo = typeof localStorage !== 'undefined' ? localStorage.getItem('taxshield_demo_session') : null
        if (demo) {
          try {
            setCurrentUser(JSON.parse(demo))
          } catch {
            setCurrentUser(null)
          }
        } else {
          setCurrentUser(null)
        }
      }
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

  // Demo login for quick testing & instant review
  const loginAsDemo = async () => {
    const demoUser = {
      uid: 'demo-executive-user-001',
      email: 'alex.morgan@taxshield.ai',
      displayName: 'Alex Morgan',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
      emailVerified: true,
      isDemo: true
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('taxshield_demo_session', JSON.stringify(demoUser))
      localStorage.setItem('taxshield_user_name', 'Alex Morgan')
    }
    setCurrentUser(demoUser)
    return demoUser
  }

  // Logout
  const logout = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('taxshield_demo_session')
    }
    setCurrentUser(null)
    return signOut(auth).catch(() => {})
  }

  const value = {
    currentUser,
    register,
    login,
    loginAsDemo,
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
