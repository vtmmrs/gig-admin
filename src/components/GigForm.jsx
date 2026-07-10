import { useState } from 'react'
import { useStore } from '../store/useStore'
import { uid, today } from '../lib/utils'
import { Modal, Field } from './Shared'

const STAGES = [
  { id: 'lead', label: 'Lead' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'played', label: 'Played' },
]

export default function GigForm({ gig, onClose }) {
  const { state, dispatch } = useStore()
  const [form, setForm] = useState(
    gig || {
      id: uid(), title: '', location: '', date: today(), category: state.settings.categories[0].id,
      fee: '', stage: 'lead', contactName: '', contactEmail: '', notes: '', invoiceId: null,
    }
  )
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function save(e) {
    e.preventDefault()
    const payload = { ...form, fee: Number(form.fee) || 0 }
    dispatch({ type: gig ? 'updateGig' : 'addGig', gig: payload })
    onClose()
  }

  function pickContact(e) {
    const c = state.contacts.find((x) => x.id === e.target.value)
    if (c) setForm({ ...form, contactName: c.name.split(' ')[0], contactEmail: c.email, title: form.title || c.venue })
  }

  return (
    <Modal title={gig ? 'Edit gig' : 'New gig'} onClose={onClose}>
      <form onSubmit={save}>
        <Field label="Client / event">
          <input className="input" value={form.title} onChange={set('title')} placeholder="Club Mercury" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input className="input" type="date" value={form.date} onChange={set('date')} required />
          </Field>
          <Field label="Fee ($)">
            <input className="input" type="number" min="0" value={form.fee} onChange={set('fee')} placeholder="700" required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className="input" value={form.category} onChange={set('category')}>
              {state.settings.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Stage">
            <select className="input" value={form.stage} onChange={set('stage')}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Location">
          <input className="input" value={form.location} onChange={set('location')} placeholder="Collingwood" />
        </Field>
        {state.contacts.length > 0 && (
          <Field label="Fill contact from People">
            <select className="input" defaultValue="" onChange={pickContact}>
              <option value="" disabled>Pick a saved contact…</option>
              {state.contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.venue}</option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact name">
            <input className="input" value={form.contactName} onChange={set('contactName')} placeholder="Sam" />
          </Field>
          <Field label="Contact email">
            <input className="input" type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="sam@venue.com" />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="input" value={form.notes} onChange={set('notes')} placeholder="Set time, tech rider, parking…" />
        </Field>
        <div className="flex gap-2 mt-2">
          <button type="submit" className="btn btn-accent flex-1">{gig ? 'Save changes' : 'Add gig'}</button>
          {gig && (
            <button type="button" className="btn btn-ghost" style={{ color: 'var(--danger-fg)' }}
              onClick={() => { dispatch({ type: 'deleteGig', id: gig.id }); onClose() }}>
              Delete
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export { STAGES }
