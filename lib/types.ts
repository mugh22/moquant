export type AssetType = "Stock" | "ETF" | "Crypto" | "Cash" | "Bond";
export type Cadence = "Weekly" | "Biweekly" | "Monthly";
export type RiskProfile = "Conservative" | "Balanced" | "Growth";

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  price: number;
  costBasis?: number;
  account: string;
  bucket: AllocationBucket;
}

export type AllocationBucket =
  | "US Core"
  | "US Growth"
  | "International"
  | "Bonds"
  | "Cash"
  | "Crypto Core"
  | "Altcoins"
  | "Individual Stocks";

export interface ProfileSettings {
  contributionAmount: number;
  contributionCadence: Cadence;
  recommendationCadence: Cadence;
  riskProfile: RiskProfile;
  maxSinglePositionPct: number;
  maxCryptoPct: number;
  maxAltcoinPct: number;
  driftTolerancePct: number;
  minTradeAmount: number;
}

export interface TargetAllocation {
  bucket: AllocationBucket;
  targetPct: number;
  rationale: string;
}

export interface ContributionItem {
  bucket: AllocationBucket;
  symbol: string;
  amount: number;
  currentPct: number;
  targetPct: number;
  reason: string;
}

export interface Recommendation {
  createdAt: string;
  contributionAmount: number;
  action: "NO CHANGE" | "CONTRIBUTE" | "REVIEW RISK";
  items: ContributionItem[];
  warnings: string[];
  summary: string;
}
