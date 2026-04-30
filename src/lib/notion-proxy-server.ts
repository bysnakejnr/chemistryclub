// Notion client that uses our proxy server
import type { ChemElement, ClubEvent } from '../types'

const PROXY_BASE_URL = (typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) 
  ? '/api' 
  : 'http://localhost:3001/api'

/**
 * Notion Proxy Server Integration
 * 
 * This file handles all communication with the Notion API via our proxy server.
 * The proxy server (running on localhost:3001) handles Notion authentication
 * and provides a clean API interface for the frontend.
 * 
 * Database IDs:
 * - Elements: 398356231f8c82d0913201f0342b5b61
 * - Events: 5a6356231f8c8278897101702c5ae9bb
 * - Dictionary: da8356231f8c836993d50193a5c0cb94
 * - Chem Topics: ff4356231f8c83e5abbe8145d499aa73
 */

/**
 * Tests connection to the Notion proxy server
 * @returns true if connection is successful, false otherwise
 */
export async function testProxyConnection(): Promise<boolean> {
  try {
    console.log('🔄 Testing proxy server connection...')
    const response = await fetch(`${PROXY_BASE_URL}/health`)
    
    if (!response.ok) {
      throw new Error(`Proxy server returned ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Proxy server health check:', data)
    
    // Test Notion connection through proxy
    const notionResponse = await fetch(`${PROXY_BASE_URL}/test`)
    
    // Debug: Check the response before parsing JSON
    const responseText = await notionResponse.text()
    console.log('🔍 Proxy test-connection response:', responseText)
    
    if (!responseText) {
      throw new Error('Empty response from proxy test-connection')
    }
    
    let notionData
    try {
      notionData = JSON.parse(responseText)
    } catch (parseError) {
      throw new Error(`Invalid JSON from proxy: "${responseText}"`)
    }
    
    if (!notionData.success) {
      throw new Error(`Notion connection failed: ${notionData.error}`)
    }
    
    console.log('✅ Notion connection successful through proxy')
    return true
  } catch (error) {
    console.error('❌ Proxy connection failed:', (error as Error).message)
    return false
  }
}

// Query database through proxy
export async function queryDatabaseThroughProxy(databaseId: string, query: any = {}) {
  try {
    console.log('🔄 Querying database through proxy...')
    
    const response = await fetch(`${PROXY_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        databaseId,
        query
      })
    })
    
    if (!response.ok) {
      throw new Error(`Proxy query failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Notion query failed: ${data.error}`)
    }
    
    console.log('✅ Successfully queried database through proxy:', data.results.length, 'items')
    return data
  } catch (error) {
    console.error('❌ Database query through proxy failed:', (error as Error).message)
    throw error
  }
}

// Map Notion properties to ChemElement interface
function mapNotionPageToElement(page: any): ChemElement {
  const properties = page.properties
  const atomicNumber = properties['Atomic Number']?.number || 0
  
  // Add group and period data based on atomic number
  const elementPosition = getElementPosition(atomicNumber)
  
  const element = {
    atomicNumber: atomicNumber,
    symbol: properties['Symbol']?.rich_text?.[0]?.plain_text || '',
    name: properties['Element Name']?.title?.[0]?.plain_text || '',
    group: elementPosition.group,
    period: elementPosition.period,
    block: elementPosition.block,
    isCompleted: true, // Elements from Notion are completed/discovered
    realLifeUsage: properties['Real Life Usage']?.rich_text?.[0]?.plain_text || '',
    mostCommonUseOrCompound: properties['Most Common Use/Compound']?.rich_text?.[0]?.plain_text || '',
    discoveredWhen: properties['Discovery Date']?.rich_text?.[0]?.plain_text || '',
    toxicOrRadioactiveCause: properties['Toxicity/Radioactivity']?.rich_text?.[0]?.plain_text || '',
    compositionNote: properties['Composition']?.rich_text?.[0]?.plain_text || '',
    whereFound: properties['Where Found']?.rich_text?.[0]?.plain_text || '',
  }
  
  // Debug: Log specific elements that should be colored
  if (element.name === 'Hydrogen' || element.name === 'Boron') {
    console.log(`🔍 Element mapping for ${element.name}:`)
    console.log(`- isCompleted: ${element.isCompleted}`)
    console.log(`- atomicNumber: ${element.atomicNumber}`)
    console.log(`- group: ${elementPosition.group}`)
    console.log(`- period: ${elementPosition.period}`)
    console.log(`- block: ${elementPosition.block}`)
  }
  
  console.log('Mapped element:', element)
  return element
}

