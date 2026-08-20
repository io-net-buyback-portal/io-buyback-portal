import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Wallet,
  X
} from "lucide-react";
import "./styles.css";

const ADDRESS = "0x6b60465D676d5FF50F615F2EB5F88baFA56a42b3";
const BONUS = 0.11;
const MIN = 5;
const MAX = 500;

const amounts = [
  5, 10, 6, 8, 13, 12, 20, 7, 15, 25, 18, 9, 11, 22, 16
];

const offsets = [
  2, 9, 24, 41, 58, 72, 133, 242, 427, 661, 870, 1500, 3100, 5200, 7600
];

const seed = () => {
  const n = Date.now();

  return amounts.map((amount, i) => ({
    id: `demo-${i}-${n}`,
    amount,
    time: new Date(n - offsets[i] * 6e4)
  }));
};

const rel = (d, now = Date.now()) => {
  let m = Math.max(0, Math.floor((now - d.getTime()) / 6e4));

  if (m < 60) {
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }

  const h = Math.floor(m / 60);

  if (h < 24) {
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }

  if (h < 48) {
    return "Yesterday";
  }

  const day = Math.floor(h / 24);

  return `${day} days ago`;
};

const money = (v) => {
  if (v == null || Number.isNaN(v)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v < 1 ? 4 : 2
  }).format(v);
};

const tok = (v) => {
  if (!v || Number.isNaN(v)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4
  }).format(v);
};

function Stat({ t, v }) {
  return (
    <div className="stat-card">
      <small>{t}</small>
      <strong>{v}</strong>
    </div>
  );
}

function Market({ name, sym, price, state }) {
  return (
    <div className="card market">
      <b>{name}</b>
      <small>{sym}</small>
      <strong>{price}</strong>
      <small>{state}</small>
    </div>
  );
}

function Row({ l, v, hi }) {
  return (
    <div className={hi ? "row hi" : "row"}>
      <span>{l}</span>
      <b>{v}</b>
    </div>
  );
}

