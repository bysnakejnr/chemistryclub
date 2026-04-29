# Chem Club Website

A modern React + TypeScript website for the Chem Club, featuring dynamic content management through Notion databases. The site includes an interactive periodic table, events calendar, chemistry dictionary, and educational resources. It was done by AI mostly with cleanup and debugging done by me, used Windscribe, Claude and Cursor to develop.

## Architecture

- **Frontend**: React + TypeScript + Vite (running on port 5173)
- **Backend**: Express.js proxy server (running on port 3001)
- **Database**: Notion databases for content management
- **Styling**: TailwindCSS with custom chemistry-themed design

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (see Environment Setup section below)

3. **Start both servers**:
   ```bash
   # Start the Notion proxy server (port 3001)
   node server.cjs

   # Start the frontend dev server (port 5173)
   npm run dev
   ```

4. **Access the site**: Open `http://localhost:5173` in your browser


## Notion Integration

### Database Configuration

The application connects to four Notion databases:

1. **Chem Info Database**
   - Contains chemistry topics and educational content
   - Fields: Title, Date, Summary, Details, Cover Image, Gallery Images

2. **Field Trips Database**
   - Contains club events and field trips
   - Fields: Title, Date, Location, Summary, What We Learned, Cover Image, Gallery Images

3. **Elements Database**
   - Contains periodic table element data
   - Fields: Element Name, Symbol, Atomic Number, Real Life Usage, Composition, Discovery Date, Toxicity/Radioactivity, Where Found, Most Common Use/Compound

4. **Dictionary Database**
   - Contains chemistry vocabulary terms
   - Fields: Real Word, Our Better Word, Explanation, Category

### API Token Setup

1. Go to [Notion Integrations]
2. Create a new integration
3. Generate an API token
4. Add the token to your `.env` file as `VITE_NOTION_TOKEN`
5. Share each database with your integration:
   - Open each database in Notion
   - Click "Share" > "Invite" > select your integration

## Server Configuration

### Proxy Server (server.cjs)

The Express proxy server handles:
- CORS configuration for frontend-backend communication
- Notion API authentication and requests
- Database query endpoints
- Error handling and logging

#### Key Endpoints

- `GET /api/health` - Server health check
- `GET /api/test` - Notion connection test
- `POST /api/query` - Generic database query (used by frontend)
- `GET /api/databases/{type}` - Specific database endpoints
- `GET /api/test-all-databases` - Test all database connections

#### Database ID Locations

Database IDs are defined in `server.cjs`:


Page IDs are defined in `server.cjs`:

### Frontend Configuration

Frontend database references are in `src/lib/notion-proxy-server.ts`:


## Project Structure

```
chem-club-site/
  src/
    components/          # React components
    pages/               # Page components
    lib/                 # Utility functions and API clients
    data/                # Static data fallbacks
    assets/              # Images and static assets
  public/               # Public assets
  server.cjs            # Express proxy server
  .env                  # Environment variables
  package.json          # Dependencies and scripts
```

## Key Components

### Frontend Pages

- **Landing Page** (`src/pages/LandingPage.tsx`) - Main landing page
- **Dictionary Page** (`src/pages/DictionaryPage.tsx`) - Chemistry terms dictionary
- **Events Page** (`src/pages/EventsPage.tsx`) - Club events and field trips
- **Chem Info Page** (`src/pages/ChemInfoPage.tsx`) - Chemistry topics
- **Chem Topic Page** (`src/pages/ChemTopicPage.tsx`) - Individual topic details

### Key Components

- **DictionaryTable** (`src/components/DictionaryTable.tsx`) - Searchable dictionary
- **EventCard** (`src/components/EventCard.tsx`) - Event display cards
- **AllElements** (`src/components/AllElements.tsx`) - Interactive periodic table

## API Integration

### Frontend API Client

The frontend uses `src/lib/notion-proxy-server.ts` to communicate with the proxy server:

```typescript
// Test connection
await testProxyConnection()

// Fetch data
const elements = await fetchElementsFromProxy()
const events = await fetchEventsFromProxy()
const dictionary = await fetchDictionaryFromProxy()
const chemTopics = await fetchChemTopicsFromProxy()
```

### Data Mapping

Frontend includes mapping functions to convert Notion data to application types:

- `mapNotionPageToElement()` - Maps Notion pages to ChemElement objects
- `mapNotionPageToEvent()` - Maps Notion pages to ClubEvent objects
- `mapNotionPageToChemTerm()` - Maps Notion pages to ChemTerm objects
- `mapNotionPageToChemTopic()` - Maps Notion pages to ChemTopic objects

## Development

### Running the Application

1. **Start proxy server**:
   ```bash
   node server.cjs
   ```
   Server runs on `http://localhost:3001`

2. **Start frontend**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Testing Database Connections

Test all database connections:
```bash
curl http://localhost:3001/api/test-all-databases
```

Test individual databases:
```bash
curl http://localhost:3001/api/databases/elements
curl http://localhost:3001/api/databases/dictionary
curl http://localhost:3001/api/databases/field-trips
curl http://localhost:3001/api/databases/chem-info
```

### Troubleshooting

#### Common Issues

1. **"Notion connection failed"**
   - Check API token in `.env` file
   - Ensure databases are shared with your integration
   - Verify database IDs are correct

2. **"CORS errors"**
   - Ensure proxy server is running on port 3001
   - Check CORS configuration in `server.cjs`

3. **"Database not found"**
   - Verify database IDs match your Notion databases
   - Ensure integration has access to databases

4. **"Empty data"**
   - Check that databases contain entries
   - Verify field names match mapping functions

#### Debug Mode

Enable debug logging by setting environment variable:
```env
DEBUG=true
```

## Security Notes

- **Never commit API tokens** to version control
- **Use environment variables** for all sensitive data
- **Share databases only with trusted integrations**
- **Regularly rotate API tokens** for security

## Dependencies

### Backend Dependencies
- `express` - Web server framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `@notionhq/client@2.2.15` - Notion API client

### Frontend Dependencies
- `react` + `react-dom` - React framework
- `react-router-dom` - Client-side routing
- `typescript` - Type safety
- `vite` - Build tool and dev server
- `tailwindcss` - CSS framework

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Build the frontend: `npm run build`
3. Deploy both frontend and backend to your hosting platform
4. Ensure CORS origins are updated for production domain

### Security Considerations

- Use HTTPS in production
- Implement proper error handling
- Add rate limiting to API endpoints
- Monitor API usage and errors

## Contributing

1. Update database IDs in both `server.cjs` and `src/lib/notion-proxy-server.ts`
2. Restart both servers after changes
3. Test all database connections
4. Update documentation as needed

## Support

For issues with:
- **Notion API**: Check Notion API documentation
- **Database setup**: Verify database sharing and field names
- **Server issues**: Check server logs and environment variables
- **Frontend issues**: Check browser console for errors
