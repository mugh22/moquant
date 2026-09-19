# MoQuant

MoQuant is a focused personal portfolio contribution planner. It answers one practical question: **given what I own and my configured risk limits, where should my next contribution go?**

This repository is intentionally separate from `risk-on-scanner`. The scanner will later supply crypto regime and relative-strength signals; MoQuant owns the portfolio, allocation, contribution and recommendation experience.

## Current V1 foundation

- Responsive dashboard designed for desktop and phone
- Manual holdings management for stocks, ETFs, bonds, cash and crypto
- Configurable contribution and recommendation cadence
- Conservative, Balanced and Growth target portfolios
- Contribution-first deterministic allocation engine
- Limits for individual positions, total crypto and altcoins
- Exact dollar contribution plan
- Saved recommendation history in local browser storage
- Unit tests for valuation, allocation invariants and crypto caps

The sample prices are demonstration values. This version does **not** claim that they are live market prices. A data-provider integration is the next phase.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm test
npm run build
```

## Architecture direction

- Next.js responsive web application on Vercel
- Supabase Auth and Postgres for private hosted use
- Scheduled Python analysis through GitHub Actions
- Existing risk-on scanner integrated as a crypto-signal provider
- Email reports through the already validated Gmail delivery path

Until authentication and durable storage are configured, data is stored only in the current browser. Do not deploy this publicly with real portfolio information.

## Planned next phase

1. Supabase schema, authentication and row-level security
2. Durable holdings, profiles and recommendation history
3. Reliable stock/ETF/crypto market-data providers
4. Import of risk-on scanner outputs
5. Weekly and monthly scheduled recommendations
6. Private Vercel deployment

## Investment boundary

MoQuant produces deterministic research and planning outputs. It does not place trades, access brokerage credentials, or guarantee investment outcomes. Human approval remains required for every transaction.
