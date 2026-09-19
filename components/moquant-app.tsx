"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, SAMPLE_HOLDINGS, TARGETS } from "@/lib/defaults";
import { bucketValues, contributionPlan, holdingValue, portfolioValue } from "@/lib/portfolio";
import { AllocationBucket, AssetType, Holding, ProfileSettings } from "@/lib/types";

type View = "Dashboard" | "Portfolio" | "Contribution plan" | "History" | "Settings";
const views: View[] = ["Dashboard", "Portfolio", "Contribution plan", "History", "Settings"];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const buckets: AllocationBucket[] = ["US Core", "US Growth", "International", "Bonds", "Cash", "Crypto Core", "Altcoins", "Individual Stocks"];
const assetTypes: AssetType[] = ["Stock", "ETF", "Crypto", "Cash", "Bond"];

export function MoQuantApp() {
  const [view, setView] = useState<View>("Dashboard");
  const [holdings, setHoldings] = useStoredState<Holding[]>("moquant-holdings", SAMPLE_HOLDINGS);
  const [settings, setSettings] = useStoredState<ProfileSettings>("moquant-settings", DEFAULT_SETTINGS);
  const [history, setHistory] = useStoredState<ReturnType<typeof contributionPlan>[]>("moquant-history", []);
  const total = portfolioValue(holdings);
  const plan = useMemo(() => contributionPlan(holdings, settings, TARGETS[settings.riskProfile]), [holdings, settings]);

  function savePlan() {
    setHistory((items) => [plan, ...items].slice(0, 24));
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">M</span><span>MoQuant</span></div>
        <p className="tagline">Your systematic investment committee.</p>
        <nav>{views.map((item) => <button className={item === view ? "nav active" : "nav"} key={item} onClick={() => setView(item)}>{icon(item)}<span>{item}</span></button>)}</nav>
        <div className="sidebarFoot"><span className="statusDot" /> Analysis ready<p>Local private workspace</p></div>
      </aside>
      <main>
        <header><div><p className="eyebrow">PERSONAL PORTFOLIO INTELLIGENCE</p><h1>{view}</h1></div><div className="regime"><span>Market regime</span><strong>RISK-ON</strong><small>Model integration next</small></div></header>
        {view === "Dashboard" && <Dashboard holdings={holdings} settings={settings} plan={plan} total={total} onOpenPlan={() => setView("Contribution plan")} />}
        {view === "Portfolio" && <Portfolio holdings={holdings} setHoldings={setHoldings} total={total} />}
        {view === "Contribution plan" && <PlanView plan={plan} onSave={savePlan} />}
        {view === "History" && <History history={history} />}
        {view === "Settings" && <Settings settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  );
}

function Dashboard({ holdings, settings, plan, total, onOpenPlan }: { holdings: Holding[]; settings: ProfileSettings; plan: ReturnType<typeof contributionPlan>; total: number; onOpenPlan: () => void }) {
  const values = bucketValues(holdings);
  const biggest = [...holdings].sort((a, b) => holdingValue(b) - holdingValue(a))[0];
  return <>
    <section className="metrics">
      <Metric label="Portfolio value" value={money.format(total)} note={`${holdings.length} positions`} />
      <Metric label={`Next ${settings.contributionCadence.toLowerCase()} contribution`} value={money.format(settings.contributionAmount)} note={`${settings.riskProfile} profile`} accent />
      <Metric label="Largest position" value={biggest?.symbol ?? "—"} note={biggest ? `${((holdingValue(biggest) / total) * 100).toFixed(1)}% of portfolio` : "No holdings"} />
      <Metric label="Action" value={plan.action} note={`${plan.items.length} allocation${plan.items.length === 1 ? "" : "s"} proposed`} />
    </section>
    <section className="dashboardGrid">
      <article className="card heroCard">
        <div><p className="eyebrow">YOUR NEXT MOVE</p><h2>Deploy the next {money.format(settings.contributionAmount)}</h2><p className="muted">Contribution-first rebalancing prioritizes underweight allocations before considering sales.</p></div>
        <div className="allocationList">{plan.items.slice(0, 4).map(item => <div key={item.bucket}><span><i className={`dot color-${colorIndex(item.bucket)}`} />{item.symbol}<small>{item.bucket}</small></span><strong>{money.format(item.amount)}</strong></div>)}</div>
        <button className="primary" onClick={onOpenPlan}>Review full recommendation →</button>
      </article>
      <article className="card"><div className="cardHead"><div><p className="eyebrow">ALLOCATION</p><h2>Portfolio mix</h2></div></div><div className="mixBar">{Object.entries(values).map(([bucket, value]) => <span key={bucket} className={`color-${colorIndex(bucket)}`} style={{ width: `${(value / total) * 100}%` }} />)}</div><div className="legend">{Object.entries(values).sort((a,b)=>b[1]-a[1]).map(([bucket,value])=><div key={bucket}><span><i className={`dot color-${colorIndex(bucket)}`} />{bucket}</span><strong>{((value/total)*100).toFixed(1)}%</strong></div>)}</div></article>
      <article className="card full"><div className="cardHead"><div><p className="eyebrow">RISK REVIEW</p><h2>What deserves attention</h2></div><span className={plan.warnings.length ? "pill amber" : "pill green"}>{plan.warnings.length ? `${plan.warnings.length} flags` : "Within limits"}</span></div>{plan.warnings.length ? <div className="warningGrid">{plan.warnings.map(w=><div className="warning" key={w}><b>!</b><span>{w}</span></div>)}</div> : <p className="muted">No configured concentration limit is currently breached.</p>}</article>
    </section>
  </>;
}

function Portfolio({ holdings, setHoldings, total }: { holdings: Holding[]; setHoldings: React.Dispatch<React.SetStateAction<Holding[]>>; total: number }) {
  const [adding, setAdding] = useState(false);
  function remove(id: string) { setHoldings(items => items.filter(item => item.id !== id)); }
  return <section className="card"><div className="cardHead"><div><p className="eyebrow">CURRENT HOLDINGS</p><h2>{money.format(total)} across {holdings.length} positions</h2></div><button className="primary compact" onClick={()=>setAdding(!adding)}>{adding ? "Cancel" : "+ Add holding"}</button></div>
    {adding && <HoldingForm onAdd={holding=>{setHoldings(items=>[...items,holding]);setAdding(false);}} />}
    <div className="tableWrap"><table><thead><tr><th>Asset</th><th>Type</th><th>Account</th><th>Quantity</th><th>Price</th><th>Value</th><th>Weight</th><th /></tr></thead><tbody>{holdings.map(h=><tr key={h.id}><td><strong>{h.symbol}</strong><small>{h.name}</small></td><td><span className="pill">{h.type}</span></td><td>{h.account}</td><td>{h.quantity.toLocaleString()}</td><td>{money.format(h.price)}</td><td><strong>{money.format(holdingValue(h))}</strong></td><td>{((holdingValue(h)/total)*100).toFixed(1)}%</td><td><button className="iconButton" onClick={()=>remove(h.id)}>×</button></td></tr>)}</tbody></table></div>
  </section>;
}

function HoldingForm({ onAdd }: { onAdd: (holding: Holding)=>void }) {
  const [form,setForm]=useState({symbol:"",name:"",type:"ETF" as AssetType,quantity:"",price:"",account:"Brokerage",bucket:"US Core" as AllocationBucket});
  function submit(e:FormEvent){e.preventDefault();onAdd({...form,id:crypto.randomUUID(),symbol:form.symbol.trim().toUpperCase(),quantity:Number(form.quantity),price:Number(form.price)});}
  return <form className="holdingForm" onSubmit={submit}><label>Symbol<input required value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value})} /></label><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label><label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value as AssetType})}>{assetTypes.map(x=><option key={x}>{x}</option>)}</select></label><label>Quantity<input required min="0" step="any" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} /></label><label>Current price<input required min="0" step="any" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></label><label>Bucket<select value={form.bucket} onChange={e=>setForm({...form,bucket:e.target.value as AllocationBucket})}>{buckets.map(x=><option key={x}>{x}</option>)}</select></label><label>Account<input value={form.account} onChange={e=>setForm({...form,account:e.target.value})} /></label><button className="primary compact">Save holding</button></form>;
}