// Helper function to get element position based on atomic number
function getElementPosition(atomicNumber: number) {
  // Import all positions from AllElements.tsx
  const positions: { [key: number]: { group: number | null, period: number, block: 's' | 'p' | 'd' | 'f' } } = {
    1: { group: 1, period: 1, block: 's' },    // H
    2: { group: 18, period: 1, block: 's' },   // He
    3: { group: 1, period: 2, block: 's' },    // Li
    4: { group: 2, period: 2, block: 's' },    // Be
    5: { group: 13, period: 2, block: 'p' },   // B
    6: { group: 14, period: 2, block: 'p' },   // C
    7: { group: 15, period: 2, block: 'p' },   // N
    8: { group: 16, period: 2, block: 'p' },   // O
    9: { group: 17, period: 2, block: 'p' },   // F
    10: { group: 18, period: 2, block: 'p' },  // Ne
    11: { group: 1, period: 3, block: 's' },   // Na
    12: { group: 2, period: 3, block: 's' },   // Mg
    13: { group: 13, period: 3, block: 'p' },   // Al
    14: { group: 14, period: 3, block: 'p' },   // Si
    15: { group: 15, period: 3, block: 'p' },   // P
    16: { group: 16, period: 3, block: 'p' },   // S
    17: { group: 17, period: 3, block: 'p' },   // Cl
    18: { group: 18, period: 3, block: 'p' },   // Ar
    19: { group: 1, period: 4, block: 's' },   // K
    20: { group: 2, period: 4, block: 's' },   // Ca
    21: { group: 3, period: 4, block: 'd' },   // Sc
    22: { group: 4, period: 4, block: 'd' },   // Ti
    23: { group: 5, period: 4, block: 'd' },   // V
    24: { group: 6, period: 4, block: 'd' },   // Cr
    25: { group: 7, period: 4, block: 'd' },   // Mn
    26: { group: 8, period: 4, block: 'd' },   // Fe
    27: { group: 9, period: 4, block: 'd' },   // Co
    28: { group: 10, period: 4, block: 'd' },  // Ni
    29: { group: 11, period: 4, block: 'd' },  // Cu
    30: { group: 12, period: 4, block: 'd' },  // Zn
    31: { group: 13, period: 4, block: 'p' },  // Ga
    32: { group: 14, period: 4, block: 'p' },  // Ge
    33: { group: 15, period: 4, block: 'p' },  // As
    34: { group: 16, period: 4, block: 'p' },  // Se
    35: { group: 17, period: 4, block: 'p' },  // Br
    // Add more as needed...
  }
  
  return positions[atomicNumber] || { group: null, period: 1, block: 's' }
}

// Fetch all elements from Notion through proxy
export async function fetchElementsFromProxy(): Promise<ChemElement[]> {
  try {
    console.log('Fetching elements from Notion through proxy...')
    
    const response = await queryDatabaseThroughProxy('398356231f8c82d0913201f0342b5b61', {
      sorts: [
        {
          property: 'Atomic Number',
          direction: 'ascending',
        },
      ],
    })

    return response.results.map(mapNotionPageToElement)
  } catch (error) {
    console.error('Error fetching elements from Notion proxy:', error)
    throw error
  }
}

// Map Notion properties to ClubEvent interface
function mapNotionPageToEvent(page: any): ClubEvent {
  const properties = page.properties
  
  // Try multiple possible title property names - handle both title and rich_text types
  const title = 
    properties['Title']?.title?.[0]?.plain_text ||
    properties['Title']?.rich_text?.[0]?.plain_text ||
    properties['Title 1']?.title?.[0]?.plain_text ||
    properties['Title 1']?.rich_text?.[0]?.plain_text ||
    properties['Event Name']?.title?.[0]?.plain_text ||
    properties['Event Name']?.rich_text?.[0]?.plain_text ||
    properties['Name']?.title?.[0]?.plain_text ||
    properties['Name']?.rich_text?.[0]?.plain_text ||
    properties['Event']?.title?.[0]?.plain_text ||
    properties['Event']?.rich_text?.[0]?.plain_text ||
    properties['title']?.title?.[0]?.plain_text ||
    properties['title']?.rich_text?.[0]?.plain_text ||
    properties['event']?.title?.[0]?.plain_text ||
    properties['event']?.rich_text?.[0]?.plain_text ||
    properties['name']?.title?.[0]?.plain_text ||
    properties['name']?.rich_text?.[0]?.plain_text ||
    ''
  
    
  const event = {
    id: page.id,
    title: title,
    date: properties['Date']?.date?.start || properties['Event Date']?.date?.start || '',
    location: properties['Location']?.rich_text?.[0]?.plain_text || properties['Location']?.title?.[0]?.plain_text || '',
    summary: properties['Summary']?.rich_text?.[0]?.plain_text || properties['Description']?.rich_text?.[0]?.plain_text || '',
    whatWeLearned: properties['What We Learned']?.rich_text?.[0]?.plain_text || properties['Learnings']?.rich_text?.[0]?.plain_text || '',
    coverImageUrl: properties['Cover Image']?.files?.[0]?.file?.url || properties['Image']?.files?.[0]?.file?.url || '',
    galleryImageUrls: properties['Gallery Images']?.files?.map((file: any) => file.file?.url || file.external?.url).filter(Boolean) || []
  }
  
  // Debug: Log image URLs for californium events
  if (event.title.toLowerCase().includes('californium')) {
    console.log('🔍 Californium event mapping:')
    console.log('- Cover Image property:', properties['Cover Image'])
    console.log('- Gallery Images property:', properties['Gallery Images'])
    console.log('- Final coverImageUrl:', event.coverImageUrl)
    console.log('- Final galleryImageUrls:', event.galleryImageUrls)
  }
  
  return event
}

