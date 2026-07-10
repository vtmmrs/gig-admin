import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Welcome() {
  const { dispatch } = useStore()
  const [name, setName] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: 'var(--accent-deep)', color: 'var(--on-accent-deep)', fontSize: 26 }}>
          🎛️
        </div>
        <h1 className="text-xl font-medium mb-1">Welcome to Gig Admin</h1>
        <p className="muted text-sm mb-6">Track gigs, chase invoices, hit your monthly target — all from your phone.</p>

        <input className="input mb-3 text-center" placeholder="Your artist name" value={name}
          onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-accent w-full mb-3"
          onClick={() => dispatch({ type: 'startFresh', name: name.trim() || 'Artist' })}>
          Start fresh
        </button>
        <button className="btn btn-ghost w-full"
          onClick={() => dispatch({ type: 'updateSettings', patch: { onboarded: true } })}>
          Explore with sample data
        </button>
        <p className="muted text-xs mt-4">Works without an account — sign in later (Profile → Edit) to sync across devices and get your public EPK link.</p>
      </div>
    </div>
  )
}
