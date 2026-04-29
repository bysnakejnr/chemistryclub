import { Link } from 'react-router-dom'
import type { ClubEvent } from '../types'
import defaultEventCover from '../assets/default-event-cover.svg'
import defaultEventCoverDark from '../assets/default-event-cover-dark.svg'
import { isDarkMode } from '../utils/theme'

interface EventCardProps {
  event: ClubEvent
}

export function EventCard({ event }: EventCardProps) {
  const date = event.date ? new Date(event.date) : null
  const formatted = date ? date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'Date not specified'
  
  // Use theme-aware default cover if no cover image is provided
  const coverImage = event.coverImageUrl || (isDarkMode() ? defaultEventCoverDark : defaultEventCover)

  return (
    <Link
      to={`/events/${event.id}`}
      className="event-card"
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid rgba(148, 163, 184, 0.6)',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          position: 'relative',
          paddingBottom: '52%',
          backgroundColor: 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
      <div style={{ padding: '0.85rem 0.9rem 0.9rem' }}>
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.14,
            color: 'var(--muted)',
            marginBottom: 4,
          }}
        >
          {formatted} · {event.location}
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 4,
          }}
        >
          {event.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          {event.summary}
        </div>
      </div>
    </Link>
  )
}

