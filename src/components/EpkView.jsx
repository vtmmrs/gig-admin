import { fmtDate } from '../lib/utils'
import { MailIcon } from './Icons'

function embedFor(url) {
  if (!url) return null
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%237F77DD&inverse=true`
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const id = new URL(url).searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    } catch (e) { return null }
  }
  if (url.includes('youtu.be/')) {
    return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`
  }
  if (url.includes('open.spotify.com')) {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }
  return null
}

export default function EpkView({ epk, footer }) {
  const { name, photoUrl, gallery = [], tagline, bio, bookingEmail, embed, gear, rates, socials = {}, upcoming = [] } = epk

  return (
    <div>
      <div className="card p-5 mb-4 text-center" style={{ border: '1px solid var(--accent-deep)' }}>
        {photoUrl ? (
          <img src={photoUrl} alt={name}
            className="mx-auto mb-3 rounded-full"
            style={{ width: 96, height: 96, objectFit: 'cover', border: '2px solid var(--accent-deep)' }} />
        ) : (
          <div className="mx-auto mb-3 flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, background: 'var(--accent-deep)', color: 'var(--on-accent-deep)', fontSize: 24, fontWeight: 500 }}>
            {(name || '??').slice(0, 2).toUpperCase()}
          </div>
        )}
        <h2 className="text-lg font-medium">{name}</h2>
        <p className="muted text-xs mb-3">{tagline}</p>
        {bookingEmail && (
          <a className="btn btn-accent inline-flex items-center gap-2 text-sm"
            href={`mailto:${bookingEmail}?subject=Booking inquiry — ${name}`}>
            <MailIcon size={14} /> Book {name}
          </a>
        )}
      </div>

      {bio && (
        <div className="card p-4 mb-4">
          <p className="label mb-2">About</p>
          <p className="text-sm" style={{ lineHeight: 1.6 }}>{bio}</p>
        </div>
      )}

      {embedFor(embed) && (
        <div className="card p-2 mb-4">
          <iframe title="Music player" src={embedFor(embed)} width="100%" height="140"
            frameBorder="0" allow="autoplay; encrypted-media" style={{ borderRadius: 8 }} />
        </div>
      )}

      {gallery.length > 0 && (
        <div className="card p-3 mb-4">
          <p className="label mb-2">Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((url, i) => (
              <img key={i} src={url} alt={`${name} — photo ${i + 1}`}
                className="rounded-lg w-full"
                style={{ aspectRatio: '1', objectFit: 'cover' }} loading="lazy" />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="card p-4 mb-4">
          <p className="label mb-2">Upcoming</p>
          {upcoming.map((g, i) => (
            <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--line)' }}>
              <div>
                <p className="text-sm font-medium">
                  {g.title}{' '}
                  {g.catLabel && (
                    <span className="chip" style={{ background: (g.catColor || '#8A8A99') + '33', color: g.catColor || '#8A8A99' }}>
                      {g.catLabel}
                    </span>
                  )}
                </p>
                <p className="muted text-xs">{g.location}</p>
              </div>
              <p className="muted text-xs">{fmtDate(g.date)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 mb-4">
        {gear && (
          <div className="card p-4">
            <p className="label mb-1">Gear</p>
            <p className="text-sm muted">{gear}</p>
          </div>
        )}
        {rates && (
          <div className="card p-4">
            <p className="label mb-1">Rates</p>
            <p className="text-sm muted">{rates}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center pb-2">
        {socials.instagram && <a className="accent text-xs" href={socials.instagram} target="_blank" rel="noreferrer">Instagram</a>}
        {socials.soundcloud && <a className="accent text-xs" href={socials.soundcloud} target="_blank" rel="noreferrer">SoundCloud</a>}
        {socials.youtube && <a className="accent text-xs" href={socials.youtube} target="_blank" rel="noreferrer">YouTube</a>}
      </div>
      {footer}
    </div>
  )
}
