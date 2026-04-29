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

// Health check endpoint
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
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
}
