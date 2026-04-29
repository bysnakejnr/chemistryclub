import { useState, useEffect } from 'react'
import { DictionaryTable } from '../components/DictionaryTable'
import { fetchDictionaryFromProxy, testProxyConnection } from '../lib/notion-proxy-server'
import { terms as staticTerms } from '../data/terms'
import type { ChemTerm } from '../types'

export function DictionaryPage() {
  const [terms, setTerms] = useState<ChemTerm[]>(staticTerms)
  const [loading, setLoading] = useState(true)
  const [notionConnected, setNotionConnected] = useState(false)

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        setLoading(true)
        console.log('🔄 Testing Notion proxy connection for dictionary...')
        
        const connectionTest = await testProxyConnection()
        if (connectionTest) {
          console.log('✅ Notion connection successful, loading dictionary from Notion')
          setNotionConnected(true)
          
          const notionTerms = await fetchDictionaryFromProxy()
          setTerms(notionTerms)
          console.log(`✅ Loaded ${notionTerms.length} terms from Notion`)
        } else {
          console.log('Notion connection failed, check your connection and try again')
          setNotionConnected(false)
        }
      } catch (error) {
        console.error('Error loading dictionary:', error)
        console.log('Notion connection failed, check your connection and try again')
        setNotionConnected(false)
      } finally {
        setLoading(false)
      }
    }

    loadDictionary()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">New terms dictionary</h1>
            <p className="page-subtitle">
              Real chemistry vocabulary paired with our own friendlier versions and quick
              explanations.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading dictionary...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New terms dictionary</h1>
          <p className="page-subtitle">
            Real chemistry vocabulary paired with our own friendlier versions and quick
            explanations.
          </p>
          {notionConnected && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              ✅ Connected to Notion ({terms.length} terms)
            </div>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div>
            <div className="section-card-title">Searchable term list</div>
            <div className="section-card-subtitle">
              Start typing to instantly filter by any part of the term or explanation.
            </div>
          </div>
        </div>
        <DictionaryTable terms={terms} />
      </div>
    </div>
  )
}

