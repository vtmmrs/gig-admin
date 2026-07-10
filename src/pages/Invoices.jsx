import { useState } from 'react'
import { useStore } from '../store/useStore'
import { money, fmtDate, invoiceTotal, today, reminderMailto } from '../lib/utils'
import { CategoryChip, StatusChip, EmptyState } from '../components/Shared'
import InvoiceForm from '../components/InvoiceForm'
import { MailIcon } from '../components/Icons'

export default function Invoices() {
  const { state } = useStore()
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('all')

  const gigById = (id) => state.gigs.find((g) => g.id === id)
  const list = state.invoices
    .map((i) => ({ inv: i, gig: gigById(i.gigId) }))
    .filter(({ gig }) => gig)
    .filter(({ inv }) => {
      if (filter === 'all') return true
      if (filter === 'overdue') return inv.status === 'sent' && inv.dueDate < today()
      return inv.status === filter
    })
    .sort((a, b) => b.inv.issuedDate.localeCompare(a.inv.issuedDate))

  const filters = ['all', 'draft', 'sent', 'overdue', 'paid']

  return (
    <div className="px-4 pt-5">
      <h1 className="text-xl font-medium mb-3">Invoices</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="btn text-xs whitespace-nowrap"
            style={filter === f ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-contrast)', minHeight: 32, padding: '4px 12px' } : { minHeight: 32, padding: '4px 12px' }}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {list.length === 0 && <EmptyState title="No invoices here" hint="Create invoices from played gigs in the Money tab." />}
      {list.map(({ inv, gig }) => {
        const overdue = inv.status === 'sent' && inv.dueDate < today()
        return (
          <div key={inv.id} role="button" tabIndex={0} className={`row w-full text-left mb-2 cursor-pointer ${overdue ? 'row-warn' : ''}`}
            onClick={() => setOpen({ invoice: inv, gig })}
            onKeyDown={(e) => e.key === 'Enter' && setOpen({ invoice: inv, gig })}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">#{inv.number} · {gig.title} <CategoryChip id={gig.category} /></p>
                <p className="muted text-xs">issued {fmtDate(inv.issuedDate)} · due {fmtDate(inv.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{money(invoiceTotal(inv))}</p>
                <StatusChip status={overdue ? 'overdue' : inv.status} />
              </div>
            </div>
            {overdue && (
              <a className="text-xs inline-flex items-center gap-1 mt-2" style={{ color: 'var(--warn-fg)' }}
                href={reminderMailto(inv, gig, state.settings)} onClick={(e) => e.stopPropagation()}>
                <MailIcon size={12} /> draft reminder email
              </a>
            )}
          </div>
        )
      })}

      {open && <InvoiceForm gig={open.gig} invoice={open.invoice} onClose={() => setOpen(null)} />}
    </div>
  )
}