function PlanView({ plan, onSave }: { plan: ReturnType<typeof contributionPlan>; onSave:()=>void }) {
  return <section className="planLayout"><article className="card decision"><p className="eyebrow">MOQUANT DECISION</p><div className="decisionTop"><div><span className="pill green">{plan.action}</span><h2>Invest the next {money.format(plan.contributionAmount)}</h2><p>{plan.summary}</p></div><button className="primary compact" onClick={onSave}>Save recommendation</button></div><div className="planItems">{plan.items.map(item=><div key={item.bucket}><div className="amount">{money.format(item.amount)}</div><div><h3>{item.symbol}<span>{item.bucket}</span></h3><p>{item.reason}</p></div><div className="drift"><small>Current</small>{item.currentPct.toFixed(1)}%<i>→</i><small>Target</small>{item.targetPct.toFixed(1)}%</div></div>)}</div></article><article className="card"><p className="eyebrow">GUARDRAILS</p><h2>Before you act</h2>{plan.warnings.length ? plan.warnings.map(x=><div className="warning" key={x}><b>!</b><span>{x}</span></div>) : <p className="muted">No configured limit is breached.</p>}<div className="notice">This is a deterministic planning output—not an order, guarantee, or substitute for tax and financial advice.</div></article></section>;
}

function History({ history }: { history: ReturnType<typeof contributionPlan>[] }) { return <section className="card"><p className="eyebrow">AUDIT TRAIL</p><h2>Saved recommendations</h2>{history.length===0?<div className="empty">Save a contribution plan to begin tracking how recommendations change.</div>:<div className="history">{history.map((h,i)=><div key={`${h.createdAt}-${i}`}><time>{new Date(h.createdAt).toLocaleString()}</time><strong>{h.action}</strong><span>{money.format(h.contributionAmount)} · {h.items.length} allocations · {h.warnings.length} flags</span></div>)}</div>}</section>; }

