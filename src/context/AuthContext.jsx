import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch extra profile data (role, etc.)
  const fetchProfile = async (userId) => {
    if (!userId) { setProfile(null); return }
    // Check if provider
    const { data: prestador } = await supabase
      .from('prestadores')
      .select('prestador_id, antecedentes_verificados')
      .eq('prestador_id', userId)
      .maybeSingle()
    setProfile({ isPrestador: !!prestador, antecedentesVerificados: prestador?.antecedentes_verificados })
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        await fetchProfile(session?.user?.id)
      } catch (err) {
        console.error('Error recuperando sesión:', err)
      } finally {
        setLoading(false)
      }
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        await fetchProfile(session?.user?.id)
        setLoading(false)
      }
    )
    return () => subscription?.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password, fullName, role) =>
    supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } }
    })

  const signOut = () => supabase.auth.signOut()

  const getRedirectPath = (userData) => {
    const u = userData || user
    if (!u) return '/login'
    if (u.email === 'admin@uniwork.com.ar') return '/app/admin'
    const role = u.user_metadata?.role
    if (role === 'provider') return '/app/dashboard-prestador'
    return '/app/dashboard-cliente'
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, getRedirectPath }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
