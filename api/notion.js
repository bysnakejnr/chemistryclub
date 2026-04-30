const { Client } = require('@notionhq/client')

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

// Main handler function
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { url } = req
  const path = url.split('/api/')[1]

  try {
    switch (path) {
      case 'health':
        res.json({ success: true, message: 'Server is healthy' })
        break

      case 'test':
        const response = await notion.users.me({})
        res.json({ 
          success: true, 
          user: response,
          message: 'Notion connection successful' 
        })
        break

      case 'test-all-databases':
        const results = {}
        
        // Test each database
        for (const [key, databaseId] of Object.entries(DATABASE_IDS)) {
          try {
            const response = await notion.databases.query({
              database_id: databaseId,
              page_size: 1
            })
            results[key] = {
              success: true,
              databaseId: databaseId,
              count: response.results.length,
              has_more: response.has_more
            }
          } catch (error) {
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
            const response = await notion.pages.retrieve({
              page_id: pageId
            })
            pageResults[key] = {
              success: true,
              pageId: pageId,
              title: response.properties?.title?.title?.[0]?.plain_text || 'No title'
            }
          } catch (error) {
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
        break

      case 'query':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' })
        }
        
        const { databaseId, pageSize = 10 } = req.body
        if (!databaseId) {
          return res.status(400).json({ error: 'Database ID is required' })
        }
        
        const queryResponse = await notion.databases.query({
          database_id: databaseId,
          page_size: pageSize
        })
        
        res.json({
          success: true,
          results: queryResponse.results,
          has_more: queryResponse.has_more,
          next_cursor: queryResponse.next_cursor
        })
        break

      default:
        if (path.startsWith('databases/')) {
          const dbType = path.split('/')[1]
          const dbId = DATABASE_IDS[dbType]
          
          if (!dbId) {
            return res.status(404).json({ error: 'Database not found' })
          }
          
          const dbResponse = await notion.databases.query({
            database_id: dbId,
            page_size: 50
          })
          
          res.json({
            success: true,
            results: dbResponse.results,
            has_more: dbResponse.has_more,
            next_cursor: dbResponse.next_cursor
          })
        } else {
          res.status(404).json({ error: 'Endpoint not found' })
        }
        break
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Request failed' 
    })
  }
}
