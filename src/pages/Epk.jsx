import { useSearchParams, Link } from 'react-router-dom'
import { decodeShare } from '../lib/utils'
import EpkView from '../components/EpkView'

export default function Epk() {
  const [params] = useSearchParams()
  const epk = decodeShare(params.get('d') || '')

  if (!epk) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-base font-medium mb-2">This EPK link looks broken</p>
        <p className="muted text-sm mb-4">Ask the artist to share a fresh link from their profile.</p>
        <Link to="/" className="btn btn-accent inline-block">Open the app</Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <EpkView
        epk={epk}
        footer={
          <p className="muted text-center pb-4" style={{ fontSize: 10 }}>
            Powered by Gig Admin · <Link to="/" className="accent">manage your own gigs</Link>
          </p>
        }
      />
    </div>
  )
}
