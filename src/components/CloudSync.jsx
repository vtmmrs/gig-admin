import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase, slugify } from '../lib/supabase'
import { buildEpk, epkToProfileRow } from '../lib/epk'
import { useStore } from '../store/useStore'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const { state, dispatch } = useStore()
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('local')
  const [error, setError] = useState('')
  const hydrated = useRef(false)
  const timer = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      hydrated.current = false
      setStatus('local')
      return
    }
    let cancelled = false
    setStatus('loading')
    supabase.from('user_data').select('data').eq('user_id', session.user.id).maybeSingle()
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) { setStatus('error'); setError(err.message); return }
        if (data?.data) {
          dispatch({ type: 'hydrate', state: data.data })
        }
        hydrated.current = true
        setStatus('synced')
      })
    return () => { cancelled = true }
  }, [session?.user?.id])

  useEffect(() => {
    if (!session || !hydrated.current) return
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const uid = session.user.id
      const slug = state.settings.slug || slugify(state.settings.artistName)
      const { error: e1 } = await supabase.from('user_data')
        .upsert({ user_id: uid, data: state, updated_at: new Date().toISOString() })
      const { error: e2 } = await supabase.from('profiles')
        .upsert(epkToProfileRow(uid, slug, buildEpk(state)))
      if (e1 || e2) {
        const msg = (e1 || e2).message
        setStatus('error')
        setError(msg.includes('duplicate') || msg.includes('unique')
          ? 'That EPK URL name is taken — pick another in Profile → Edit.'
          : msg)
      } else {
        setStatus('synced')
        setError('')
      }
    }, 1200)
    return () => clearTimeout(timer.current)
  }, [state, session])

  async function signIn(email) {
    const emailRedirectTo = window.location.origin + window.location.pathname
    const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
    return err ? err.message : null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthCtx.Provider value={{ session, status, error, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
