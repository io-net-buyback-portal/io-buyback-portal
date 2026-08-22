import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Moon,
  ShieldCheck,
  Sun,
  Wallet,
  Zap,
} from "lucide-react";
import "./styles.css";

const MIN_BNB = 5;
const MAX_BNB = 500;
const BONUS = 0.11;

const CONTRACT =
  "0xA6Fa11F45da5166B252756bED01E3C2bb26A2708";

const PRICE_API =
  "https://api.coingecko.com/api/v3/simple/price" +
  "?ids=cosmos,binancecoin" +
  "&vs_currencies=usd" +
  "&include_24hr_change=true";

const activityItems = [
  {
    wallet: "0x8C42...A91D",
    amount: "1,250",
    hash: "0x7a3f...91f2",
    time: "2 min ago",
  },
  {
    wallet: "0x31F7...E204",
    amount: "580",
    hash: "0xb42e...c81a",
    time: "4 min ago",
  },
  {
    wallet: "0xA73C...91B4",
    amount: "2,100",
    hash: "0x19fd...72de",
    time: "7 min ago",
  },
  {
    wallet: "0x52D1...B832",
    amount: "760",
    hash: "0x6c91...4fa2",
    time: "10 min ago",
  },
  {
    wallet: "0xD92A...44F1",
    amount: "1,480",
    hash: "0xf83b...10ca",
    time: "13 min ago",
  },
];

function formatUSD(value) {
  if (!value) return "$—";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  });
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

