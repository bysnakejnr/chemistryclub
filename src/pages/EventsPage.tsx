import { useState, useEffect } from 'react'
import { events } from '../data/events'
import { EventCard } from '../components/EventCard'
import { testProxyConnection, fetchEventsFromProxy } from '../lib/notion-proxy-server'
import type { ClubEvent } from '../types'

export function EventsPage() {
  const [eventsData, setEventsData] = useState<ClubEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [notionConnected, setNotionConnected] = useState(false)

  // Load events from Notion or fallback
  useEffect(() => {
    async function loadEvents() {
      try {
        console.log('🔄 Testing Notion proxy connection for events...')
        const isConnected = await testProxyConnection()
        setNotionConnected(isConnected)
        
        if (isConnected) {
          console.log('🔄 Loading events from Notion proxy...')
          const notionEvents = await fetchEventsFromProxy()
          setEventsData(notionEvents)
          console.log(`✅ Loaded ${notionEvents.length} events from Notion`)
        } else {
          console.log('❌ Notion proxy failed, using fallback data')
          setEventsData(events)
        }
      } catch (error) {
        console.error('❌ Error loading events:', error)
        console.log('📚 Falling back to static events data')
        setEventsData(events)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: 'var(--muted)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Loading events...</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          {notionConnected ? 'Connecting to Notion...' : 'Starting up...'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">
            Upcoming and past chemistry club events
          </p>
        </div>
        {notionConnected && (
          <div className="badge">
            <div className="badge-dot" />
            Connected to Notion
          </div>
        )}
      </div>

      
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">All Events</h2>
            <p className="section-card-subtitle">
              {eventsData.length} events available
            </p>
          </div>
        </div>

        <div className="grid grid-2">
          {eventsData.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}
