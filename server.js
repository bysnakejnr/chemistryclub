import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { Client } from '@notionhq/client'

dotenv.config()

const app = express()
const PORT = 3001

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// Middleware to parse JSON
app.use(express.json())

// Initialize Notion client
const notion = new Client({
  auth: process.env.VITE_NOTION_TOKEN,
})

console.log('Notion client initialized:', typeof notion.databases)
console.log('Available methods:', Object.getOwnPropertyNames(notion))
console.log('Databases object:', typeof notion.databases)
console.log('Databases methods:', Object.getOwnPropertyNames(notion.databases))

// Database IDs
const DATABASE_IDS = {
  chemInfo: process.env.VITE_NOTION_CHEM_INFO_DATABASE_ID,
  fieldTrips: process.env.VITE_NOTION_FIELD_TRIPS_DATABASE_ID,
  elements: process.env.VITE_NOTION_ELEMENTS_DATABASE_ID,
  dictionary: process.env.VITE_NOTION_DICTIONARY_DATABASE_ID
}

// Page IDs
const PAGE_IDS = {
  chemInfo: process.env.VITE_NOTION_CHEM_INFO_PAGE_ID,
  fieldTrips: process.env.VITE_NOTION_FIELD_TRIPS_PAGE_ID,
  elements: process.env.VITE_NOTION_ELEMENTS_PAGE_ID,
  dictionary: process.env.VITE_NOTION_DICTIONARY_PAGE_ID
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() })
})

// Test Notion connection
app.get('/api/test', async (req, res) => {
  try {
    const response = await notion.users.me({})
    res.json({ 
      success: true, 
      user: response,
      message: 'Notion connection successful' 
    })
  } catch (error) {
    console.error('Notion connection error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Notion connection failed' 
    })
  }
})

// Query database
app.post('/api/query', async (req, res) => {
  try {
    const { databaseId = DATABASE_ID, query = {} } = req.body
    
    console.log('Querying Notion database:', databaseId)
    console.log('Query:', query)
    
    // Try different approaches based on Notion SDK version
    let response
    
    // Method 1: Direct query method (newer SDK)
    if (typeof notion.query === 'function') {
      console.log('Using notion.query()')
      response = await notion.query({
        database_id: databaseId,
        ...query
      })
    }
    // Method 2: databases.query (most common)
    else if (typeof notion.databases?.query === 'function') {
      console.log('Using notion.databases.query()')
      response = await notion.databases.query({
        database_id: databaseId,
        ...query
      })
    }
    // Method 3: Older SDK syntax
    else if (typeof notion.databases?.query === 'function') {
      console.log('Using notion.databases.query() with old syntax')
      response = await notion.databases.query(databaseId, query)
    }
    // Method 4: Try using dataSources approach (newer SDK)
    else {
      console.log('Trying dataSources approach...')
      // Get database info first
      const dbInfo = await notion.databases.retrieve({ database_id: databaseId })
      console.log('Database info:', dbInfo)
      
      // Try to query using dataSources
      if (dbInfo.data_sources && dbInfo.data_sources.length > 0) {
        console.log('Using data source:', dbInfo.data_sources[0].id)
        const dataSourceId = dbInfo.data_sources[0].id
        
        // Try different query methods
        try {
          response = await notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: query.filter,
            sorts: query.sorts
          })
        } catch (dataSourceError) {
          console.log('Data source query failed, trying direct query...')
          // Last resort: try to use search
          response = await notion.search({
            filter: {
              property: 'object',
              value: 'page'
            },
            sort: {
              direction: 'ascending',
              timestamp: 'last_edited_time'
            }
          })
        }
      } else {
        throw new Error('No data sources found in database')
      }
    }
    
    console.log('Notion response:', response.results?.length || 0, 'items')
    console.log('Sample result:', JSON.stringify(response.results?.[0], null, 2) || 'No results')
    console.log('Response structure:', Object.keys(response))
    
    res.json({
      success: true,
      results: response.results || [],
      has_more: response.has_more,
      next_cursor: response.next_cursor
    })
  } catch (error) {
    console.error('Database query error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Database query failed' 
    })
  }
})

// List all databases
app.get('/api/databases', async (req, res) => {
  try {
    console.log('Fetching all databases from workspace...')
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      },
      sort: {
        direction: 'ascending',
        timestamp: 'last_edited_time'
      }
    })
    
    console.log(`Found ${response.results.length} databases`)
    
    const databases = response.results.map(db => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled',
      created_time: db.created_time,
      last_edited_time: db.last_edited_time
    }))
    
    res.json({
      success: true,
      databases: databases
    })
  } catch (error) {
    console.error('Database list error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Database list failed' 
    })
  }
})

// Get specific page
app.get('/api/page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params
    
    const response = await notion.pages.retrieve({
      page_id: pageId
    })
    
    res.json({
      success: true,
      page: response
    })
  } catch (error) {
    console.error('Page retrieval error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Page retrieval failed' 
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notion proxy server running on http://localhost:${PORT}`)
  console.log(`📡 Frontend should connect to: http://localhost:${PORT}/api`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
})
