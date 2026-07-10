import { useState } from 'react'
import { useStore } from '../store/useStore'
import { money, fmtDate } from '../lib/utils'
import { CategoryChip } from '../components/Shared'
import GigForm, { STAGES } from '../components/GigForm'
import { PlusIcon, ChevronIcon } from '../components/Icons'

const SECTIONS = [
  { id: 'lead', label: 'Leads', hint: 'inquiries + negotiating' },
  { id: 'confirmed', label: 'Confirmed', hint: 'locked in' },
  { id: 'played', label: 'Played', hint: 'awaiting invoice' },
]

export default function Gigs() {
  const { state, dispatch } = useStore()
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [open, setOpen] = useState({ lead: false, confirmed: true, played: false })

  const move = (gig, stage) => dispatch({ type: 'updateGig', gig: { ...gig, stage } })

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium">Gigs</h1>
        <button className="btn btn-accent flex items-center gap-1 text-sm" onClick={() => setAdding(true)}>
          <PlusIcon size={16} /> New gig
        </button>
      </div>

      {SECTIONS.map((section) => {
        const items = state.gigs
          .filter((g) => g.stage === section.id && (section.id !== 'played' || !g.invoiceId))
          .sort((a, b) => a.date.localeCompare(b.date))
        const total = items.reduce((s, g) => s + g.fee, 0)
        const isOpen = open[section.id]
        return (
          <div key={section.id} className="mb-3">
            <button className="acc-header" onClick={() => setOpen({ ...open, [section.id]: !isOpen })}
              aria-expanded={isOpen}>
              <span className={`acc-chevron ${isOpen ? 'open' : ''}`}><ChevronIcon size={16} /></span>
              <span className="text-sm font-medium flex-1">
                {section.label}
                <span className="muted font-normal text-xs ml-2">{section.hint}</span>
              </span>
              {total > 0 && <span className="muted text-xs">{money(total)}</span>}
              <span className="count-badge">{items.length}</span>
            </button>

            {isOpen && (
              <div className="mt-2 pl-1">
                {items.length === 0 && <p className="muted text-xs px-3 py-2">Nothing here yet.</p>}
                {items.map((g) => (
                  <div key={g.id} role="button" tabIndex={0}
                    className="row mb-2 cursor-pointer"
                    onClick={() => setEditing(g)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditing(g)}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium pr-2">{g.title}</p>
                      <p className="text-sm font-medium whitespace-nowrap">{money(g.fee)}</p>
                    </div>
                    <p className="muted text-xs mt-0.5">{fmtDate(g.date)} · {g.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <CategoryChip id={g.category} />
                      <select className="muted text-xs bg-transparent" value={g.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => move(g, e.target.value)}
                        aria-label="Move stage">
                        {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <p className="muted text-xs mt-2">Mark a gig as Played and it appears in Money → “To invoice”. Invoiced gigs live in the Money and Invoices tabs.</p>

      {adding && <GigForm onClose={() => setAdding(false)} />}
      {editing && <GigForm gig={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
