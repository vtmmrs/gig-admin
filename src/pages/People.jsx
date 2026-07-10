import { useState } from 'react'
import { useStore } from '../store/useStore'
import { uid } from '../lib/utils'
import { Modal, Field, EmptyState } from '../components/Shared'
import { PlusIcon, MailIcon, SearchIcon } from '../components/Icons'

function Avatar({ contact, size = 48 }) {
  if (contact.photoUrl) {
    return (
      <img src={contact.photoUrl} alt={contact.name} width={size} height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none' }} />
    )
  }
  const initials = contact.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="flex items-center justify-center rounded-full"
      style={{ width: size, height: size, background: 'var(--accent-deep)', color: 'var(--on-accent-deep)', fontWeight: 500, fontSize: size / 3 }}>
      {initials}
    </div>
  )
}

function ContactForm({ contact, onClose }) {
  const { dispatch } = useStore()
  const [form, setForm] = useState(
    contact || { id: uid(), name: '', role: '', venue: '', city: '', email: '', phone: '', photoUrl: '', instagram: '', notes: '' }
  )
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function save(e) {
    e.preventDefault()
    dispatch({ type: contact ? 'updateContact' : 'addContact', contact: form })
    onClose()
  }

  return (
    <Modal title={contact ? 'Edit contact' : 'New contact'} onClose={onClose}>
      <form onSubmit={save}>
        <Field label="Name">
          <input className="input" value={form.name} onChange={set('name')} placeholder="Sam Okafor" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <input className="input" value={form.role} onChange={set('role')} placeholder="Booker / promoter" />
          </Field>
          <Field label="Venue / company">
            <input className="input" value={form.venue} onChange={set('venue')} placeholder="Club Mercury" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input className="input" value={form.city} onChange={set('city')} placeholder="Collingwood" />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="+61…" />
          </Field>
        </div>
        <Field label="Email">
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="sam@venue.com" />
        </Field>
        <Field label="Photo URL (so you recognise them on arrival)">
          <input className="input" value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://…/photo.jpg" />
        </Field>
        <Field label="Instagram URL">
          <input className="input" value={form.instagram} onChange={set('instagram')} placeholder="https://instagram.com/…" />
        </Field>
        <Field label="Notes (payment habits, tech, quirks)">
          <textarea className="input" value={form.notes} onChange={set('notes')} />
        </Field>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="btn btn-accent flex-1">{contact ? 'Save changes' : 'Add contact'}</button>
          {contact && (
            <button type="button" className="btn btn-ghost" style={{ color: 'var(--danger-fg)' }}
              onClick={() => { dispatch({ type: 'deleteContact', id: contact.id }); onClose() }}>
              Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function People() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)

  const gigCount = (c) => state.gigs.filter((g) => g.contactEmail && g.contactEmail === c.email).length

  const list = state.contacts
    .filter((c) => {
      const hay = `${c.name} ${c.venue} ${c.role} ${c.city}`.toLowerCase()
      return hay.includes(q.toLowerCase())
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium">People</h1>
        <button className="btn btn-accent flex items-center gap-1 text-sm" onClick={() => setAdding(true)}>
          <PlusIcon size={16} /> Add
        </button>
      </div>

      <div className="relative mb-4">
        <span className="absolute muted" style={{ left: 12, top: 12 }}><SearchIcon size={16} /></span>
        <input className="input" style={{ paddingLeft: 36 }} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, venue, city…" />
      </div>

      {list.length === 0 && (
        <EmptyState title="No contacts yet" hint="Add promoters, bookers and venue managers so touring-you knows who to look for." />
      )}
      {list.map((c) => {
        const n = gigCount(c)
        return (
          <div key={c.id} role="button" tabIndex={0} className="row mb-2 cursor-pointer flex items-center gap-3"
            onClick={() => setEditing(c)} onKeyDown={(e) => e.key === 'Enter' && setEditing(c)}>
            <Avatar contact={c} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              <p className="muted text-xs truncate">{[c.role, c.venue].filter(Boolean).join(' · ')}{c.city ? ` · ${c.city}` : ''}</p>
              {c.notes && <p className="muted text-xs truncate mt-0.5">{c.notes}</p>}
            </div>
            <div className="text-right shrink-0">
              {n > 0 && <p className="accent text-xs mb-1">{n} gig{n > 1 ? 's' : ''}</p>}
              {c.email && (
                <a className="btn btn-ghost px-2 inline-flex" style={{ minHeight: 32 }} aria-label={`Email ${c.name}`}
                  href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()}>
                  <MailIcon size={14} />
                </a>
              )}
            </div>
          </div>
        )
      })}

      <p className="muted text-xs mt-3">v2 will scan your email/socials to suggest contacts automatically — for now, add them as you book.</p>

      {adding && <ContactForm onClose={() => setAdding(false)} />}
      {editing && <ContactForm contact={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