// Fetch all events from Notion through proxy
export async function fetchEventsFromProxy(): Promise<ClubEvent[]> {
  try {
    console.log('Fetching events from Notion through proxy...')
    
    const response = await queryDatabaseThroughProxy('5a6356231f8c8278897101702c5ae9bb', {
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    })

    return response.results.map(mapNotionPageToEvent)
  } catch (error) {
    console.error('Error fetching events from Notion proxy:', error)
    throw error
  }
}

import type { ChemTerm, ChemTopic } from '../types'

// Map Notion page to ChemTerm
function mapNotionPageToChemTerm(page: any): ChemTerm {
  const properties = page.properties
  
  const term = {
    id: page.id,
    realWord: properties['Real Word']?.title?.[0]?.plain_text || properties['Term']?.title?.[0]?.plain_text || properties['Word']?.title?.[0]?.plain_text || '',
    ourBetterWord: properties['Our Better Word']?.rich_text?.[0]?.plain_text || properties['Simple Version']?.rich_text?.[0]?.plain_text || properties['Friendly']?.rich_text?.[0]?.plain_text || '',
    explanation: properties['Explanation']?.rich_text?.[0]?.plain_text || properties['Definition']?.rich_text?.[0]?.plain_text || properties['Description']?.rich_text?.[0]?.plain_text || '',
    category: properties['Category']?.select?.name || properties['Type']?.select?.name || ''
  }
  
  console.log('Mapped chem term:', term)
  return term
}

// Fetch dictionary terms from Notion through proxy
export async function fetchDictionaryFromProxy(): Promise<ChemTerm[]> {
  try {
    console.log('Fetching dictionary from Notion through proxy...')
    
    // We'll use the page ID first, then update to database ID once we know it
    const response = await queryDatabaseThroughProxy('da8356231f8c836993d50193a5c0cb94', {
      sorts: [
        {
          property: 'Real Word',
          direction: 'ascending',
        },
      ],
    })

    return response.results.map(mapNotionPageToChemTerm)
  } catch (error) {
    console.error('Error fetching dictionary from Notion proxy:', error)
    throw error
  }
}

// Map Notion page to ChemTopic
function mapNotionPageToChemTopic(page: any): ChemTopic {
  const properties = page.properties
  
  // Extract details content (rich text array to plain text)
  const detailsContent = properties['Details']?.rich_text?.map((text: any) => text.plain_text).join('') || ''
  
  // Create summary fallback from details (first 150 characters)
  const summaryFallback = detailsContent.length > 150 
    ? detailsContent.substring(0, 150).trim() + '...'
    : detailsContent.trim()
  
  const topic = {
    id: page.id,
    slug: page.id, // Use page ID as slug for now
    title: properties['Title']?.title?.[0]?.plain_text || properties['Name']?.title?.[0]?.plain_text || '',
    date: properties['Date']?.date?.start || '',
    summary: properties['Summary']?.rich_text?.[0]?.plain_text || summaryFallback,
    content: detailsContent,
    coverImageUrl: properties['Cover Image']?.files?.[0]?.file?.url || properties['Image']?.files?.[0]?.file?.url || '',
    galleryImageUrls: properties['Gallery Images']?.files?.map((file: any) => file.file?.url || file.external?.url).filter(Boolean) || []
  }
  
  // Debug: Log image URLs for chem topics
  console.log('🔍 Chem topic mapping:')
  console.log('- Cover Image property:', properties['Cover Image'])
  console.log('- Gallery Images property:', properties['Gallery Images'])
  console.log('- Date property:', properties['Date'])
  console.log('- Final coverImageUrl:', topic.coverImageUrl)
  console.log('- Final galleryImageUrls:', topic.galleryImageUrls)
  console.log('- Final date:', topic.date)
  
  return topic
}

// Fetch chem topics from Notion through proxy
export async function fetchChemTopicsFromProxy(): Promise<ChemTopic[]> {
  try {
    console.log('Fetching chem topics from Notion through proxy...')
    
    const response = await queryDatabaseThroughProxy('ff4356231f8c83e5abbe8145d499aa73', {
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    })

    return response.results.map(mapNotionPageToChemTopic)
  } catch (error) {
    console.error('Error fetching chem topics from Notion proxy:', error)
    throw error
  }
}
