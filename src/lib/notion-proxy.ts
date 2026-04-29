// Simple proxy for Notion API to avoid CORS issues
// This uses the Vite dev server proxy to route requests

const NOTION_API_BASE = '/api' // Uses Vite proxy

export async function proxyNotionRequest(endpoint: string, options: RequestInit = {}) {
  // Temporary hardcoded values for testing
  const token = import.meta.env.VITE_NOTION_TOKEN || 'ntn_d75118223636XwmLe1wpWkuJ8Zky9jlLnKprfUA7Jto1y1'
  const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID || '32e1bfbd501b8016a387000ccfbc15ce'
  
  // Debug logging
  console.log('🔍 Environment variables check:')
  console.log('VITE_NOTION_TOKEN exists:', !!import.meta.env.VITE_NOTION_TOKEN)
  console.log('VITE_NOTION_DATABASE_ID exists:', !!import.meta.env.VITE_NOTION_DATABASE_ID)
  console.log('Using hardcoded token:', !!token)
  console.log('Using hardcoded DB ID:', !!databaseId)
  console.log('Using proxy URL:', NOTION_API_BASE + endpoint)
  
  if (!token) {
    throw new Error('Notion token not found in environment variables')
  }

  const url = `${NOTION_API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Test connection
export async function testNotionConnection(): Promise<boolean> {
  try {
    await proxyNotionRequest('/users/me')
    return true
  } catch (error) {
    console.error('Notion connection test failed:', error)
    return false
  }
}

// Query database
export async function queryDatabase(databaseId: string, query: any = {}) {
  return proxyNotionRequest(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify(query),
  })
}
