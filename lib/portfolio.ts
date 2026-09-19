import { ContributionItem, Holding, ProfileSettings, Recommendation, TargetAllocation } from "./types";

export const holdingValue = (holding: Holding): number => holding.quantity * holding.price;

export function portfolioValue(holdings: Holding[]): number {
  return holdings.reduce((sum, holding) => sum + holdingValue(holding), 0);
}

export function bucketValues(holdings: Holding[]): Record<string, number> {
  return holdings.reduce<Record<string, number>>((result, holding) => {
    result[holding.bucket] = (result[holding.bucket] ?? 0) + holdingValue(holding);
    return result;
  }, {});
}

export function contributionPlan(
  holdings: Holding[],
  settings: ProfileSettings,
  targets: TargetAllocation[],
): Recommendation {
  const currentTotal = portfolioValue(holdings);
  const futureTotal = currentTotal + settings.contributionAmount;
  const values = bucketValues(holdings);
  const warnings: string[] = [];

  if (currentTotal <= 0 || settings.contributionAmount <= 0) {
    return {
      createdAt: new Date().toISOString(),
      contributionAmount: settings.contributionAmount,
      action: "NO CHANGE",
      items: [],
      warnings: currentTotal <= 0 ? ["Add at least one priced holding before generating a plan."] : [],
      summary: "No contribution plan is available yet.",
    };
  }

  const cryptoValue = (values["Crypto Core"] ?? 0) + (values.Altcoins ?? 0);
  if ((cryptoValue / currentTotal) * 100 > settings.maxCryptoPct) {
    warnings.push(`Crypto is above the configured ${settings.maxCryptoPct}% limit. New money will not be directed to crypto.`);
  }
  if (((values.Altcoins ?? 0) / currentTotal) * 100 > settings.maxAltcoinPct) {
    warnings.push(`Altcoins are above the configured ${settings.maxAltcoinPct}% limit.`);
  }
  holdings.forEach((holding) => {
    const pct = (holdingValue(holding) / currentTotal) * 100;
    if (pct > settings.maxSinglePositionPct) warnings.push(`${holding.symbol} is ${pct.toFixed(1)}% of the portfolio, above the ${settings.maxSinglePositionPct}% position limit.`);
  });

  const deficits = targets.map((target) => {
    const current = values[target.bucket] ?? 0;
    const desired = futureTotal * (target.targetPct / 100);
    const currentPct = (current / currentTotal) * 100;
    const cryptoBlocked = target.bucket === "Crypto Core" && (cryptoValue / currentTotal) * 100 >= settings.maxCryptoPct;
    const altBlocked = target.bucket === "Altcoins" && (
      (cryptoValue / currentTotal) * 100 >= settings.maxCryptoPct
      || ((values.Altcoins ?? 0) / currentTotal) * 100 >= settings.maxAltcoinPct
    );
    return { target, currentPct, deficit: cryptoBlocked || altBlocked ? 0 : Math.max(0, desired - current) };
  });
  const totalDeficit = deficits.reduce((sum, item) => sum + item.deficit, 0);
  const candidates = deficits.filter((item) => item.deficit > 0);
  const items: ContributionItem[] = candidates.map(({ target, currentPct, deficit }) => {
    const representative = representativeSymbol(target.bucket, holdings);
    return {
      bucket: target.bucket,
      symbol: representative,
      amount: roundToDollar(settings.contributionAmount * (deficit / totalDeficit)),
      currentPct,
      targetPct: target.targetPct,
      reason: `${target.bucket} is below its ${target.targetPct}% target. ${target.rationale}.`,
    };
  }).filter((item) => item.amount >= settings.minTradeAmount);

  const allocated = items.reduce((sum, item) => sum + item.amount, 0);
  if (items.length && allocated !== settings.contributionAmount) {
    items[0].amount += settings.contributionAmount - allocated;
  }

  return {
    createdAt: new Date().toISOString(),
    contributionAmount: settings.contributionAmount,
    action: warnings.some((warning) => warning.includes("position limit")) ? "REVIEW RISK" : items.length ? "CONTRIBUTE" : "NO CHANGE",
    items,
    warnings: [...new Set(warnings)],
    summary: items.length
      ? `Direct the next $${settings.contributionAmount.toLocaleString()} toward underweight allocations; no sales are required by this contribution plan.`
      : "Current constraints do not produce a qualifying contribution trade.",
  };
}

function representativeSymbol(bucket: string, holdings: Holding[]): string {
  const owned = holdings.filter((holding) => holding.bucket === bucket).sort((a, b) => holdingValue(a) - holdingValue(b));
  if (owned[0]) return owned[0].symbol;
  return ({ "US Core": "VTI", "US Growth": "QQQM", International: "VXUS", Bonds: "BND", Cash: "CASH", "Crypto Core": "BTC", Altcoins: "SOL", "Individual Stocks": "WATCHLIST" } as Record<string, string>)[bucket] ?? "TBD";
}

function roundToDollar(value: number): number {
  return Math.round(value);
}
