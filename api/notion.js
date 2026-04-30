import { Client } from '@notionhq/client'

/** Server: prefer NOTION_TOKEN; fall back to VITE_NOTION_TOKEN. */
function getNotionToken() {
  return process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN
}

let notionClient = null

function getNotion() {
  const token = getNotionToken()
  if (!token) return null
  if (!notionClient) {
    notionClient = new Client({ auth: token })
  }
  return notionClient
}

// Database IDs
const DATABASE_IDS = {
  chemInfo: 'ff4356231f8c83e5abbe8145d499aa73',
  fieldTrips: '5a6356231f8c8278897101702c5ae9bb',
  elements: '398356231f8c82d0913201f0342b5b61',
  dictionary: 'da8356231f8c836993d50193a5c0cb94',
}

// Page IDs
const PAGE_IDS = {
  chemInfo: '875356231f8c83e0b7708190eab22c43',
  fieldTrips: '875356231f8c83e0b7708190eab22c43',
  elements: '875356231f8c83e0b7708190eab22c43',
  dictionary: '875356231f8c83e0b7708190eab22c43',
}

/** Vercel often passes req.url as `/health` or full URL; normalize to e.g. `health`, `query`. */
function normalizeApiPath(url) {
  if (!url || typeof url !== 'string') return ''
  let pathname = url.split('?')[0]
  const marker = '/api/'
  const idx = pathname.indexOf(marker)
  if (idx !== -1) {
    pathname = pathname.slice(idx + marker.length)
  } else if (pathname.startsWith('/')) {
    pathname = pathname.slice(1)
  }
  return pathname.replace(/^\/+/, '')
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export default async function handler(req, res) {
  console.log('=== Serverless Function Called ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Notion token set:', !!getNotionToken(), 'length:', getNotionToken()?.length || 0)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.end()
    return
  }

  const path = normalizeApiPath(
    req.url || req.originalUrl || req.headers?.['x-invoke-path'] || '',
  )
  console.log('Normalized path:', path)

  try {
    switch (path) {
      case 'health':
        sendJson(res, 200, { success: true, message: 'Server is healthy' })
        break

      case 'test': {
        const notion = getNotion()
        if (!notion) {
          sendJson(res, 500, {
            success: false,
            error: 'Notion client not initialized',
            message: 'Notion client initialization failed',
          })
          return
        }
        const notionUser = await notion.users.me({})
        sendJson(res, 200, {
          success: true,
          user: notionUser,
          message: 'Notion connection successful',
        })
        break
      }

      case 'test-all-databases': {
        const notion = getNotion()
        if (!notion) {
          sendJson(res, 500, {
            success: false,
            error: 'Notion client not initialized',
            message: 'Notion client initialization failed',
          })
          return
        }
        const results = {}

        for (const [key, databaseId] of Object.entries(DATABASE_IDS)) {
          try {
            const dbQuery = await notion.databases.query({
              database_id: databaseId,
              page_size: 1,
            })
            results[key] = {
              success: true,
              databaseId: databaseId,
              count: dbQuery.results.length,
              has_more: dbQuery.has_more,
            }
          } catch (error) {
            results[key] = {
              success: false,
              databaseId: databaseId,
              error: error.message,
            }
          }
        }

        const pageResults = {}
        for (const [key, pageId] of Object.entries(PAGE_IDS)) {
          try {
            const page = await notion.pages.retrieve({
              page_id: pageId,
            })
            pageResults[key] = {
              success: true,
              pageId: pageId,
              title: page.properties?.title?.title?.[0]?.plain_text || 'No title',
            }
          } catch (error) {
            pageResults[key] = {
              success: false,
              pageId: pageId,
              error: error.message,
            }
          }
        }

        sendJson(res, 200, {
          success: true,
          databases: results,
          pages: pageResults,
          message: 'All database connections tested',
        })
        break
      }

      case 'query': {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const notion = getNotion()
        if (!notion) {
          sendJson(res, 500, {
            success: false,
            error: 'Notion client not initialized',
            message: 'Set NOTION_TOKEN or VITE_NOTION_TOKEN in Vercel project settings',
          })
          return
        }
        const body = await readJsonBody(req)
        const { databaseId, query: notionQuery = {} } = body
        if (!databaseId) {
          sendJson(res, 400, { error: 'Database ID is required' })
          return
        }

        const queryResponse = await notion.databases.query({
          database_id: databaseId,
          ...notionQuery,
        })

        sendJson(res, 200, {
          success: true,
          results: queryResponse.results,
          has_more: queryResponse.has_more,
          next_cursor: queryResponse.next_cursor,
        })
        break
      }

      default:
        if (path && path.startsWith('databases/')) {
          const notion = getNotion()
          if (!notion) {
            sendJson(res, 500, {
              success: false,
              error: 'Notion client not initialized',
            })
            return
          }
          const dbType = path.split('/')[1]
          const pathToKey = {
            'chem-info': 'chemInfo',
            'field-trips': 'fieldTrips',
            elements: 'elements',
            dictionary: 'dictionary',
          }
          const dbId = DATABASE_IDS[pathToKey[dbType] || dbType]

          if (!dbId) {
            sendJson(res, 404, { error: 'Database not found' })
            return
          }

          const dbResponse = await notion.databases.query({
            database_id: dbId,
            page_size: 50,
          })

          sendJson(res, 200, {
            success: true,
            results: dbResponse.results,
            has_more: dbResponse.has_more,
            next_cursor: dbResponse.next_cursor,
          })
        } else {
          sendJson(res, 404, { error: 'Endpoint not found' })
        }
        break
    }
  } catch (error) {
    console.error('API Error:', error)
    try {
      if (!res.headersSent) {
        sendJson(res, 500, {
          success: false,
          error: error.message,
          message: 'Request failed',
        })
      }
    } catch (sendErr) {
      console.error('Failed to send error JSON:', sendErr)
      try {
        if (!res.headersSent) {
          res.statusCode = 500
          res.end('Internal Server Error')
        }
      } catch (_) {}
    }
  }
}