function AtomLogo({ small = false }) {
  return (
    <div className={`atom-logo ${small ? "small" : ""}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="7" className="atom-dot" />
        <ellipse cx="50" cy="50" rx="42" ry="18" />
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="18"
          transform="rotate(60 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="18"
          transform="rotate(120 50 50)"
        />
      </svg>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("portal-theme") !== "light"
  );

  const [atomPrice, setAtomPrice] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [atomChange, setAtomChange] = useState(0);
  const [bnbChange, setBnbChange] = useState(0);

  const [bnbAmount, setBnbAmount] = useState("");
  const [calculation, setCalculation] = useState(null);
  const [message, setMessage] = useState("");

  const [wallet, setWallet] = useState("");
  const [copied, setCopied] = useState(false);

  const [activityIndex, setActivityIndex] = useState(0);
  const [visibleActivity, setVisibleActivity] = useState([]);

  const atomBnbRate = useMemo(() => {
    if (!atomPrice || !bnbPrice) return 0;
    return bnbPrice / atomPrice;
  }, [atomPrice, bnbPrice]);

  useEffect(() => {
    document.body.classList.toggle("light", !dark);
    localStorage.setItem(
      "portal-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  async function loadPrices() {
    try {
      const response = await fetch(PRICE_API, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Price request failed");
      }

      const data = await response.json();

      setAtomPrice(Number(data.cosmos?.usd || 0));
      setBnbPrice(Number(data.binancecoin?.usd || 0));

      setAtomChange(
        Number(data.cosmos?.usd_24h_change || 0)
      );

      setBnbChange(
        Number(data.binancecoin?.usd_24h_change || 0)
      );
    } catch (error) {
      console.error("Price loading failed:", error);
    }
  }

  useEffect(() => {
    loadPrices();

    const interval = setInterval(loadPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activityItems.length) return;

    const first = activityItems[0];

    setVisibleActivity([first]);

    let index = 1;

    const interval = setInterval(() => {
      const next = activityItems[index % activityItems.length];

      setVisibleActivity((current) => {
        const updated = [next, ...current];

        if (updated.length > 4) {
          updated.pop();
        }

        return updated;
      });

      setActivityIndex(index);
      index += 1;
    }, 8500);

    return () => clearInterval(interval);
  }, []);

  function calculateAllocation() {
    const amount = Number(bnbAmount);

    setMessage("");
    setCalculation(null);

    if (!amount) {
      setMessage("Enter a BNB amount.");
      return;
    }

    if (amount < MIN_BNB) {
      setMessage(`Minimum participation is ${MIN_BNB} BNB.`);
      return;
    }

    if (amount > MAX_BNB) {
      setMessage(`Maximum participation is ${MAX_BNB} BNB.`);
      return;
    }

    if (!atomPrice || !bnbPrice) {
      setMessage(
        "Current market prices are unavailable. Please try again shortly."
      );
      return;
    }

    const estimated = (amount * bnbPrice) / atomPrice;
    const bonus = estimated * BONUS;
    const total = estimated + bonus;

    setCalculation({
      estimated,
      bonus,
      total,
    });
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert(
        "Please install MetaMask or another compatible Web3 wallet."
      );
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts?.length) {
        const address = accounts[0];

        setWallet(
          `${address.slice(0, 6)}...${address.slice(-4)}`
        );
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }

  async function copyContract() {
    try {
      await navigator.clipboard.writeText(CONTRACT);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <a href="#" className="brand">
          <AtomLogo />

          <div>
            <strong>ATOM Buyback</strong>
            <span>WEB3 ALLOCATION PORTAL</span>
          </div>
        </a>

        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#buyback">Buyback</a>
          <a href="#how">How it works</a>
        </nav>

        <div className="nav-actions">

          <button
            className="theme-btn"
            onClick={() => setDark((value) => !value)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            className="wallet-btn"
            onClick={connectWallet}
          >
            <Wallet size={15} />

            {wallet || "Connect Wallet"}
          </button>

        </div>

      </header>


      {/* HERO */}

      <section className="hero">

        <div className="hero-grid" />

        <div className="hero-copy">

          <div className="hero-badge">
            <i />
            ATOM • WEB3 ALLOCATION
          </div>

          <h1>
            The next
            <span>ATOM allocation</span>
            starts here.
          </h1>

          <p>
            Explore the allocation portal, view current market
            information, calculate an estimated allocation and
            follow activity through a modern Web3 interface.
          </p>

          <div className="hero-actions">

            <a href="#calculator" className="primary-btn">
              Calculate Allocation
              <ArrowRight size={15} />
            </a>

            <a href="#about" className="secondary-btn">
              Explore
              <ChevronRight size={14} />
            </a>

          </div>

          <div className="hero-mini-stats">

            <div>
              <strong>11%</strong>
              <span>Bonus</span>
            </div>

            <div>
              <strong>5 BNB</strong>
              <span>Minimum</span>
            </div>

            <div>
              <strong>500 BNB</strong>
              <span>Maximum</span>
            </div>

          </div>

        </div>


        <div className="hero-visual">

          <div className="visual-ring ring-a" />
          <div className="visual-ring ring-b" />
          <div className="visual-ring ring-c" />

          <div className="atom-orb-glow" />

          <div className="atom-orb">
            <AtomLogo />
          </div>

          <div className="floating-card floating-top">
            <span>ATOM PRICE</span>
            <strong>{formatUSD(atomPrice)}</strong>
          </div>

          <div className="floating-card floating-bottom">
            <span>BUYBACK BONUS</span>
            <strong>+11%</strong>
          </div>

        </div>

      </section>


      {/* MARKET */}

      <section className="market-strip">

        <div className="market-item">
          <span>ATOM</span>
          <strong>{formatUSD(atomPrice)}</strong>
          <small
            className={
              atomChange >= 0
                ? "positive"
                : "negative"
            }
          >
            {atomChange >= 0 ? "+" : ""}
            {atomChange.toFixed(2)}% 24h
          </small>
        </div>

        <div className="market-item">
          <span>BNB</span>
          <strong>{formatUSD(bnbPrice)}</strong>
          <small
            className={
              bnbChange >= 0
                ? "positive"
                : "negative"
            }
          >
            {bnbChange >= 0 ? "+" : ""}
            {bnbChange.toFixed(2)}% 24h
          </small>
        </div>

        <div className="market-item">
          <span>ATOM / BNB</span>
          <strong>
            {atomBnbRate
              ? `${atomBnbRate.toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })} ATOM`
              : "—"}
          </strong>
          <small>Current market rate</small>
        </div>

        <div className="market-item">
          <span>BUYBACK BONUS</span>
          <strong>11%</strong>
          <small>Allocation bonus</small>
        </div>

      </section>


      {/* ABOUT */}

      <section id="about" className="section about-section">

        <div className="section-label">
          <span>01</span>
          ABOUT COSMOS & ATOM
        </div>

        <div className="section-grid">

          <h2>
            Built around the
            <span>Cosmos ecosystem.</span>
          </h2>

          <div className="section-text">

            <p>
              Cosmos is an ecosystem of independent
              blockchains designed to communicate and
              interact with one another.
            </p>

            <p>
              ATOM is the native token associated with the
              Cosmos Hub and plays an important role within
              its ecosystem.
            </p>

          </div>

        </div>

        <div className="feature-grid">

          <article className="feature-card">
            <div className="feature-icon">
              ◎
            </div>

            <h3>Cosmos</h3>

            <p>
              An interconnected ecosystem built around
              independent blockchain networks.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              ✦
            </div>

            <h3>ATOM</h3>

            <p>
              The native token associated with the
              Cosmos Hub ecosystem.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              ◈
            </div>

            <h3>Web3</h3>

            <p>
              A modern interface for exploring blockchain
              information and allocation tools.
            </p>
          </article>

        </div>

      </section>


      {/* BUYBACK */}

      <section id="buyback" className="buyback-section">

        <div className="buyback-glow" />

        <div className="section-label">
          <span>02</span>
          WHY THE BUYBACK
        </div>

        <div className="buyback-heading">

          <h2>
            A structured
            <span>allocation experience.</span>
          </h2>

          <p>
            The portal brings participation information,
            market data and allocation tools together
            in one streamlined interface.
          </p>

        </div>

        <div className="reason-grid">

          <article>
            <b>01</b>
            <h3>Allocation Bonus</h3>
            <p>
              An 11% allocation bonus is displayed
              alongside the estimated amount.
            </p>
          </article>

          <article>
            <b>02</b>
            <h3>Market Awareness</h3>
            <p>
              Current ATOM and BNB prices help provide
              context for the allocation calculation.
            </p>
          </article>

          <article>
            <b>03</b>
            <h3>Clear Information</h3>
            <p>
              Participation information and contract
              details are presented in one place.
            </p>
          </article>

          <article>
            <b>04</b>
            <h3>Web3 Interface</h3>
            <p>
              A responsive experience designed for
              desktop and mobile users.
            </p>
          </article>

        </div>

      </section>


      {/* CALCULATOR */}

      <section id="calculator" className="calculator-section">

        <div className="calculator-intro">

          <div className="section-label">
            <span>03</span>
            ALLOCATION CALCULATOR
          </div>

          <h2>
            Estimate your
            <span>allocation.</span>
          </h2>

          <p>
            Enter a BNB amount to calculate an estimated
            ATOM allocation using current market prices
            and the 11% allocation bonus.
          </p>

          <div className="calculator-market">

            <div>
              <span>ATOM</span>
              <strong>{formatUSD(atomPrice)}</strong>
            </div>

            <div>
              <span>BNB</span>
              <strong>{formatUSD(bnbPrice)}</strong>
            </div>

          </div>

        </div>


        <div className="calculator-card">

          <div className="calc-card-top">

            <div>
              <span>ENTER AMOUNT</span>
              <strong>BNB Amount</strong>
            </div>

            <div className="bonus-pill">
              +11%
            </div>

          </div>

          <div className="amount-input">

            <input
              value={bnbAmount}
              onChange={(event) =>
                setBnbAmount(event.target.value)
              }
              type="number"
              min="5"
              max="500"
              step="0.01"
              placeholder="0.00"
            />

            <span>BNB</span>

          </div>

          <div className="limits">
            <span>Minimum: 5 BNB</span>
            <span>Maximum: 500 BNB</span>
          </div>

          <button
            className="calculate-btn"
            onClick={calculateAllocation}
          >
            Calculate Allocation
            <ArrowRight size={15} />
          </button>

          <p className="message">
            {message}
          </p>

          {calculation && (
            <div className="result">

              <div>
                <span>Estimated ATOM</span>
                <strong>
                  {formatNumber(calculation.estimated)}
                  {" "}ATOM
                </strong>
              </div>

              <div>
                <span>11% Bonus</span>
                <strong>
                  +{formatNumber(calculation.bonus)}
                  {" "}ATOM
                </strong>
              </div>

              <div className="result-total">
                <span>Total Allocation</span>
                <strong>
                  {formatNumber(calculation.total)}
                  {" "}ATOM
                </strong>
              </div>

            </div>
          )}

        </div>

      </section>


      {/* HOW TO PARTICIPATE */}

      <section id="how" className="how-section">

        <div className="section-label">
          <span>04</span>
          HOW TO PARTICIPATE
        </div>

        <div className="how-heading">

          <h2>
            Four simple
            <span>steps.</span>
          </h2>

          <p>
            Always review the recipient address, network,
            amount and transaction details before confirming.
          </p>

        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>

            <h3>Review</h3>

            <p>
              Review the current prices, participation
              limits and allocation information.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>

            <h3>Verify</h3>

            <p>
              Carefully verify the displayed contract
              address and network before proceeding.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>

            <h3>Confirm</h3>

            <p>
              Review the recipient address, network and
              amount inside your wallet before confirming.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>

            <h3>Track</h3>

            <p>
              Keep your transaction details available
              so confirmed activity can be independently checked.
            </p>
          </div>

        </div>

      </section>


      {/* ACTIVITY */}

      <section className="activity-section">

        <div className="activity-heading">

          <div>
            <div className="section-label">
              <span>05</span>
              ACTIVITY
            </div>

            <h2>
              Recent
              <span>activity.</span>
            </h2>
          </div>

          <div className="live-indicator">
            <i />
            LIVE
          </div>

        </div>

        <div className="activity-feed">

          {visibleActivity.map((item, index) => (
            <div
              className="activity-row"
              key={`${item.hash}-${activityIndex}-${index}`}
            >

              <div className="activity-icon">
                <Zap size={15} />
              </div>

              <div className="activity-main">

                <strong>
                  {item.amount} ATOM
                </strong>

                <span>
                  {item.wallet}
                </span>

              </div>

              <div className="activity-status">

                <strong>
                  Activity
                </strong>

                <small>
                  {item.time}
                </small>

              </div>

              <div className="activity-hash">
                {item.hash}
              </div>

            </div>
          ))}

        </div>

      </section>


      {/* CONTRACT */}

      <section className="contract-section">

        <div className="section-label">
          <span>06</span>
          CONTRACT
        </div>

        <div className="contract-card">

          <div className="contract-icon">
            <ShieldCheck size={21} />
          </div>

          <div className="contract-content">

            <span>
              CONTRACT ADDRESS
            </span>

            <strong>
              {CONTRACT}
            </strong>

            <small>
              Review the address carefully before interacting.
            </small>

          </div>

          <div className="contract-actions">

            <button onClick={copyContract}>
              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>

            <a
              href={`https://bscscan.com/token/${CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explorer ↗
            </a>

          </div>

        </div>

      </section>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
