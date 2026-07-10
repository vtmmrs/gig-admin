import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { money, fmtDate, invoiceTotal, monthKey, today, downloadICS } from '../lib/utils'
import { CategoryChip } from '../components/Shared'
import { CalIcon, SunIcon, MoonIcon } from '../components/Icons'

const stageLabel = { lead: 'lead', confirmed: 'confirmed', played: 'played' }

export default function Dashboard() {
  const { state, dispatch } = useStore()
  const gigById = (id) => state.gigs.find((g) => g.id === id)
  const theme = state.settings.theme || 'dark'

  const d = useMemo(() => {
    const upcoming = state.gigs
      .filter((g) => ['confirmed', 'lead'].includes(g.stage) && g.date >= today())
      .sort((a, b) => a.date.localeCompare(b.date))
    const pending = state.invoices.filter((i) => i.status === 'sent')
    const unpaidTotal = pending.reduce((s, i) => s + invoiceTotal(i), 0)
    const overdueCount = pending.filter((i) => i.dueDate < today()).length
    const toInvoice = state.gigs.filter((g) => g.stage === 'played' && !g.invoiceId)
    const month = monthKey(today())
    const earned = state.invoices
      .filter((i) => i.status === 'paid' && gigById(i.gigId) && monthKey(gigById(i.gigId).date) === month)
      .reduce((s, i) => s + invoiceTotal(i), 0)
    return { upcoming, unpaidTotal, overdueCount, toInvoice, earned }
  }, [state])

  const target = state.settings.monthlyTarget
  const pct = Math.min(100, Math.round((d.earned / target) * 100))
  const next = d.upcoming.find((g) => g.stage === 'confirmed') || d.upcoming[0]

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-medium">Hey {state.settings.artistName} 👋</h1>
          <p className="muted text-xs">{new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost px-3" aria-label="Toggle day/night theme"
            onClick={() => dispatch({ type: 'updateSettings', patch: { theme: theme === 'dark' ? 'light' : 'dark' } })}>
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <button className="btn btn-ghost flex items-center gap-1 text-xs"
            onClick={() => downloadICS(state.gigs, state.invoices)}>
            <CalIcon size={14} /> .ics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link to="/money" className="card p-3 block">
          <p className="muted text-xs">This month</p>
          <p className="text-lg font-medium">{money(d.earned)}</p>
          <div className="bar-track mt-2" style={{ height: 4 }}>
            <div className="bar-fill" style={{ width: pct + '%', height: 4 }} />
          </div>
          <p className="muted text-xs mt-1">{pct}% of {money(target)}</p>
        </Link>
        <Link to="/invoices" className="card p-3 block">
          <p className="muted text-xs">Waiting on</p>
          <p className="text-lg font-medium" style={{ color: d.overdueCount ? 'var(--warn-fg)' : undefined }}>{money(d.unpaidTotal)}</p>
          <p className="muted text-xs mt-1">
            {d.overdueCount > 0 ? `${d.overdueCount} overdue — chase!` : 'no overdue invoices'}
          </p>
        </Link>
      </div>

      {next && (
        <Link to="/gigs" className="card p-4 block mb-4" style={{ border: '1px solid var(--accent-deep)' }}>
          <p className="label mb-1">Next gig</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-base font-medium">{next.title} <CategoryChip id={next.category} /></p>
              <p className="muted text-xs">{fmtDate(next.date)} · {next.location}</p>
            </div>
            <p className="text-base font-medium">{money(next.fee)}</p>
          </div>
        </Link>
      )}

      {d.toInvoice.length > 0 && (
        <Link to="/money" className="row row-warn mb-4 block">
          <p className="text-sm font-medium">{d.toInvoice.length} played gig{d.toInvoice.length > 1 ? 's' : ''} to invoice</p>
          <p className="muted text-xs">worth {money(d.toInvoice.reduce((s, g) => s + g.fee, 0))} — don't leave it on the table</p>
        </Link>
      )}

      <p className="label mb-2">Coming up</p>
      {d.upcoming.slice(0, 4).map((g) => (
        <div key={g.id} className="row mb-2 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{g.title} <CategoryChip id={g.category} /></p>
            <p className="muted text-xs">{fmtDate(g.date)} · {g.location} · {stageLabel[g.stage] || g.stage}</p>
          </div>
          <p className="text-sm font-medium">{money(g.fee)}</p>
        </div>
      ))}
      {d.upcoming.length === 0 && (
        <div className="card p-4">
          <p className="text-sm">No upcoming gigs — time to pitch 🎧</p>
          <p className="muted text-xs mt-1">Add leads in the Gigs tab to fill the pipeline.</p>
        </div>
      )}
    </div>
  )
}
