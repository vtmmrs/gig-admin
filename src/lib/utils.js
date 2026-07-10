export const uid = () => Math.random().toString(36).slice(2, 10)

export function slugify(name) {
  return (name || 'artist')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'artist'
}

export function encodeShare(obj) {
  const json = JSON.stringify(obj)
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShare(str) {
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch (e) {
    return null
  }
}

export const money = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Math.round(n))

export const today = () => new Date().toISOString().slice(0, 10)

export const monthKey = (dateStr) => dateStr ? dateStr.slice(0, 7) : ''

export const yearOf = (dateStr) => dateStr ? Number(dateStr.slice(0, 4)) : 0

export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

export function fmtMonth(key) {
  const d = new Date(key + '-01T00:00:00')
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function daysSince(dateStr) {
  const ms = new Date(today() + 'T00:00:00') - new Date(dateStr + 'T00:00:00')
  return Math.floor(ms / 86400000)
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function nextInvoiceNumber(invoices) {
  const year = new Date().getFullYear()
  const nums = invoices
    .filter((i) => i.number.startsWith(String(year)))
    .map((i) => Number(i.number.split('-')[1]) || 0)
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${year}-${String(next).padStart(3, '0')}`
}

export const invoiceTotal = (inv) =>
  inv.items.reduce((s, it) => s + (Number(it.amount) || 0), 0)

export function categoryOf(settings, id) {
  return settings.categories.find((c) => c.id === id) || { id, label: id, color: '#8A8A99' }
}

export function reminderMailto(inv, gig, settings) {
  const subject = encodeURIComponent(`Friendly reminder — invoice ${inv.number} (${gig.title})`)
  const body = encodeURIComponent(
    `Hi ${gig.contactName || 'there'},\n\n` +
    `Hope you're doing well! Just a quick nudge about invoice ${inv.number} for ${gig.title}` +
    ` on ${fmtDate(gig.date)} (${money(invoiceTotal(inv))}), which was due on ${fmtDate(inv.dueDate)}.\n\n` +
    `Let me know if anything is missing on my end.\n\nThanks!\n${settings.artistName}`
  )
  return `mailto:${gig.contactEmail || ''}?subject=${subject}&body=${body}`
}

export function downloadICS(gigs, invoices) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GigAdmin//EN']
  gigs
    .filter((g) => ['confirmed', 'played'].includes(g.stage))
    .forEach((g) => {
      const d = g.date.replace(/-/g, '')
      lines.push(
        'BEGIN:VEVENT',
        `UID:gig-${g.id}@gigadmin`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${d}`,
        `SUMMARY:${g.title} (${g.category})`,
        `LOCATION:${g.location || ''}`,
        `DESCRIPTION:Fee ${money(g.fee)}`,
        'END:VEVENT'
      )
    })
  invoices
    .filter((i) => i.status === 'sent')
    .forEach((i) => {
      const d = i.dueDate.replace(/-/g, '')
      lines.push(
        'BEGIN:VEVENT',
        `UID:inv-${i.id}@gigadmin`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${d}`,
        `SUMMARY:💸 Payment due — invoice ${i.number}`,
        'END:VEVENT'
      )
    })
  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'gig-admin.ics'
  a.click()
  URL.revokeObjectURL(a.href)
}
