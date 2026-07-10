import { createContext, useContext, useEffect, useReducer } from 'react'
import { seed } from '../data/seed'
import { slugify } from '../lib/utils'

const KEY = 'gig-admin-v1'
const StoreCtx = createContext(null)

function migrate(s) {
  const merged = { ...s }
  merged.gigs = (s.gigs || []).map((g) =>
    g.stage === 'inquiry' || g.stage === 'negotiating' ? { ...g, stage: 'lead' } : g
  )
  merged.contacts = s.contacts || seed.contacts
  merged.settings = { ...seed.settings, ...s.settings }
  if (!merged.settings.theme) merged.settings.theme = 'dark'
  if (!merged.settings.currency || merged.settings.currency === 'EUR') merged.settings.currency = 'AUD'
  if (merged.settings.onboarded === undefined) merged.settings.onboarded = true
  if (!merged.settings.slug) merged.settings.slug = slugify(merged.settings.artistName)
  return merged
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return migrate(JSON.parse(raw))
  } catch (e) { /* corrupted storage → reseed */ }
  return seed
}

function reducer(state, action) {
  switch (action.type) {
    case 'addGig':
      return { ...state, gigs: [...state.gigs, action.gig] }
    case 'updateGig':
      return { ...state, gigs: state.gigs.map((g) => (g.id === action.gig.id ? { ...g, ...action.gig } : g)) }
    case 'deleteGig':
      return {
        ...state,
        gigs: state.gigs.filter((g) => g.id !== action.id),
        invoices: state.invoices.filter((i) => i.gigId !== action.id),
      }
    case 'addInvoice':
      return {
        ...state,
        invoices: [...state.invoices, action.invoice],
        gigs: state.gigs.map((g) => (g.id === action.invoice.gigId ? { ...g, invoiceId: action.invoice.id } : g)),
      }
    case 'updateInvoice':
      return { ...state, invoices: state.invoices.map((i) => (i.id === action.invoice.id ? { ...i, ...action.invoice } : i)) }
    case 'addContact':
      return { ...state, contacts: [...state.contacts, action.contact] }
    case 'updateContact':
      return { ...state, contacts: state.contacts.map((c) => (c.id === action.contact.id ? { ...c, ...action.contact } : c)) }
    case 'deleteContact':
      return { ...state, contacts: state.contacts.filter((c) => c.id !== action.id) }
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'updateProfile':
      return { ...state, settings: { ...state.settings, profile: { ...state.settings.profile, ...action.patch } } }
    case 'hydrate':
      return migrate(action.state)
    case 'startFresh':
      return {
        gigs: [],
        invoices: [],
        contacts: [],
        settings: {
          ...seed.settings,
          artistName: action.name,
          slug: slugify(action.name),
          onboarded: true,
          profile: {
            ...seed.settings.profile,
            tagline: '', bio: '', bookingEmail: '', embeds: [''],
            gear: '', rates: '',
            socials: { instagram: '', soundcloud: '', youtube: '' },
          },
        },
      }
    case 'reset':
      return seed
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* storage full */ }
  }, [state])
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)
