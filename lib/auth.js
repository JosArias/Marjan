import { supabase } from './supabase'
const REDIRECT = `${window.location.origin}/Marjan/`
export const signInWithMicrosoft = () =>
  supabase.auth.signInWithOAuth({ provider: 'azure', options: { scopes: 'email profile', redirectTo: REDIRECT } })
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: REDIRECT } })
export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })
export const signOut = () => supabase.auth.signOut()
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
  return data
}
