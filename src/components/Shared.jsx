import { categoryOf } from '../lib/utils'
import { useStore } from '../store/useStore'
import { XIcon } from './Icons'

export function CategoryChip({ id }) {
  const { state } = useStore()
  const cat = categoryOf(state.settings, id)
  return (
    <span className="chip" style={{ background: cat.color + '33', color: cat.color }}>
      {cat.label}
    </span>
  )
}

export function StatusChip({ status }) {
  const map = {
    draft: { bg: 'var(--line)', fg: 'var(--muted)', label: 'Draft' },
    sent: { bg: 'var(--warn-bg)', fg: 'var(--warn-fg)', label: 'Sent' },
    overdue: { bg: 'var(--danger-bg)', fg: 'var(--danger-fg)', label: 'Overdue' },
    paid: { bg: 'var(--ok-bg)', fg: 'var(--ok-fg)', label: 'Paid' },
  }
  const s = map[status] || map.draft
  return <span className="chip" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">{title}</h2>
          <button onClick={onClose} className="muted p-1" aria-label="Close"><XIcon /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="label block mb-1">{label}</span>
      {children}
    </label>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="muted text-xs">{hint}</p>
    </div>
  )
}
