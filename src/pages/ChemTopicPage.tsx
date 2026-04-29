import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchChemTopicsFromProxy, testProxyConnection } from '../lib/notion-proxy-server'
import { topics as staticTopics } from '../data/topics'
import { PhotoViewer } from '../components/PhotoViewer'
import { formatDate } from '../utils/formatters'
import defaultEventCover from '../assets/default-event-cover.svg'
import defaultEventCoverDark from '../assets/default-event-cover-dark.svg'
import { isDarkMode } from '../utils/theme'
import type { ChemTopic } from '../types'

/**
 * ChemTopicPage - Individual topic detail page
 * Displays full topic content including cover image, details, and gallery
 * Fetches from Notion with fallback to static data
 * Route: /chem-info/:slug
 */
export function ChemTopicPage() {
  const { slug } = useParams()
  const [topic, setTopic] = useState<ChemTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  /**
   * Load topic data with fallback strategy:
   * 1. Try Notion API if connected
   * 2. Fallback to static data if Notion fails
   * 3. Handle errors gracefully
   */
  useEffect(() => {
    async function loadTopic() {
      try {
        const isConnected = await testProxyConnection()
        
        if (isConnected) {
          const notionTopics = await fetchChemTopicsFromProxy()
          const foundTopic = notionTopics.find((t) => t.id === slug || t.slug === slug)
          if (foundTopic) {
            setTopic(foundTopic)
          } else {
            // Fallback to static data if not found in Notion
            const staticTopic = staticTopics.find((t) => t.slug === slug)
            setTopic(staticTopic || null)
          }
        } else {
          // Fallback to static data
          const staticTopic = staticTopics.find((t) => t.slug === slug)
          setTopic(staticTopic || null)
        }
      } catch (error) {
        console.error('Failed to load chem topic:', error)
        // Fallback to static data
        const staticTopic = staticTopics.find((t) => t.slug === slug)
        setTopic(staticTopic || null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadTopic()
    }
  }, [slug])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: 'var(--muted)'
      }}>
        Loading topic details...
      </div>
    )
  }

  if (!topic) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Topic not found</h1>
            <p className="page-subtitle">
              We could not find that chemistry topic in the current data set.
            </p>
          </div>
        </div>
        <Link to="/chem-info" className="pill">
          ← Back to chem info
        </Link>
      </div>
    )
  }

  
  // Use theme-aware default cover if no cover image is provided
  const coverImage = topic.coverImageUrl || (isDarkMode() ? defaultEventCoverDark : defaultEventCover)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{topic.title}</h1>
          <p className="page-subtitle">
            {formatDate(topic.date)}
          </p>
        </div>
        <Link to="/chem-info" className="pill">
          ← Back to chem info
        </Link>
      </div>

      {/* Cover Image */}
      {topic.coverImageUrl && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              position: 'relative',
              paddingBottom: '40%',
              borderRadius: 14,
              overflow: 'hidden',
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
        </div>
      )}

      <div className="grid grid-2">
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <div className="section-card-title">Details</div>
              <div className="section-card-subtitle">
                The complete information about this topic.
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {topic.content}
          </div>
        </div>
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <div className="section-card-title">Visuals</div>
              <div className="section-card-subtitle">
                Images and diagrams related to this topic.
              </div>
            </div>
          </div>
          {topic.galleryImageUrls && topic.galleryImageUrls.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.6rem',
              }}
            >
              {topic.galleryImageUrls.map((url) => (
                <div
                  key={url}
                  style={{
                    position: 'relative',
                    paddingBottom: '70%',
                    borderRadius: 14,
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onClick={() => setSelectedPhoto(url)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <div
                      style={{
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                        opacity: 0,
                        transform: 'scale(0.8)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0'
                        e.currentTarget.style.transform = 'scale(0.8)'
                      }}
                    >
                      🔍
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              No images available for this topic.
            </p>
          )}
        </div>
      </div>
      
      {selectedPhoto && (
        <PhotoViewer
          imageUrl={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}

