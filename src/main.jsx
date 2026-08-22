import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clipboard,
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

const MIN_BNB = 5;
const MAX_BNB = 500;

function App() {
  const [dark, setDark] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [showWallet, setShowWallet] = useState(false);
  const [copied, setCopied] = useState(false);

  const allocation = useMemo(() => {
    const value = Number(amount);

    if (!value || value < MIN_BNB || value > MAX_BNB) {
      return null;
    }

    return {
      amount: value,
      estimated: value * 1000,
      bonus: value * 100,
      total: value * 1100,
    };
  }, [amount]);

  const contractAddress = "0x0000000000000000000000000000000000000000";

  const formatNumber = (value) =>
    Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  const handleCalculate = () => {
    if (!amount) {
      alert(`Enter an amount between ${MIN_BNB} and ${MAX_BNB} BNB.`);
      return;
    }

    if (Number(amount) < MIN_BNB) {
      alert(`Minimum participation is ${MIN_BNB} BNB.`);
      return;
    }

    if (Number(amount) > MAX_BNB) {
      alert(`Maximum participation is ${MAX_BNB} BNB.`);
      return;
    }
  };

  const handleWallet = async () => {
    if (!window.ethereum) {
      alert("Please install a compatible Web3 wallet.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts?.[0]) {
        setWallet(accounts[0]);
        setShowWallet(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <header className="header">
        <div className="brand">
          <b>IO</b>

          <div>
            <strong>IO Buyback</strong>
            <small>WEB3 ALLOCATION PORTAL</small>
          </div>
        </div>

        <nav>
          <a href="#about">About</a>
          <a href="#buyback">Buyback</a>
          <a href="#how">How it works</a>
        </nav>

        <div className="actions">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setDark((value) => !value)}
          >
            {dark ? <Sun /> : <Moon />}
          </button>

          <button
            type="button"
            className="wallet"
            onClick={() => {
              if (wallet) {
                setWallet("");
              } else {
                setShowWallet(true);
              }
            }}
          >
            <Wallet />

            {wallet
              ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="about">
          <div>
            <label>IO NETWORK • WEB3 ALLOCATION</label>

            <h1>
              The next
              <br />
              allocation
              <br />
              starts here.
            </h1>

            <p>
              Explore the IO buyback allocation interface, review current
              market information, understand the process, and calculate an
              estimated allocation before proceeding.
            </p>

            <div style={{ marginTop: 25 }}>
              <a href="#buyback" className="primary">
                Explore allocation
                <ArrowRight />
              </a>
            </div>
          </div>

          <div className="orb">IO</div>
        </section>

        <section className="stats">
          <div className="card stat">
            <small>Minimum participation</small>
            <strong>5 BNB</strong>
          </div>

          <div className="card stat">
            <small>Maximum participation</small>
            <strong>500 BNB</strong>
          </div>

          <div className="card stat">
            <small>Allocation bonus</small>
            <strong>11%</strong>
          </div>

          <div className="card stat">
            <small>Network</small>
            <strong>BNB Smart Chain</strong>
          </div>
        </section>

        <section className="section" id="buyback">
          <div className="heading">
            <div>
              <label>MARKET OVERVIEW</label>
              <h2>Market information</h2>
              <p>Review the latest available market information.</p>
            </div>

            <span className="heading em">
              <RefreshCw size={12} />
              LIVE DATA
            </span>
          </div>

          <div className="cards">
            <div className="card market">
              <i>IO</i>
              <small>MARKET</small>
              <h3>IO Network</h3>
              <strong>—</strong>
              <p>Current market price</p>
              <div className="updated">
                <Clock3 />
                Waiting for live market data
              </div>
            </div>

            <div className="card market">
              <i>B</i>
              <small>MARKET</small>
              <h3>BNB</h3>
              <strong>—</strong>
              <p>Current market price</p>
              <div className="updated">
                <Clock3 />
                Waiting for live market data
              </div>
            </div>

            <div className="card market">
              <i>◎</i>
              <small>NETWORK</small>
              <h3>BNB Smart Chain</h3>
              <strong>Active</strong>
              <p>Network availability</p>
              <div className="updated">
                <ShieldCheck />
                Network status
              </div>
            </div>
          </div>
        </section>

        <section className="section calc">
          <div className="card calculator">
            <div className="heading">
              <div>
                <label>ALLOCATION CALCULATOR</label>
                <h2>Calculate allocation</h2>
              </div>

              <em>11% BONUS</em>
            </div>

            <label htmlFor="bnbAmount">BNB amount</label>

            <div className="input">
              <input
                id="bnbAmount"
                type="number"
                min={MIN_BNB}
                max={MAX_BNB}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />

              <b>BNB</b>
            </div>

            <div className="notice">
              Participation range: {MIN_BNB}–{MAX_BNB} BNB.
            </div>

            {allocation && (
              <>
                <div className="row">
                  <span>Estimated allocation</span>
                  <b>{formatNumber(allocation.estimated)} IO</b>
                </div>

                <div className="row">
                  <span>11% allocation bonus</span>
                  <b>+{formatNumber(allocation.bonus)} IO</b>
                </div>

                <div className="row hi">
                  <span>Total estimated allocation</span>
                  <b>{formatNumber(allocation.total)} IO</b>
                </div>
              </>
            )}

            <button
              type="button"
              className="primary full"
              onClick={handleCalculate}
            >
              Calculate allocation
              <ArrowRight />
            </button>

            <small>
              Estimates are calculated from the information currently
              available on this interface.
            </small>
          </div>
        </section>

        <section className="section twocol" id="how">
          <div className="card info">
            <label>ABOUT</label>
            <h2>Understanding the buyback</h2>

            <p>
              A token buyback is a mechanism where available funds are used to
              acquire tokens from the market. The objective can include
              supporting market liquidity, managing token supply, and creating
              a structured allocation process.
            </p>

            <p>
              Participants should review the allocation information,
              supported network, applicable limits, and transaction details
              before taking any action.
            </p>
          </div>

          <div className="card info">
            <label>HOW IT WORKS</label>
            <h2>Participation steps</h2>

            <div className="step">
              <b>01</b>
              <div>
                <strong>Review the allocation</strong>
                <small>
                  Check the participation range and available information.
                </small>
              </div>
            </div>

            <div className="step">
              <b>02</b>
              <div>
                <strong>Connect your wallet</strong>
                <small>
                  Connect a compatible wallet when you are ready.
                </small>
              </div>
            </div>

            <div className="step">
              <b>03</b>
              <div>
                <strong>Review before confirming</strong>
                <small>
                  Carefully verify network and transaction information.
                </small>
              </div>
            </div>

            <div className="step">
              <b>04</b>
              <div>
                <strong>Monitor your transaction</strong>
                <small>
                  Use the relevant blockchain explorer to verify confirmed
                  transactions.
                </small>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="heading">
            <div>
              <label>ON-CHAIN ACTIVITY</label>
              <h2>Recent activity</h2>
              <p>
                Confirmed blockchain activity will appear here when connected
                to a real transaction data source.
              </p>
            </div>
          </div>

          <div className="activity">
            <div className="activityItem">
              <span>
                <Clock3 size={15} />
              </span>
              <div>
                <b>Waiting for confirmed activity</b>
                <small>No confirmed transactions available</small>
              </div>
            </div>

            <div className="activityItem">
              <span>
                <ShieldCheck size={15} />
              </span>
              <div>
                <b>Blockchain verification</b>
                <small>Activity is shown after confirmation</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section twocol">
          <div className="card info">
            <label>CONTRACT REFERENCE</label>
            <h2>Network reference</h2>

            <p>
              Always verify the destination address and network independently
              before signing or sending a blockchain transaction.
            </p>

            <div className="address">
              <Clipboard />
              <span>{contractAddress}</span>

              <button type="button" onClick={copyAddress}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="card info faq">
            <label>FAQ</label>
            <h2>Common questions</h2>

            <details>
              <summary>What network does the interface use?</summary>
              <p>
                The interface is designed around the BNB Smart Chain network.
              </p>
            </details>

            <details>
              <summary>How is an allocation calculated?</summary>
              <p>
                Enter an amount within the displayed participation range and
                the calculator will provide an estimate.
              </p>
            </details>

            <details>
              <summary>Where can a transaction be verified?</summary>
              <p>
                Confirmed transactions should be independently checked using
                the appropriate blockchain explorer.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer>
        <span>IO Buyback Portal</span>
        <span>Web3 Allocation Interface</span>
      </footer>

      {showWallet && (
        <div className="overlay" onClick={() => setShowWallet(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="close"
              onClick={() => setShowWallet(false)}
            >
              <X size={17} />
            </button>

            <label>WALLET CONNECTION</label>
            <h2>Connect your wallet</h2>

            <p>
              Connect a compatible Web3 wallet to continue.
            </p>

            <button
              type="button"
              className="primary full"
              onClick={handleWallet}
            >
              <Wallet />
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
