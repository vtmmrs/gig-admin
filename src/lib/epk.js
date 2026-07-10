import { today, categoryOf } from './utils'

export function buildEpk(state) {
  const p = state.settings.profile
  return {
    name: state.settings.artistName,
    photoUrl: p.photoUrl || '',
    gallery: p.gallery || [],
    tagline: p.tagline,
    bio: p.bio,
    bookingEmail: p.bookingEmail,
    embed: p.embeds[0] || '',
    gear: p.gear,
    rates: p.rates,
    socials: p.socials,
    upcoming: state.gigs
      .filter((g) => g.stage === 'confirmed' && g.date >= today())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
      .map((g) => {
        const cat = categoryOf(state.settings, g.category)
        return { title: g.title, date: g.date, location: g.location, catLabel: cat.label, catColor: cat.color }
      }),
  }
}

export function profileRowToEpk(row) {
  return {
    name: row.name,
    photoUrl: row.photo_url || '',
    gallery: row.gallery || [],
    tagline: row.tagline,
    bio: row.bio,
    bookingEmail: row.booking_email,
    embed: row.embed,
    gear: row.gear,
    rates: row.rates,
    socials: row.socials || {},
    upcoming: row.upcoming || [],
  }
}

export function epkToProfileRow(userId, slug, epk) {
  return {
    user_id: userId,
    slug,
    name: epk.name,
    photo_url: epk.photoUrl,
    gallery: epk.gallery,
    tagline: epk.tagline,
    bio: epk.bio,
    booking_email: epk.bookingEmail,
    embed: epk.embed,
    gear: epk.gear,
    rates: epk.rates,
    socials: epk.socials,
    upcoming: epk.upcoming,
    updated_at: new Date().toISOString(),
  }
}
