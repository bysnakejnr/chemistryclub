import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { events } from '../data/events'
import { fetchEventsFromProxy, testProxyConnection } from '../lib/notion-proxy-server'
import { PhotoViewer } from '../components/PhotoViewer'
import defaultEventCover from '../assets/default-event-cover.svg'
import defaultEventCoverDark from '../assets/default-event-cover-dark.svg'
import { isDarkMode } from '../utils/theme'
import type { ClubEvent } from '../types'

export function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState<ClubEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  // Load events from Notion or fallback
  useEffect(() => {
    async function loadEvent() {
      try {
        const isConnected = await testProxyConnection()
        
        if (isConnected) {
          const notionEvents = await fetchEventsFromProxy()
          const foundEvent = notionEvents.find((e) => e.id === id)
          if (foundEvent) {
            setEvent(foundEvent)
          } else {
            // Fallback to static data if not found in Notion
            const staticEvent = events.find((e) => e.id === id)
            setEvent(staticEvent || null)
          }
        } else {
          // Fallback to static data
          const staticEvent = events.find((e) => e.id === id)
          setEvent(staticEvent || null)
        }
      } catch (error) {
        console.error('Failed to load event:', error)
        // Fallback to static data
        const staticEvent = events.find((e) => e.id === id)
        setEvent(staticEvent || null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadEvent()
    }
  }, [id])

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
        Loading event details...
      </div>
    )
  }

  if (!event) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Event not found</h1>
            <p className="page-subtitle">We could not find that event in current data set.</p>
          </div>
        </div>
        <Link to="/events" className="pill">
          ← Back to events
        </Link>
      </div>
    )
  }

  const date = event.date ? new Date(event.date) : null
  const formatted = date ? date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date not specified'
  
  // Check if cover image is in unsupported format (like .heic)
  const isUnsupportedFormat = event.coverImageUrl && 
    (event.coverImageUrl.toLowerCase().endsWith('.heic') || 
     event.coverImageUrl.toLowerCase().endsWith('.heif'))
  
  // Use theme-aware default cover if no cover image or unsupported format
  const coverImage = (!event.coverImageUrl || isUnsupportedFormat) 
    ? (isDarkMode() ? defaultEventCoverDark : defaultEventCover)
    : event.coverImageUrl
  
  // Debug: Log californium event data
  if (event.title.toLowerCase().includes('californium')) {
    console.log('Californium event data:', event)
    console.log('Cover image URL:', event.coverImageUrl)
    console.log('Gallery images:', event.galleryImageUrls)
    console.log('Cover image type:', typeof event.coverImageUrl)
    console.log('Gallery images type:', typeof event.galleryImageUrls)
    console.log('Gallery images length:', event.galleryImageUrls.length)
    
    // Test if the cover image URL is accessible and check format
    if (event.coverImageUrl) {
      console.log('Testing cover image URL accessibility...')
      console.log('Image format:', event.coverImageUrl.split('.').pop()?.toLowerCase())
      
      const img = new Image()
      img.onload = () => console.log('✅ Cover image loaded successfully')
      img.onerror = () => {
        console.log('❌ Cover image failed to load - likely unsupported format (.heic)')
        console.log('Falling back to default cover image')
      }
      img.src = event.coverImageUrl
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{event.title}</h1>
          <p className="page-subtitle">
            {formatted} · {event.location}
          </p>
        </div>
        <Link to="/events" className="pill">
          ← Back to events
        </Link>
      </div>

      {/* Cover Image */}
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

      <div className="grid grid-2">
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <div className="section-card-title">What we learned</div>
              <div className="section-card-subtitle">
                A quick summary of the chemistry ideas we connected on this trip.
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14 }}>{event.whatWeLearned}</p>
        </div>
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <div className="section-card-title">Photos</div>
              <div className="section-card-subtitle">
                Use this section for a few favorite shots or diagrams.
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '0.5rem',
            }}
          >
            {event.galleryImageUrls.length > 0 ? (
              event.galleryImageUrls.map((url, index) => {
                // Check if image is in unsupported format
                const isUnsupported = url && 
                  (url.toLowerCase().endsWith('.heic') || url.toLowerCase().endsWith('.heif'))
                
                return (
                  <div
                    key={url || index}
                    style={{
                      position: 'relative',
                      paddingBottom: '62%',
                      borderRadius: 14,
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                      cursor: url && !isUnsupported ? 'pointer' : 'default',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onClick={() => url && !isUnsupported && setSelectedPhoto(url)}
                    onMouseEnter={(e) => {
                      if (url && !isUnsupported) {
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {url && !isUnsupported ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--tile-base-bg)',
                          color: 'var(--muted)',
                          fontSize: '12px',
                          textAlign: 'center',
                          padding: '1rem',
                        }}
                      >
                        {isUnsupported ? 'Unsupported format (.heic)' : 'No image'}
                      </div>
                    )}
                    {url && !isUnsupported && (
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
                    )}
                  </div>
                )
              })
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--muted)',
                  fontSize: '14px',
                }}
              >
                No photos available for this event
              </div>
            )}
          </div>
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

