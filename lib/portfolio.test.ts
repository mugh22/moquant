import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, TARGETS } from "./defaults";
import { contributionPlan, portfolioValue } from "./portfolio";
import { Holding } from "./types";

const holdings: Holding[] = [
  { id: "1", symbol: "VTI", name: "VTI", type: "ETF", quantity: 10, price: 100, account: "Brokerage", bucket: "US Core" },
  { id: "2", symbol: "BTC", name: "Bitcoin", type: "Crypto", quantity: 1, price: 100, account: "Crypto", bucket: "Crypto Core" },
];

describe("portfolio engine", () => {
  it("calculates portfolio value", () => expect(portfolioValue(holdings)).toBe(1100));

  it("allocates exactly the contribution", () => {
    const plan = contributionPlan(holdings, DEFAULT_SETTINGS, TARGETS.Growth);
    expect(plan.items.reduce((sum, item) => sum + item.amount, 0)).toBe(500);
    expect(plan.items.every((item) => Number.isFinite(item.amount))).toBe(true);
  });

  it("blocks new crypto contributions above the cap", () => {
    const cryptoHeavy: Holding[] = [{ ...holdings[1], quantity: 20 }];
    const plan = contributionPlan(cryptoHeavy, { ...DEFAULT_SETTINGS, maxCryptoPct: 20 }, TARGETS.Growth);
    expect(plan.warnings.some((warning) => warning.includes("Crypto is above"))).toBe(true);
    expect(plan.items.every((item) => item.bucket !== "Crypto Core" && item.bucket !== "Altcoins")).toBe(true);
  });

  it("returns no change for an empty portfolio", () => {
    expect(contributionPlan([], DEFAULT_SETTINGS, TARGETS.Growth).action).toBe("NO CHANGE");
  });
});
