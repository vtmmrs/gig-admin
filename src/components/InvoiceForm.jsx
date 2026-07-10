import { useState } from 'react'
import { useStore } from '../store/useStore'
import { uid, today, addDays, nextInvoiceNumber, invoiceTotal, money } from '../lib/utils'
import { Modal, Field } from './Shared'

export default function InvoiceForm({ gig, invoice, onClose }) {
  const { state, dispatch } = useStore()
  const isNew = !invoice
  const [form, setForm] = useState(
    invoice || {
      id: uid(),
      number: nextInvoiceNumber(state.invoices),
      gigId: gig.id,
      status: 'draft',
      issuedDate: today(),
      dueDate: addDays(today(), 14),
      items: [{ desc: gig.title + ' — ' + (gig.notes || 'services'), amount: gig.fee }],
      depositPct: 0,
      clause: 'Cancellation within 14 days of the event date incurs 50% of the agreed fee.',
    }
  )

  const setItem = (idx, k) => (e) => {
    const items = form.items.map((it, i) => (i === idx ? { ...it, [k]: k === 'amount' ? e.target.value : e.target.value } : it))
    setForm({ ...form, items })
  }
  const addItem = () => setForm({ ...form, items: [...form.items, { desc: '', amount: '' }] })
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  function save(status) {
    const payload = {
      ...form,
      items: form.items.map((it) => ({ desc: it.desc, amount: Number(it.amount) || 0 })),
      status,
    }
    dispatch({ type: isNew ? 'addInvoice' : 'updateInvoice', invoice: payload })
    onClose()
  }

  const total = form.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)

  return (
    <Modal title={isNew ? `New invoice ${form.number}` : `Invoice ${form.number}`} onClose={onClose}>
      <p className="muted text-xs mb-3">{gig.title} · {gig.location}</p>
      <span className="label block mb-1">Line items</span>
      {form.items.map((it, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input className="input flex-1" value={it.desc} onChange={setItem(idx, 'desc')} placeholder="Description" />
          <input className="input" style={{ width: 90 }} type="number" min="0" value={it.amount} onChange={setItem(idx, 'amount')} placeholder="$" />
          {form.items.length > 1 && (
            <button type="button" className="btn btn-ghost px-2" onClick={() => removeItem(idx)} aria-label="Remove line">–</button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-ghost w-full mb-3 text-xs" onClick={addItem}>+ add line</button>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Issued">
          <input className="input" type="date" value={form.issuedDate} onChange={(e) => setForm({ ...form, issuedDate: e.target.value })} />
        </Field>
        <Field label="Due">
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
      </div>
      <Field label="Deposit required (%)">
        <input className="input" type="number" min="0" max="100" value={form.depositPct}
          onChange={(e) => setForm({ ...form, depositPct: Number(e.target.value) || 0 })} />
      </Field>
      <Field label="Cancellation clause">
        <textarea className="input" value={form.clause} onChange={(e) => setForm({ ...form, clause: e.target.value })} />
      </Field>

      <div className="flex items-center justify-between py-3 mb-2" style={{ borderTop: '1px solid var(--line)' }}>
        <span className="muted text-sm">Total</span>
        <span className="text-lg font-medium">{money(total)}</span>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-ghost flex-1" onClick={() => save('draft')}>Save draft</button>
        <button className="btn btn-accent flex-1" onClick={() => save('sent')}>Mark as sent</button>
      </div>
      {!isNew && invoice.status !== 'paid' && (
        <button className="btn w-full mt-2" style={{ background: 'var(--ok-fg)', borderColor: 'var(--ok-fg)', color: 'var(--accent-contrast)', fontWeight: 500 }}
          onClick={() => save('paid')}>
          Mark as paid
        </button>
      )}
    </Modal>
  )
}
