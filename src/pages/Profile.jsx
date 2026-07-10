import { useState } from 'react'
import { useStore } from '../store/useStore'
import { uid, encodeShare, slugify } from '../lib/utils'
import { buildEpk } from '../lib/epk'
import { useAuth } from '../components/CloudSync'
import { Field } from '../components/Shared'
import EpkView from '../components/EpkView'

const PALETTE = ['#7F77DD', '#1D9E75', '#D85A30', '#378ADD', '#D4537E', '#EF9F27', '#5DCAA5', '#85B7EB']

function AccountCard() {
  const { state, dispatch } = useStore()
  const { session, status, error, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  if (!session) {
    return (
      <div className="card p-4 mb-3">
        <p className="label mb-2">Account &amp; sync</p>
        {sent ? (
          <p className="text-sm" style={{ color: 'var(--ok-fg)' }}>Check your inbox — tap the magic link to sign in.</p>
        ) : (
          <>
            <p className="muted text-xs mb-2">Sign in to sync across devices and get your permanent public EPK link.</p>
            <input className="input mb-2" type="email" placeholder="you@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-accent w-full"
              onClick={async () => { const m = await signIn(email.trim()); m ? setErr(m) : setSent(true) }}>
              Email me a sign-in link
            </button>
            {err && <p className="text-xs mt-2" style={{ color: 'var(--danger-fg)' }}>{err}</p>}
          </>
        )}
      </div>
    )
  }

  const statusLabel = { loading: 'syncing…', synced: 'synced', error: 'sync error', local: '—' }[status]
  return (
    <div className="card p-4 mb-3">
      <p className="label mb-2">Account &amp; sync</p>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm">{session.user.email}</p>
        <span className="chip" style={status === 'error'
          ? { background: 'var(--danger-bg)', color: 'var(--danger-fg)' }
          : { background: 'var(--ok-bg)', color: 'var(--ok-fg)' }}>
          {statusLabel}
        </span>
      </div>
      {status === 'error' && <p className="text-xs mb-2" style={{ color: 'var(--danger-fg)' }}>{error}</p>}
      <Field label="Your EPK URL name">
        <input className="input" value={state.settings.slug || ''}
          onChange={(e) => dispatch({ type: 'updateSettings', patch: { slug: slugify(e.target.value) } })} />
      </Field>
      <p className="muted text-xs mb-3 break-all">
        {window.location.href.split('#')[0]}#/u/{state.settings.slug || slugify(state.settings.artistName)}
      </p>
      <button className="btn btn-ghost w-full text-xs" onClick={signOut}>Sign out</button>
    </div>
  )
}

function CategoriesEditor() {
  const { state, dispatch } = useStore()
  const cats = state.settings.categories
  const usedIds = new Set(state.gigs.map((g) => g.category))

  const update = (next) => dispatch({ type: 'updateSettings', patch: { categories: next } })

  return (
    <div className="card p-4 mb-3">
      <p className="label mb-2">Work categories</p>
      {cats.map((c, i) => (
        <div key={c.id} className="flex items-center gap-2 mb-2">
          <input type="color" value={c.color} aria-label="Category colour"
            style={{ width: 34, height: 34, border: 'none', background: 'transparent', padding: 0 }}
            onChange={(e) => update(cats.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))} />
          <input className="input flex-1" value={c.label}
            onChange={(e) => update(cats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <button className="btn btn-ghost px-3" disabled={usedIds.has(c.id)}
            title={usedIds.has(c.id) ? 'In use by gigs — reassign them first' : 'Remove'}
            style={{ color: usedIds.has(c.id) ? 'var(--muted)' : 'var(--danger-fg)', opacity: usedIds.has(c.id) ? 0.5 : 1 }}
            onClick={() => update(cats.filter((_, j) => j !== i))}>
            –
          </button>
        </div>
      ))}
      <button className="btn btn-ghost w-full text-xs"
        onClick={() => update([...cats, { id: uid(), label: 'New category', color: PALETTE[cats.length % PALETTE.length] }])}>
        + add category
      </button>
      <p className="muted text-xs mt-2">Tip for DJs: rename these to Bar / Club / Festival / Corporate if that matches your work better.</p>
    </div>
  )
}

export default function Profile() {
  const { state, dispatch } = useStore()
  const { session } = useAuth()
  const [mode, setMode] = useState('preview')
  const [copied, setCopied] = useState(false)
  const p = state.settings.profile
  const set = (k) => (e) => dispatch({ type: 'updateProfile', patch: { [k]: e.target.value } })

  async function shareEpk() {
    const base = window.location.href.split('#')[0]
    const link = session
      ? `${base}#/u/${state.settings.slug || slugify(state.settings.artistName)}`
      : `${base}#/epk?d=${encodeShare(buildEpk(state))}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${state.settings.artistName} — EPK`, url: link })
        return
      }
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      window.prompt('Copy your EPK link:', link)
    }
  }

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium">Profile</h1>
        <div className="card flex p-1 text-xs">
          {['preview', 'edit'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className="px-3 py-1 rounded-md"
              style={mode === m ? { background: 'var(--accent)', color: 'var(--accent-contrast)', fontWeight: 500 } : { color: 'var(--muted)' }}>
              {m === 'preview' ? 'Public view' : 'Edit'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'edit' ? (
        <div>
          <Field label="Artist name">
            <input className="input" value={state.settings.artistName}
              onChange={(e) => dispatch({ type: 'updateSettings', patch: { artistName: e.target.value } })} />
          </Field>
          <Field label="Tagline">
            <input className="input" value={p.tagline} onChange={set('tagline')} />
          </Field>
          <Field label="Bio (3–5 sentences — bookers scan in 30s)">
            <textarea className="input" value={p.bio} onChange={set('bio')} />
          </Field>
          <Field label="Booking email">
            <input className="input" type="email" value={p.bookingEmail} onChange={set('bookingEmail')} />
          </Field>
          <Field label="Music link (SoundCloud / YouTube / Spotify)">
            <input className="input" value={p.embeds[0] || ''}
              onChange={(e) => dispatch({ type: 'updateProfile', patch: { embeds: [e.target.value] } })}
              placeholder="https://soundcloud.com/you/mix" />
          </Field>
          <Field label="Gear">
            <textarea className="input" value={p.gear} onChange={set('gear')} />
          </Field>
          <Field label="Rates">
            <textarea className="input" value={p.rates} onChange={set('rates')} />
          </Field>
          <Field label="Instagram URL">
            <input className="input" value={p.socials.instagram}
              onChange={(e) => dispatch({ type: 'updateProfile', patch: { socials: { ...p.socials, instagram: e.target.value } } })} />
          </Field>
          <Field label="SoundCloud URL">
            <input className="input" value={p.socials.soundcloud}
              onChange={(e) => dispatch({ type: 'updateProfile', patch: { socials: { ...p.socials, soundcloud: e.target.value } } })} />
          </Field>

          <AccountCard />
          <CategoriesEditor />

          <p className="muted text-xs">Changes save automatically. The public view is your EPK — share it with bookers.</p>
        </div>
      ) : (
        <div>
          <button className="btn btn-accent w-full mb-4" onClick={shareEpk}>
            {copied ? '✓ Link copied — send it to anyone' : 'Share my EPK'}
          </button>
          <EpkView
            epk={buildEpk(state)}
            footer={
              <p className="muted text-center" style={{ fontSize: 10 }}>
                {session
                  ? 'Your EPK link is permanent — it always shows your latest profile and upcoming gigs.'
                  : 'Sign in (Edit → Account) to get a permanent EPK link that always shows your latest info.'}
              </p>
            }
          />
        </div>
      )}
    </div>
  )
}
