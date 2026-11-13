# Top5Stats

Top5Stats is an independent football statistics site. It shows the top 5 teams, goal scorers, assist providers, defenders and goalkeepers for the five biggest European leagues (La Liga, Premier League, Serie A, Bundesliga, Ligue 1) and the Champions League, and lets you compare the leagues side by side.

Top5Stats is not affiliated with, endorsed by or sponsored by any league, club, player or UEFA. Club, league and player names are used for identification only.

Data comes from [football-data.org](https://www.football-data.org/), [API-Football](https://www.api-football.com/) and [Sportmonks](https://www.sportmonks.com/).

## What's in this project

- **The website** (`src/app`): React, TypeScript, Vite and Tailwind.
- **A small server** (`server/`): passes requests to the data providers so the API keys stay private.

## Running it on your computer

You need [Node.js](https://nodejs.org/) 18 or newer and [pnpm](https://pnpm.io/).

1. **Install the website's packages** (in the project folder):

   ```bash
   pnpm install
   ```

2. **Set up the server.** In the `server` folder, copy `.env.example` to a new file called `.env` and put your API keys in `.env`. Never put real keys in `.env.example`, because that file is shared.

   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```

   The server runs at http://localhost:3001.

3. **Start the website** (in a second terminal, in the project folder):

   ```bash
   pnpm dev
   ```

   Open http://localhost:5173.

## Checking changes

```bash
pnpm build
```

This must finish without errors before a change is merged.

## Publishing

Anything merged into the `main` branch is published automatically to top5stats.com by the GitHub Actions workflow in `.github/workflows/deploy.yml`. The server is hosted separately; its public address is set in the repository variable `VITE_API_PROXY_URL`.

## Licences

See `ATTRIBUTIONS.md` for third-party credits.
