
# Sports Statistics Website

This is a code bundle for Sports Statistics Website. The original project is available at https://www.figma.com/design/KZyUanxPxiTSU76oZ8sfFx/Sports-Statistics-Website.

## Prerequisites

- Node.js (v18 or higher)
- pnpm or npm
- API tokens for:
  - Football Data API (get one at https://www.football-data.org/client/register)
  - API Football (get one at https://rapidapi.com/api-sports/api/api-football)

## Setup

### 1. Frontend Setup

Copy the environment template and add your tokens:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API tokens:

```
VITE_FD_TOKEN=your_football_data_token
VITE_AF_TOKEN=your_api_football_token
VITE_API_PROXY_URL=http://localhost:3001
```

Install dependencies:

```bash
npm install
# or
pnpm install
```

### 2. Backend Proxy Server Setup

The backend proxy server keeps API tokens secure and handles CORS requests.

Navigate to the server directory:

```bash
cd server
```

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and add your API tokens:

```
PORT=3001
NODE_ENV=development
FD_TOKEN=your_football_data_token
AF_TOKEN=your_api_football_token
CORS_ORIGIN=http://localhost:5173
CACHE_TTL_MINUTES=60
```

Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

**Terminal 1: Start the backend proxy server**

```bash
cd server
npm run dev
# or
npm start
```

The server will run on `http://localhost:3001`

**Terminal 2: Start the frontend development server**

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Security Features

✅ **Environment Variables**: All API tokens are stored in `.env.local` and `.env` files, which are never committed to the repository (see `.gitignore`)

✅ **Backend Proxy**: API requests route through a secure backend server instead of direct client-to-API calls

✅ **CORS Handling**: The backend server handles CORS properly without relying on third-party proxies

✅ **Caching**: Built-in server-side caching reduces API calls and improves performance

✅ **Error Handling**: Comprehensive error handling with fallback mechanisms

## Environment Variables

### Frontend (.env.local)

- `VITE_FD_TOKEN`: Football Data API token
- `VITE_AF_TOKEN`: API Football token
- `VITE_API_PROXY_URL`: Backend proxy server URL (default: http://localhost:3001)
- `VITE_DEBUG`: Enable debug logging (optional)

### Backend (server/.env)

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)
- `FD_TOKEN`: Football Data API token
- `AF_TOKEN`: API Football token
- `CORS_ORIGIN`: Frontend URL for CORS
- `CACHE_TTL_MINUTES`: Cache expiration time in minutes (default: 60)

## Production Deployment

The included GitHub Actions workflow deploys the frontend to GitHub Pages. The
backend proxy must be deployed separately to a Node-compatible host (such as
Render, Railway, or Fly.io). Configure a repository variable named
`VITE_API_PROXY_URL` with that public backend URL before pushing to `main`.

For production, ensure:

1. Set `NODE_ENV=production` in the backend
2. Update `VITE_API_PROXY_URL` to your production backend URL
3. Set proper `CORS_ORIGIN` to your frontend domain
4. Use environment secrets management (never commit `.env` files)
5. Consider implementing rate limiting and monitoring

The backend must listen on the host-provided `PORT` and allow the exact
frontend origin through `CORS_ORIGIN`.

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── services/         # API services (footballDataService, apiFootballService)
│   │   ├── hooks/            # Custom React hooks
│   │   └── data/             # Static data
│   ├── styles/               # Global styles
│   └── main.tsx              # Entry point
├── server/                    # Backend proxy server
│   ├── index.js              # Express server
│   ├── package.json
│   └── .env.example
├── .env.example              # Frontend env template
└── package.json
```

## API Services

### Football Data Service (`src/app/services/footballDataService.ts`)

Provides matches, standings, and top scorers data:

- `fetchMatchWindow()`: Get matches in a rolling window
- `fetchStandings(leagueId)`: Get league standings
- `fetchTopScorers(leagueId, limit)`: Get top scorers

### API Football Service (`src/app/services/apiFootballService.ts`)

Provides additional data including player photos:

- `fetchTopScorersAF(leagueId, limit)`: Get top scorers with photos
- `fetchLiveFixtures()`: Get live match updates

## Troubleshooting

**"Failed to fetch from Football Data API"**
- Check that the backend server is running on `http://localhost:3001`
- Verify API tokens are correctly set in `server/.env`
- Check CORS settings in `server/index.js`

**"Rate limited" error**
- Wait for the rate limit window to reset (Football Data: 10 req/min)
- Check server logs for detailed error messages
- Consider increasing `CACHE_TTL_MINUTES` to reduce API calls

**Connection refused**
- Ensure frontend and backend are running on correct ports
- Verify `VITE_API_PROXY_URL` matches your backend URL
- Check firewall/network settings

## License

See ATTRIBUTIONS.md for third-party licenses
