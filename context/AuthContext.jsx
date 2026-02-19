import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentUserProfile } from '../lib/auth'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      session?.user ? loadProfile() : setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) await loadProfile()
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile() {
    try { setProfile(await getCurrentUserProfile()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <Ctx.Provider value={{
      user, profile, loading,
      role: profile?.role ?? null,
      isAdmin: profile?.role === 'Admin',
      isPM: profile?.role === 'ProjectManager',
      isExec: profile?.role === 'Executive',
      refreshProfile: loadProfile,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
