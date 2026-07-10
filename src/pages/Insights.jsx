import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { money, invoiceTotal, yearOf, categoryOf } from '../lib/utils'
import { EmptyState } from '../components/Shared'

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export default function Insights() {
  const { state } = useStore()
  const gigById = (id) => state.gigs.find((g) => g.id === id)

  const years = useMemo(() => {
    const ys = new Set(state.invoices.filter((i) => i.status === 'paid').map((i) => yearOf((gigById(i.gigId) || {}).date || '')))
    ys.delete(0)
    return [...ys].sort((a, b) => b - a)
  }, [state])

  const [year, setYear] = useState(years[0] || new Date().getFullYear())

  const d = useMemo(() => {
    const paid = state.invoices
      .map((i) => ({ inv: i, gig: gigById(i.gigId) }))
      .filter(({ inv, gig }) => inv.status === 'paid' && gig)
    const inYear = paid.filter(({ gig }) => yearOf(gig.date) === year)
    const prevYear = paid.filter(({ gig }) => yearOf(gig.date) === year - 1)
    const total = inYear.reduce((s, x) => s + invoiceTotal(x.inv), 0)
    const prevTotal = prevYear.reduce((s, x) => s + invoiceTotal(x.inv), 0)
    const bookings = state.gigs.filter((g) => yearOf(g.date) === year && ['confirmed', 'played'].includes(g.stage)).length

    const byCat = {}
    inYear.forEach(({ inv, gig }) => {
      byCat[gig.category] = byCat[gig.category] || { amount: 0, count: 0 }
      byCat[gig.category].amount += invoiceTotal(inv)
      byCat[gig.category].count += 1
    })
    const cats = Object.entries(byCat)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.amount - a.amount)

    const byMonth = Array(12).fill(0)
    inYear.forEach(({ inv, gig }) => { byMonth[Number(gig.date.slice(5, 7)) - 1] += invoiceTotal(inv) })

    return { total, prevTotal, bookings, cats, byMonth }
  }, [state, year])

  const maxCat = d.cats[0]?.amount || 1
  const maxMonth = Math.max(...d.byMonth, 1)
  const delta = d.prevTotal ? Math.round(((d.total - d.prevTotal) / d.prevTotal) * 100) : null
  const topCat = d.cats[0] ? categoryOf(state.settings, d.cats[0].id).label : '—'

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium">Insights</h1>
        <div className="card flex p-1 text-xs">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className="px-3 py-1 rounded-md"
              style={y === year ? { background: 'var(--accent)', color: 'var(--accent-contrast)', fontWeight: 500 } : { color: 'var(--muted)' }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card p-3">
          <p className="muted text-xs">Total earned</p>
          <p className="text-lg font-medium">{money(d.total)}</p>
          {delta !== null && (
            <p className="text-xs" style={{ color: delta >= 0 ? 'var(--ok-fg)' : 'var(--danger-fg)' }}>
              {delta >= 0 ? '+' : ''}{delta}% vs {year - 1}
            </p>
          )}
        </div>
        <div className="card p-3">
          <p className="muted text-xs">Bookings</p>
          <p className="text-lg font-medium">{d.bookings}</p>
          <p className="muted text-xs">most booked: {topCat}</p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <p className="label mb-3">Earnings by category</p>
        {d.cats.length === 0 && <EmptyState title="No paid gigs yet" hint="Mark invoices as paid to see the breakdown." />}
        {d.cats.map((c) => {
          const cat = categoryOf(state.settings, c.id)
          return (
            <div key={c.id} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span>{cat.label} · {c.count}</span>
                <span>{money(c.amount)}</span>
              </div>
              <div className="bar-track" style={{ height: 8 }}>
                <div style={{ width: (c.amount / maxCat) * 100 + '%', height: 8, background: cat.color, borderRadius: 4 }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card p-4">
        <p className="label mb-3">Month by month</p>
        <div className="flex items-end gap-1" style={{ height: 72 }}>
          {d.byMonth.map((v, i) => (
            <div key={i} className="flex-1 rounded-sm"
              style={{
                height: Math.max(4, (v / maxMonth) * 100) + '%',
                background: v > 0 ? 'var(--accent)' : 'var(--line)',
                opacity: v > 0 ? 0.55 + 0.45 * (v / maxMonth) : 1,
              }}
              title={money(v)} />
          ))}
        </div>
        <div className="flex justify-between muted mt-1" style={{ fontSize: 10 }}>
          {MONTHS.map((m, i) => <span key={i} className="flex-1 text-center">{m}</span>)}
        </div>
      </div>
    </div>
  )
}
