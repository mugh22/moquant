import { Holding, ProfileSettings, TargetAllocation } from "./types";

export const DEFAULT_SETTINGS: ProfileSettings = {
  contributionAmount: 500,
  contributionCadence: "Weekly",
  recommendationCadence: "Weekly",
  riskProfile: "Growth",
  maxSinglePositionPct: 25,
  maxCryptoPct: 25,
  maxAltcoinPct: 10,
  driftTolerancePct: 3,
  minTradeAmount: 25,
};

export const TARGETS: Record<ProfileSettings["riskProfile"], TargetAllocation[]> = {
  Conservative: [
    { bucket: "US Core", targetPct: 35, rationale: "Broad equity foundation" },
    { bucket: "US Growth", targetPct: 5, rationale: "Limited growth tilt" },
    { bucket: "International", targetPct: 15, rationale: "Geographic diversification" },
    { bucket: "Bonds", targetPct: 30, rationale: "Lower volatility and ballast" },
    { bucket: "Cash", targetPct: 10, rationale: "Liquidity reserve" },
    { bucket: "Crypto Core", targetPct: 4, rationale: "Capped BTC/ETH exposure" },
    { bucket: "Altcoins", targetPct: 1, rationale: "Small speculative sleeve" },
    { bucket: "Individual Stocks", targetPct: 0, rationale: "Avoid concentration by default" },
  ],
  Balanced: [
    { bucket: "US Core", targetPct: 40, rationale: "Broad equity foundation" },
    { bucket: "US Growth", targetPct: 10, rationale: "Moderate growth tilt" },
    { bucket: "International", targetPct: 15, rationale: "Geographic diversification" },
    { bucket: "Bonds", targetPct: 15, rationale: "Portfolio ballast" },
    { bucket: "Cash", targetPct: 5, rationale: "Liquidity reserve" },
    { bucket: "Crypto Core", targetPct: 8, rationale: "BTC/ETH sleeve" },
    { bucket: "Altcoins", targetPct: 2, rationale: "Capped high-risk sleeve" },
    { bucket: "Individual Stocks", targetPct: 5, rationale: "Controlled conviction positions" },
  ],
  Growth: [
    { bucket: "US Core", targetPct: 35, rationale: "Broad equity foundation" },
    { bucket: "US Growth", targetPct: 15, rationale: "Growth allocation" },
    { bucket: "International", targetPct: 10, rationale: "Geographic diversification" },
    { bucket: "Bonds", targetPct: 5, rationale: "Limited ballast" },
    { bucket: "Cash", targetPct: 5, rationale: "Liquidity reserve" },
    { bucket: "Crypto Core", targetPct: 12, rationale: "BTC/ETH growth sleeve" },
    { bucket: "Altcoins", targetPct: 5, rationale: "Capped tactical sleeve" },
    { bucket: "Individual Stocks", targetPct: 13, rationale: "Controlled conviction positions" },
  ],
};

export const SAMPLE_HOLDINGS: Holding[] = [
  { id: "demo-1", symbol: "VTI", name: "Vanguard Total Stock Market ETF", type: "ETF", quantity: 10, price: 300, account: "Demo brokerage", bucket: "US Core" },
  { id: "demo-2", symbol: "VXUS", name: "Vanguard Total International Stock ETF", type: "ETF", quantity: 8, price: 70, account: "Demo brokerage", bucket: "International" },
  { id: "demo-3", symbol: "BND", name: "Vanguard Total Bond Market ETF", type: "Bond", quantity: 5, price: 75, account: "Demo brokerage", bucket: "Bonds" },
  { id: "demo-4", symbol: "BTC", name: "Bitcoin", type: "Crypto", quantity: 0.01, price: 100000, account: "Demo crypto", bucket: "Crypto Core" },
  { id: "demo-5", symbol: "SOL", name: "Solana", type: "Crypto", quantity: 1, price: 200, account: "Demo crypto", bucket: "Altcoins" },
];
