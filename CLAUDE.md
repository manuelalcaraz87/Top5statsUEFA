# Top5Stats
Football stats site: top 5 stats for the top 5 European leagues plus the Champions League, with league comparisons. Planned: a scoring algorithm for clubs, strikers, defenders, goalkeepers and assist providers.

## Owner
The owner has no coding background. Explain every change in plain English. Never ask them to edit code by hand.

## Stack
React + TypeScript + Vite + Tailwind in src/app. Small Express proxy in server/. Package manager: pnpm. Check your work with: pnpm build

## Hard rules
- Never display or fetch club crests, league logos, competition logos, player photos or stadium photos from any source.
- Never draw imitations of real logos or use club colour schemes or kit patterns as identifiers.
- Club, league and player names appear as plain text only.
- Never show invented posts or quotes attributed to real people or accounts.
- Site name is "Top5Stats". Do not describe it as official or affiliated with any league, club or UEFA.
- Work only on the trademark-cleanup branch. Never push to main (main auto-deploys to top5stats.com).
- Change only the files a task names. No unrelated refactoring. Do not touch src/app/components/ui.
- Never show sample, mock or placeholder numbers, players or matches as if they were real. If data is missing, show "No current data".
- Data providers are football-data.org and API-Football only. Sportmonks is not used.
