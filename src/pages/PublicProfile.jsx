import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { profileRowToEpk } from '../lib/epk'
import EpkView from '../components/EpkView'

export default function PublicProfile() {
  const { slug } = useParams()
  const [epk, setEpk] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    supabase.from('profiles').select('*').eq('slug', slug).maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) { setStatus('missing'); return }
        setEpk(profileRowToEpk(data))
        setStatus('ok')
      })
    return () => { cancelled = true }
  }, [slug])

  if (status === 'loading') {
    return <p className="muted text-center pt-16 text-sm">Loading…</p>
  }
  if (status === 'missing') {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-base font-medium mb-2">No EPK found at “{slug}”</p>
        <p className="muted text-sm mb-4">The artist may have changed their link.</p>
        <Link to="/" className="btn btn-accent inline-block">Open the app</Link>
      </div>
    )
  }
  return (
    <div className="px-4 pt-6">
      <EpkView
        epk={epk}
        footer={
          <p className="muted text-center pb-4" style={{ fontSize: 10 }}>
            Powered by Gig Admin · <Link to="/" className="accent">manage your own gigs</Link>
          </p>
        }
      />
    </div>
  )
}
