import { useState, useEffect } from 'react'
import { TopicCard } from '../components/TopicCard'
import { fetchChemTopicsFromProxy, testProxyConnection } from '../lib/notion-proxy-server'
import { topics as staticTopics } from '../data/topics'
import type { ChemTopic } from '../types'

/**
 * ChemInfoPage - Main chemistry topics page
 * Displays topics grouped by year with cover images
 * Fetches from Notion with fallback to static data
 * Route: /chem-info
 */
export function ChemInfoPage() {
  const [topics, setTopics] = useState<ChemTopic[]>(staticTopics)
  const [loading, setLoading] = useState(true)
  const [notionConnected, setNotionConnected] = useState(false)
  
  
  /**
   * Load topics with fallback strategy:
   * 1. Test Notion connection
   * 2. Fetch from Notion if available
   * 3. Fallback to static data on failure
   */
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true)
        console.log('🔄 Testing Notion proxy connection for chem topics...')
        
        const connectionTest = await testProxyConnection()
        if (connectionTest) {
          console.log('✅ Notion connection successful, loading chem topics from Notion')
          setNotionConnected(true)
          
          const notionTopics = await fetchChemTopicsFromProxy()
          setTopics(notionTopics)
          console.log(`✅ Loaded ${notionTopics.length} chem topics from Notion`)
        } else {
          console.log('❌ Notion connection failed, using static chem topics data')
          setNotionConnected(false)
        }
      } catch (error) {
        console.error('❌ Error loading chem topics:', error)
        console.log('📚 Falling back to static chem topics data')
        setNotionConnected(false)
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [])

  /**
   * Group topics by year for organized display
   * Uses UTC to prevent timezone shifts
   * Returns object with year keys and topic arrays
   */
  const topicsByYear = topics.reduce((acc, topic) => {
    const year = topic.date ? new Date(topic.date).getUTCFullYear().toString() : 'No Date'
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(topic)
    return acc
  }, {} as Record<string, ChemTopic[]>)

  
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Chem info</h1>
            <p className="page-subtitle">
              Weekly topics and mini-lessons from club meetings. Tap a card to see the full notes.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading chem topics...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chemistry Topics</h1>
          <p className="page-subtitle">
            Explore chemistry concepts organized by year
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
            <h2 className="section-card-title">Topics by Year</h2>
            <p className="section-card-subtitle">
              {topics.length} topics available
            </p>
          </div>
        </div>

        {Object.entries(topicsByYear)
            .sort(([yearA], [yearB]) => {
              // Sort years in descending order, but keep "No Date" at the end
              if (yearA === 'No Date') return 1
              if (yearB === 'No Date') return -1
              return parseInt(yearB) - parseInt(yearA)
            })
            .map(([year, yearTopics]) => (
              <div key={year} style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>
                  {year}
                </h3>
                <div className="grid grid-3">
                  {yearTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
