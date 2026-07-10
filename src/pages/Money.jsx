import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { money, monthKey, fmtDate, fmtMonth, shiftMonth, today, daysSince, invoiceTotal, reminderMailto } from '../lib/utils'
import { CategoryChip, EmptyState } from '../components/Shared'
import InvoiceForm from '../components/InvoiceForm'
import { MailIcon, CheckIcon } from '../components/Icons'

export default function Money() {
  const { state, dispatch } = useStore()
  const [month, setMonth] = useState(monthKey(today()))
  const [invoicingGig, setInvoicingGig] = useState(null)
  const [openInvoice, setOpenInvoice] = useState(null)
  const [editTarget, setEditTarget] = useState(false)

  const gigById = (id) => state.gigs.find((g) => g.id === id)

  const d = useMemo(() => {
    const inMonth = (g) => monthKey(g.date) === month
    const paid = state.invoices.filter((i) => i.status === 'paid' && gigById(i.gigId) && inMonth(gigById(i.gigId)))
    const pending = state.invoices.filter((i) => i.status === 'sent')
    const toInvoice = state.gigs.filter((g) => g.stage === 'played' && !g.invoiceId)
    const earned = paid.reduce((s, i) => s + invoiceTotal(i), 0)
    const outstanding =
      pending.filter((i) => inMonth(gigById(i.gigId) || {})).reduce((s, i) => s + invoiceTotal(i), 0) +
      toInvoice.filter(inMonth).reduce((s, g) => s + g.fee, 0) +
      state.gigs.filter((g) => g.stage === 'confirmed' && inMonth(g)).reduce((s, g) => s + g.fee, 0)
    const nextKey = shiftMonth(month, 1)
    const projectedNext = state.gigs
      .filter((g) => ['confirmed', 'played'].includes(g.stage) && monthKey(g.date) === nextKey)
      .reduce((s, g) => s + g.fee, 0)
    return { paid, pending, toInvoice, earned, outstanding, projectedNext }
  }, [state, month])

  const target = state.settings.monthlyTarget
  const pct = Math.min(100, Math.round(((d.earned + d.outstanding) / target) * 100))

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-medium">Money</h1>
          <div className="flex items-center gap-2 text-sm muted">
            <button onClick={() => setMonth(shiftMonth(month, -1))} className="px-2 py-1" aria-label="Previous month">‹</button>
            <span>{fmtMonth(month)}</span>
            <button onClick={() => setMonth(shiftMonth(month, 1))} className="px-2 py-1" aria-label="Next month">›</button>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-medium">{money(d.earned)}</span>
          {editTarget ? (
            <input autoFocus className="input" style={{ width: 110, minHeight: 32, padding: '4px 8px' }} type="number"
              defaultValue={target}
              onBlur={(e) => { dispatch({ type: 'updateSettings', patch: { monthlyTarget: Number(e.target.value) || target } }); setEditTarget(false) }}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
          ) : (
            <button className="muted text-xs" onClick={() => setEditTarget(true)}>target {money(target)} ✎</button>
          )}
        </div>
        <div className="bar-track mt-2"><div className="bar-fill" style={{ width: pct + '%' }} /></div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="muted">+{money(d.outstanding)} booked/outstanding</span>
          <span className="accent">{pct}% of target</span>
        </div>
        <p className="muted text-xs mt-1">projected {fmtMonth(shiftMonth(month, 1)).split(' ')[0]}: {money(d.projectedNext)}</p>
      </div>

      <p className="label mb-2">To invoice</p>
      {d.toInvoice.length === 0 && <EmptyState title="Nothing to invoice" hint="Played gigs without an invoice land here." />}
      {d.toInvoice.map((g) => (
        <div key={g.id} className="row mb-2 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{g.title} <CategoryChip id={g.category} /></p>
            <p className="muted text-xs">{fmtDate(g.date)} · {g.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{money(g.fee)}</p>
            <button className="accent text-xs" onClick={() => setInvoicingGig(g)}>create invoice</button>
          </div>
        </div>
      ))}

      <p className="label mb-2 mt-5">Pending payment</p>
      {d.pending.length === 0 && <EmptyState title="No pending invoices" hint="Sent invoices appear here until paid." />}
      {d.pending.map((i) => {
        const g = gigById(i.gigId)
        if (!g) return null
        const overdue = i.dueDate < today()
        return (
          <div key={i.id} className={`row mb-2 flex justify-between items-center ${overdue ? 'row-warn' : ''}`}>
            <div>
              <p className="text-sm font-medium">{g.title} <CategoryChip id={g.category} /></p>
              <p className="muted text-xs">
                {fmtDate(g.date)} · #{i.number}{overdue ? ` · ${daysSince(i.dueDate)}d overdue` : ` · due ${fmtDate(i.dueDate)}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{money(invoiceTotal(i))}</p>
              <div className="flex gap-3 justify-end items-center">
                <a className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--warn-fg)' }}
                  href={reminderMailto(i, g, state.settings)}>
                  remind <MailIcon size={12} />
                </a>
                <button className="muted text-xs" onClick={() => setOpenInvoice({ invoice: i, gig: g })}>open</button>
              </div>
            </div>
          </div>
        )
      })}

      <p className="label mb-2 mt-5">Paid</p>
      {d.paid.length === 0 && <EmptyState title="Nothing paid yet this month" hint="Paid invoices for gigs in this month show here." />}
      {d.paid.map((i) => {
        const g = gigById(i.gigId)
        if (!g) return null
        return (
          <div key={i.id} className="row mb-2 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{g.title} <CategoryChip id={g.category} /></p>
              <p className="muted text-xs">{fmtDate(g.date)} · #{i.number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: 'var(--ok-fg)' }}>{money(invoiceTotal(i))}</p>
              <p className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--ok-fg)' }}><CheckIcon size={12} /> paid</p>
            </div>
          </div>
        )
      })}

      {invoicingGig && <InvoiceForm gig={invoicingGig} onClose={() => setInvoicingGig(null)} />}
      {openInvoice && <InvoiceForm gig={openInvoice.gig} invoice={openInvoice.invoice} onClose={() => setOpenInvoice(null)} />}
    </div>
  )
}