function Settings({ settings, setSettings }: { settings: ProfileSettings; setSettings: React.Dispatch<React.SetStateAction<ProfileSettings>> }) {
  const number=(key:keyof ProfileSettings,label:string,suffix:string)=><label>{label}<div className="inputSuffix"><input min="0" type="number" value={settings[key] as number} onChange={e=>setSettings({...settings,[key]:Number(e.target.value)})}/><span>{suffix}</span></div></label>;
  return <section className="settingsGrid"><article className="card"><p className="eyebrow">CONTRIBUTIONS</p><h2>Investment rhythm</h2><div className="formGrid">{number("contributionAmount","Recurring contribution","USD")}<label>Contribution cadence<select value={settings.contributionCadence} onChange={e=>setSettings({...settings,contributionCadence:e.target.value as ProfileSettings["contributionCadence"]})}>{["Weekly","Biweekly","Monthly"].map(x=><option key={x}>{x}</option>)}</select></label><label>Recommendation cadence<select value={settings.recommendationCadence} onChange={e=>setSettings({...settings,recommendationCadence:e.target.value as ProfileSettings["recommendationCadence"]})}>{["Weekly","Biweekly","Monthly"].map(x=><option key={x}>{x}</option>)}</select></label><label>Risk profile<select value={settings.riskProfile} onChange={e=>setSettings({...settings,riskProfile:e.target.value as ProfileSettings["riskProfile"]})}>{["Conservative","Balanced","Growth"].map(x=><option key={x}>{x}</option>)}</select></label></div></article><article className="card"><p className="eyebrow">RISK LIMITS</p><h2>Portfolio guardrails</h2><div className="formGrid">{number("maxSinglePositionPct","Maximum position","%")}{number("maxCryptoPct","Maximum total crypto","%")}{number("maxAltcoinPct","Maximum altcoins","%")}{number("driftTolerancePct","Rebalance tolerance","%")}{number("minTradeAmount","Minimum allocation","USD")}</div></article><article className="card full"><p className="eyebrow">CURRENT STRATEGY</p><h2>{settings.riskProfile} target allocation</h2><div className="targetGrid">{TARGETS[settings.riskProfile].map(t=><div key={t.bucket}><span>{t.bucket}</span><strong>{t.targetPct}%</strong><small>{t.rationale}</small></div>)}</div></article></section>;
}

function Metric({label,value,note,accent=false}:{label:string;value:string;note:string;accent?:boolean}) { return <article className={accent?"metric accent":"metric"}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function colorIndex(value:string){return Math.abs([...value].reduce((n,c)=>n+c.charCodeAt(0),0))%7;}
function icon(view:View){return ({Dashboard:"◫",Portfolio:"◎","Contribution plan":"↗",History:"◷",Settings:"⚙"} as Record<View,string>)[view];}
function useStoredState<T>(key:string,initial:T):[T,React.Dispatch<React.SetStateAction<T>>]{const [value,setValue]=useState(initial);useEffect(()=>{const saved=localStorage.getItem(key);if(saved)try{setValue(JSON.parse(saved));}catch{}},[key]);useEffect(()=>{localStorage.setItem(key,JSON.stringify(value));},[key,value]);return[value,setValue];}
