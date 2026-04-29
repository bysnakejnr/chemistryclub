import { Link } from 'react-router-dom'
import { formatDateShort } from '../utils/formatters'
import type { ChemTopic } from '../types'

/**
 * TopicCard component for displaying chemistry topic cards
 * Shows cover image, date, title, and summary
 * Used in ChemInfoPage to display topic grid
 */
interface TopicCardProps {
  topic: ChemTopic
}

export function TopicCard({ topic }: TopicCardProps) {
  /**
   * Dynamic card sizing based on content:
   * - With cover image: 280px min height, 3-line summary
   * - Without cover image: 120px min height, 2-line summary
   * This prevents cards from looking too big when they have minimal content
   */

  return (
    <Link
      to={`/chem-info/${topic.slug}`}
      className="topic-card"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(148, 163, 184, 0.65)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,249,255,0.96))',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: topic.coverImageUrl ? '280px' : '120px',
      }}
    >
      {/* Cover Image */}
      {topic.coverImageUrl && (
        <div
          style={{
            position: 'relative',
            height: '140px',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${topic.coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div
        style={{
          padding: topic.coverImageUrl ? '0.85rem 0.9rem' : '1rem 0.9rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.14,
            color: 'var(--muted)',
          }}
        >
          {formatDateShort(topic.date)}
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            lineHeight: 1.3,
          }}
        >
          {topic.title}
        </div>
        {topic.summary && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--muted)',
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: topic.coverImageUrl ? 3 : 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {topic.summary}
          </div>
        )}
      </div>
    </Link>
  )
}

