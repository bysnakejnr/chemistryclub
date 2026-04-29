require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Client } = require('@notionhq/client')

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
  auth: process.env.VITE_NOTION_TOKEN
})

// Database IDs
const DATABASE_IDS = {
  chemInfo: 'ff4356231f8c83e5abbe8145d499aa73',
  fieldTrips: '5a6356231f8c8278897101702c5ae9bb',
  elements: '398356231f8c82d0913201f0342b5b61',
  dictionary: 'da8356231f8c836993d50193a5c0cb94'
}

// Page IDs
const PAGE_IDS = {
  chemInfo: '875356231f8c83e0b7708190eab22c43',
  fieldTrips: '875356231f8c83e0b7708190eab22c43',
  elements: '875356231f8c83e0b7708190eab22c43',
  dictionary: '875356231f8c83e0b7708190eab22c43'
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() })
})

// Query database endpoint (for frontend compatibility)
app.post('/api/query', async (req, res) => {
  try {
    const { databaseId, query } = req.body
    
    if (!databaseId) {
      return res.status(400).json({
        success: false,
        error: 'Database ID is required'
      })
    }
    
    console.log('Querying database:', databaseId, 'with query:', query)
    
    const response = await notion.databases.query({
      database_id: databaseId,
      ...query
    })
    
    res.json({
      success: true,
      results: response.results || [],
      has_more: response.has_more,
      next_cursor: response.next_cursor
    })
  } catch (error) {
    console.error('Database query error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Database query failed' 
    })
  }
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

// Test all database connections
app.get('/api/test-all-databases', async (req, res) => {
  const results = {}
  
  try {
    // Test each database
    for (const [key, databaseId] of Object.entries(DATABASE_IDS)) {
      try {
        console.log(`Testing ${key} database:`, databaseId)
        const response = await notion.databases.query({
          database_id: databaseId
        })
        results[key] = {
          success: true,
          databaseId: databaseId,
          count: response.results.length,
          has_more: response.has_more,
          next_cursor: response.next_cursor
        }
      } catch (error) {
        console.error(`${key} database error:`, error)
        results[key] = {
          success: false,
          databaseId: databaseId,
          error: error.message
        }
      }
    }
    
    // Test page access
    const pageResults = {}
    for (const [key, pageId] of Object.entries(PAGE_IDS)) {
      try {
        console.log(`Testing ${key} page:`, pageId)
        const response = await notion.pages.retrieve({
          page_id: pageId
        })
        pageResults[key] = {
          success: true,
          pageId: pageId,
          title: response.properties?.title?.title?.[0]?.plain_text || 'No title'
        }
      } catch (error) {
        console.error(`${key} page error:`, error)
        pageResults[key] = {
          success: false,
          pageId: pageId,
          error: error.message
        }
      }
    }
    
    res.json({
      success: true,
      databases: results,
      pages: pageResults,
      message: 'All database connections tested'
    })
  } catch (error) {
    console.error('Database test error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Database testing failed' 
    })
  }
})

// Individual database endpoints
app.get('/api/databases/chem-info', async (req, res) => {
  try {
    console.log('Querying Chem Info database:', DATABASE_IDS.chemInfo)
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.chemInfo
    })
    
    res.json({
      success: true,
      database: 'chem-info',
      results: response.results || [],
      has_more: response.has_more,
      next_cursor: response.next_cursor
    })
  } catch (error) {
    console.error('Chem Info database error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Chem Info database query failed' 
    })
  }
})

app.get('/api/databases/field-trips', async (req, res) => {
  try {
    console.log('Querying Field Trips database:', DATABASE_IDS.fieldTrips)
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.fieldTrips
    })
    
    res.json({
      success: true,
      database: 'field-trips',
      results: response.results || [],
      has_more: response.has_more,
      next_cursor: response.next_cursor
    })
  } catch (error) {
    console.error('Field Trips database error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Field Trips database query failed' 
    })
  }
})

app.get('/api/databases/elements', async (req, res) => {
  try {
    console.log('Querying Elements database:', DATABASE_IDS.elements)
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.elements
    })
    
    res.json({
      success: true,
      database: 'elements',
      results: response.results || [],
      has_more: response.has_more,
      next_cursor: response.next_cursor
    })
  } catch (error) {
    console.error('Elements database error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Elements database query failed' 
    })
  }
})

app.get('/api/databases/dictionary', async (req, res) => {
  try {
    console.log('Querying Dictionary database:', DATABASE_IDS.dictionary)
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.dictionary
    })
    
    res.json({
      success: true,
      database: 'dictionary',
      results: response.results || [],
      has_more: response.has_more,
      next_cursor: response.next_cursor
    })
  } catch (error) {
    console.error('Dictionary database error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Dictionary database query failed' 
    })
  }
})

// List all databases info
app.get('/api/databases', async (req, res) => {
  try {
    const databases = [
      { name: 'Chem Info', id: DATABASE_IDS.chemInfo, endpoint: '/api/databases/chem-info' },
      { name: 'Field Trips', id: DATABASE_IDS.fieldTrips, endpoint: '/api/databases/field-trips' },
      { name: 'Elements', id: DATABASE_IDS.elements, endpoint: '/api/databases/elements' },
      { name: 'Dictionary', id: DATABASE_IDS.dictionary, endpoint: '/api/databases/dictionary' }
    ]
    
    res.json({
      success: true,
      databases: databases
    })
  } catch (error) {
    console.error('Database list error:', error)
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