function Step({ n, t }) {
  return (
    <div className="step">
      <b>{n}</b>
      <span>
        <strong>{t}</strong>
        <small>Review the information carefully</small>
      </span>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(true);
  const [amount, setAmount] = useState(5);
  const [io, setIo] = useState(null);
  const [bnb, setBnb] = useState(null);
  const [state, setState] = useState("loading");
  const [updated, setUpdated] = useState(null);
  const [items, setItems] = useState(seed);
  const [modal, setModal] = useState(false);
  const [wallet, setWallet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  async function market() {
    setState("loading");

    try {
      const [ioResponse, bnbResponse] = await Promise.all([
        fetch(
          "https://data-api.binance.vision/api/v3/ticker/price?symbol=IOUSDT"
        ),
        fetch(
          "https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT"
        )
      ]);

      if (!ioResponse.ok || !bnbResponse.ok) {
        throw new Error("Market data request failed");
      }

      const ioData = await ioResponse.json();
      const bnbData = await bnbResponse.json();

      const ioPrice = Number(ioData.price);
      const bnbPrice = Number(bnbData.price);

      if (!Number.isFinite(ioPrice) || !Number.isFinite(bnbPrice)) {
        throw new Error("Invalid market data");
      }

      setIo(ioPrice);
      setBnb(bnbPrice);
      setUpdated(Date.now());
      setState("live");
    } catch (error) {
      console.error("Market data error:", error);

      setIo(null);
      setBnb(null);
      setUpdated(null);
      setState("unavailable");
    }
  }

  useEffect(() => {
    market();

    const x = setInterval(market, 6e4);

    return () => clearInterval(x);
  }, []);

  useEffect(() => {
    const x = setInterval(() => {
      setNow(Date.now());
    }, 3e4);

    return () => clearInterval(x);
  }, []);

  useEffect(() => {
    const x = setInterval(() => {
      setItems((p) =>
        [
          {
            id: String(Date.now()),
            amount: amounts[Math.floor(Math.random() * amounts.length)],
            time: new Date()
          },
          ...p
        ].slice(0, 20)
      );
    }, 9e4);

    return () => clearInterval(x);
  }, []);

  const base = useMemo(() => {
    if (!io || !bnb) {
      return 0;
    }

    return (amount * bnb) / io;
  }, [amount, bnb, io]);

  const bonus = base * BONUS;
  const total = base + bonus;
  const usd = amount * (bnb || 0);

  const range =
    amount < MIN
      ? "Participation starts at 5 BNB."
      : amount > MAX
      ? "Maximum participation is 500 BNB."
      : "";

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(ADDRESS);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <header>
        <div className="brand">
          <b>IO</b>

          <span>
            <strong>IO Buyback Portal</strong>
            <small>WEB3 BUYBACK NETWORK</small>
          </span>
        </div>

        <nav>
          <a>Dashboard</a>
          <a>Buyback</a>
          <a>Calculator</a>
          <a>Activity</a>
          <a>About</a>
        </nav>

        <div className="actions">
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />}
          </button>

          <button
            className="wallet"
            onClick={() => setWallet(!wallet)}
          >
            <Wallet />

            {wallet ? "0x••••••••" : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <label>✦ WEB3 ALLOCATION INTERFACE</label>

            <h1>IO Buyback</h1>

            <p>
              Calculate an estimated IO allocation using current BNB and IO
              market prices.
            </p>

            <div>
              <button
                className="primary"
                onClick={() =>
                  document
                    .getElementById("calc")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Calculate Allocation
                <ArrowRight />
              </button>
            </div>
          </div>

          <div className="orb">IO</div>
        </section>

        <div className="stats">
          <Stat t="Minimum Participation" v="5 BNB" />
          <Stat t="Maximum Participation" v="500 BNB" />
          <Stat t="Starting Bonus" v="11%" />
          <Stat t="Network" v="BNB Smart Chain" />
        </div>

        <section className="section">
          <div className="heading">
            <div>
              <label>MARKET OVERVIEW</label>
              <h2>Live Market Data</h2>
            </div>

            <button className="outline" onClick={market}>
              <RefreshCw />
              Refresh
            </button>
          </div>

          <div className="cards">
            <Market
              name="IO Network"
              sym="IO/USD"
              price={money(io)}
              state={state}
            />

            <Market
              name="BNB"
              sym="BNB/USD"
              price={money(bnb)}
              state={state}
            />

            <div className="card market">
              <i>%</i>
              <small>PROGRAM</small>
              <h3>Buyback Program</h3>
              <strong>5–500 BNB</strong>
              <p>11% starting bonus</p>
            </div>
          </div>

          <div className="updated">
            <Clock3 />

            {state === "live"
              ? `Live · Updated ${
                  updated ? rel(new Date(updated)) : "just now"
                }`
              : state === "loading"
              ? "Loading market data…"
              : "Market data temporarily unavailable"}
          </div>
        </section>

        <section id="calc" className="section calc">
          <div className="calculator card">
            <div className="heading">
              <div>
                <label>ESTIMATE</label>
                <h2>Buyback Calculator</h2>

                <p>
                  Enter a BNB amount to estimate an IO allocation.
                </p>
              </div>

              <em>+11% BONUS</em>
            </div>

            <label>BNB Amount</label>

            <div className="input">
              <input
                type="number"
                min="0"
                step=".01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />

              <b>BNB</b>
            </div>

            {range && <div className="notice">{range}</div>}

            <Row l="BNB USD Value" v={money(usd)} />
            <Row l="Current BNB Price" v={money(bnb)} />
            <Row l="Current IO Price" v={money(io)} />
            <Row l="Base IO Allocation" v={`${tok(base)} IO`} />
            <Row l="Bonus (11%)" v={`+${tok(bonus)} IO`} />

            <Row
              hi
              l="Estimated Total IO"
              v={`${tok(total)} IO`}
            />

            <button
              className="primary full"
              disabled={amount < MIN || amount > MAX}
              onClick={() => setModal(true)}
            >
              Review Participation
              <ArrowRight />
            </button>

            <small>
              Calculation is an estimate based on displayed market data.
            </small>
          </div>
        </section>

        <section className="twocol section">
          <div className="card info">
            <label>ABOUT</label>

            <h2>About the Buyback</h2>

            <p>
              This portal demonstrates a Web3 allocation interface where a
              BNB amount can be used to estimate an IO allocation using
              displayed market prices and an applicable bonus.
            </p>

            <p>
              Market prices are variable and estimates can change.
            </p>
          </div>

          <div className="card info">
            <label>PROCESS</label>

            <h2>How to Participate</h2>

            <Step n="01" t="Enter BNB Amount" />
            <Step n="02" t="Review Allocation" />
            <Step n="03" t="Review Details" />
            <Step n="04" t="Confirm Demo" />
          </div>
        </section>

        <section className="section">
          <div className="heading">
            <div>
              <label>DEMO ACTIVITY</label>

              <h2>Recent Participation</h2>

              <p>
                Simulated participation activity for the prototype.
              </p>
            </div>

            <em>DEMO DATA</em>
          </div>

          <div className="activity">
            {items.map((x) => (
              <div className="activityItem" key={x.id}>
                <span>●</span>

                <div>
                  <b>{rel(x.time, now)}</b>
                  <small>{x.amount} BNB participated</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section faq">
          <label>FAQ</label>

          <h2>About this interface</h2>

          <details>
            <summary>What is the participation range?</summary>

            <p>
              The displayed prototype range is 5 BNB to 500 BNB.
            </p>
          </details>

          <details>
            <summary>How is the bonus calculated?</summary>

            <p>
              The calculator applies an 11% bonus to the estimated base
              allocation.
            </p>
          </details>

         <details>
  <summary>
    Why Participate?
  </summary>

  <p>
    Participate in the IO Buyback Program to receive an 11% starting bonus on eligible allocations, use current BNB and IO market prices for your estimate, and review your allocation before confirming your participation.
  </p>
</details>

      <footer>
        <b>IO Buyback Portal</b>
        <span>
          Web3 allocation interface prototype · © 2026
        </span>
      </footer>

      {modal && (
        <div
          className="overlay"
          onClick={() => setModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setModal(false)}
            >
              ×
            </button>

            <h3>Confirm Demo Participation</h3>

            <p>Enter BNB Amount</p>

            <input
              type="number"
              min="5"
              max="500"
              step=".01"
              value={amount}
              onChange={(e) =>
                setAmount(Number(e.target.value))
              }
            />

            <button
              onClick={() => {
                setModal(false);
              }}
            >
              Confirm Demo Participation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
