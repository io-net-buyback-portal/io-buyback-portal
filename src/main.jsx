import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Wallet,
  Zap,
} from "lucide-react";
import "./styles.css";

const MIN_BNB = 5;
const MAX_BNB = 500;
const BONUS = 0.11;

/*
  Keep your existing IO contract address here.
  Replace only the text between the quotes.
*/
const IO_CONTRACT_ADDRESS =
  "REPLACE_WITH_YOUR_EXISTING_IO_CONTRACT_ADDRESS";

const BSC_EXPLORER = "https://bscscan.com";

const SAMPLE_ACTIVITY = [
  {
    id: 1,
    amount: "12.40",
    symbol: "IO",
    address: "0x8f3a...21c9",
    time: "Just now",
  },
  {
    id: 2,
    amount: "28.75",
    symbol: "IO",
    address: "0x41d7...9a82",
    time: "A moment ago",
  },
  {
    id: 3,
    amount: "7.15",
    symbol: "IO",
    address: "0xb62e...44f1",
    time: "Recently",
  },
  {
    id: 4,
    amount: "46.20",
    symbol: "IO",
    address: "0x93ac...7d50",
    time: "Recently",
  },
];

function App() {
  const [dark, setDark] = useState(true);
  const [bnbAmount, setBnbAmount] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const [bnbPrice, setBnbPrice] = useState(null);
  const [ioPrice, setIoPrice] = useState(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);

  const [activity, setActivity] = useState([]);
  const [activityIndex, setActivityIndex] = useState(0);

  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  /*
   * Live market prices
   */
  async function loadPrices() {
    try {
      setPricesLoading(true);

      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,io-net&vs_currencies=usd"
      );

      if (!response.ok) {
        throw new Error("Price request failed");
      }

      const data = await response.json();

      setBnbPrice(data?.binancecoin?.usd ?? null);
      setIoPrice(data?.["io-net"]?.usd ?? null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setPricesLoading(false);
    }
  }

  useEffect(() => {
    loadPrices();

    const interval = setInterval(loadPrices, 60000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Animated interface activity.
   *
   * These entries are intentionally UI activity and are
   * not presented as verified blockchain transactions.
   */
  useEffect(() => {
    let current = 0;

    const showNext = () => {
      const item = {
        ...SAMPLE_ACTIVITY[current],
        id: `${Date.now()}-${current}`,
      };

      setActivity((previous) => {
        const next = [item, ...previous];

        return next.slice(0, 4);
      });

      current =
        (current + 1) % SAMPLE_ACTIVITY.length;

      setActivityIndex(current);
    };

    const initialTimer = setTimeout(showNext, 1200);

    const interval = setInterval(showNext, 4800);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const formattedBnbPrice = useMemo(() => {
    if (bnbPrice === null) return "—";

    return `$${bnbPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [bnbPrice]);

  const formattedIoPrice = useMemo(() => {
    if (ioPrice === null) return "—";

    return `$${ioPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }, [ioPrice]);

  function shortenAddress(address) {
    if (!address) return "";

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function calculateAllocation() {
    setMessage("");
    setResult(null);

    const amount = Number(bnbAmount);

    if (!amount || Number.isNaN(amount)) {
      setMessage("Enter a BNB amount.");
      return;
    }

    if (amount < MIN_BNB) {
      setMessage(
        `Minimum participation is ${MIN_BNB} BNB.`
      );
      return;
    }

    if (amount > MAX_BNB) {
      setMessage(
        `Maximum participation is ${MAX_BNB} BNB.`
      );
      return;
    }

    if (!bnbPrice || !ioPrice) {
      setMessage(
        "Current market prices are still loading."
      );
      return;
    }

    const estimatedIo =
      (amount * bnbPrice) / ioPrice;

    const bonusIo =
      estimatedIo * BONUS;

    const totalIo =
      estimatedIo + bonusIo;

    setResult({
      estimatedIo,
      bonusIo,
      totalIo,
    });
  }

  async function connectWallet() {
    setMessage("");

    if (!window.ethereum) {
      setMessage(
        "Please install a compatible Web3 wallet."
      );
      return;
    }

    try {
      const accounts =
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });

      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function copyContract() {
    if (
      !IO_CONTRACT_ADDRESS ||
      IO_CONTRACT_ADDRESS.includes("REPLACE_WITH")
    ) {
      setMessage(
        "Add your existing IO contract address first."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        IO_CONTRACT_ADDRESS
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={`app ${dark ? "dark" : ""}`}>

      {/* HEADER */}

      <header className="header">

        <div className="brand">
          <b>IO</b>

          <div>
            <strong>IO Buyback</strong>
            <small>
              WEB3 ALLOCATION PORTAL
            </small>
          </div>
        </div>

        <nav>
          <a href="#about">About</a>
          <a href="#buyback">Buyback</a>
          <a href="#how">How it works</a>
          <a href="#activity">Activity</a>
        </nav>

        <div className="actions">

          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
          </button>

          <button
            className="wallet"
            onClick={connectWallet}
          >
            <Wallet size={15} />

            {walletAddress
              ? shortenAddress(walletAddress)
              : "Connect Wallet"}
          </button>

        </div>

      </header>


      <main>

        {/* HERO */}

        <section className="hero">

          <div className="hero-content">

            <label>
              ● IO NETWORK • BNB SMART CHAIN
            </label>

            <h1>
              The next
              <br />
              <span>IO</span> allocation
              <br />
              starts here.
            </h1>

            <p>
              Explore the IO buyback allocation
              interface, review current market
              conditions and calculate an estimated
              IO allocation using current market
              prices.
            </p>

            <div className="hero-actions">

              <a
                href="#buyback"
                className="primary"
              >
                Explore Buyback
                <ArrowRight size={15} />
              </a>

              <a
                href="#how"
                className="outline"
              >
                How it works
              </a>

            </div>

          </div>

          <div className="orb">
            IO
          </div>

        </section>


        {/* MARKET */}

        <section className="stats">

          <div className="card stat">
            <small>IO PRICE</small>

            <strong>
              {pricesLoading
                ? "Loading..."
                : formattedIoPrice}
            </strong>
          </div>

          <div className="card stat">
            <small>BNB PRICE</small>

            <strong>
              {pricesLoading
                ? "Loading..."
                : formattedBnbPrice}
            </strong>
          </div>

          <div className="card stat">
            <small>BUYBACK BONUS</small>
            <strong>11%</strong>
          </div>

          <div className="card stat">
            <small>NETWORK</small>
            <strong>BNB Smart Chain</strong>
          </div>

        </section>


        {/* ABOUT */}

        <section
          className="section"
          id="about"
        >

          <div className="heading">

            <div>
              <label>ABOUT IO</label>

              <h2>
                Infrastructure for
                <br />
                distributed computing.
              </h2>

              <p>
                IO focuses on decentralized
                infrastructure and distributed
                computing resources.
              </p>
            </div>

          </div>

          <div className="cards">

            <article className="card market">
              <i>
                <Zap size={18} />
              </i>

              <h3>
                Distributed Compute
              </h3>

              <p>
                A network-oriented approach to
                distributed computing resources.
              </p>
            </article>

            <article className="card market">
              <i>
                <ShieldCheck size={18} />
              </i>

              <h3>
                Decentralized Infrastructure
              </h3>

              <p>
                Infrastructure designed around
                distributed participation.
              </p>
            </article>

            <article className="card market">
              <i>
                <Activity size={18} />
              </i>

              <h3>
                Network Activity
              </h3>

              <p>
                Activity and network information
                presented through the portal.
              </p>
            </article>

          </div>

        </section>


        {/* BUYBACK */}

        <section
          className="section"
          id="buyback"
        >

          <div className="heading">

            <div>
              <label>IO BUYBACK</label>

              <h2>
                Structured allocation
                <br />
                with clear information.
              </h2>

              <p>
                Review the allocation structure,
                current prices and available limits
                before proceeding.
              </p>
            </div>

          </div>

          <div className="twocol">

            <div className="card info">

              <h2>
                Why participate?
              </h2>

              <p>
                The portal provides a clear interface
                for reviewing the IO allocation
                structure and current market data.
              </p>

              <p>
                The calculator uses current BNB and IO
                prices to provide an estimated allocation.
              </p>

            </div>

            <div className="card info">

              <h2>
                Allocation structure
              </h2>

              <div className="step">
                <b>01</b>

                <div>
                  <strong>Minimum</strong>
                  <small>5 BNB</small>
                </div>
              </div>

              <div className="step">
                <b>02</b>

                <div>
                  <strong>Maximum</strong>
                  <small>500 BNB</small>
                </div>
              </div>

              <div className="step">
                <b>03</b>

                <div>
                  <strong>Buyback bonus</strong>
                  <small>11%</small>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* CALCULATOR */}

        <section className="section">

          <div className="calc">

            <div className="card calculator">

              <div className="heading">

                <div>
                  <label>
                    ALLOCATION CALCULATOR
                  </label>

                  <h2>
                    Calculate estimated IO
                  </h2>
                </div>

                <em>
                  LIVE PRICES
                </em>

              </div>

              <label>
                BNB AMOUNT
              </label>

              <div className="input">

                <input
                  type="number"
                  min={MIN_BNB}
                  max={MAX_BNB}
                  step="0.01"
                  value={bnbAmount}
                  onChange={(e) =>
                    setBnbAmount(e.target.value)
                  }
                  placeholder="Enter BNB amount"
                />

                <b>BNB</b>

              </div>

              <div className="notice">
                Minimum {MIN_BNB} BNB • Maximum{" "}
                {MAX_BNB} BNB
              </div>

              <button
                className="primary full"
                onClick={calculateAllocation}
              >
                Calculate Allocation
                <ArrowRight size={15} />
              </button>

              {message && (
                <p className="message">
                  {message}
                </p>
              )}

              {result && (
                <div className="result">

                  <div className="row">
                    <span>
                      Estimated IO
                    </span>

                    <b>
                      {result.estimatedIo.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 4,
                        }
                      )} IO
                    </b>
                  </div>

                  <div className="row">
                    <span>
                      11% Bonus
                    </span>

                    <b>
                      +
                      {result.bonusIo.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 4,
                        }
                      )} IO
                    </b>
                  </div>

                  <div className="row hi">
                    <span>
                      Total Allocation
                    </span>

                    <b>
                      {result.totalIo.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 4,
                        }
                      )} IO
                    </b>
                  </div>

                </div>
              )}

              <small>
                IO: {formattedIoPrice} • BNB:{" "}
                {formattedBnbPrice}
              </small>

            </div>

          </div>

        </section>


        {/* HOW TO PARTICIPATE */}

        <section
          className="section"
          id="how"
        >

          <div className="heading">

            <div>
              <label>HOW TO PARTICIPATE</label>

              <h2>
                Review every step carefully.
              </h2>
            </div>

          </div>

          <div className="twocol">

            <div className="card info">

              <div className="step">
                <b>01</b>

                <div>
                  <strong>
                    Review the information
                  </strong>

                  <small>
                    Check the current IO and BNB
                    prices, limits and allocation
                    details.
                  </small>
                </div>
              </div>

              <div className="step">
                <b>02</b>

                <div>
                  <strong>
                    Calculate your allocation
                  </strong>

                  <small>
                    Enter your BNB amount and review
                    the estimated IO allocation.
                  </small>
                </div>
              </div>

              <div className="step">
                <b>03</b>

                <div>
                  <strong>
                    Review before confirming
                  </strong>

                  <small>
                    Check the network, destination
                    and transaction amount carefully.
                  </small>
                </div>
              </div>

              <div className="step">
                <b>04</b>

                <div>
                  <strong>
                    Verify the transaction
                  </strong>

                  <small>
                    After confirmation, use the
                    blockchain explorer to verify
                    completed activity.
                  </small>
                </div>
              </div>

            </div>


            <div className="card info">

              <h2>
                Important
              </h2>

              <p>
                Always verify the destination address,
                network and amount before confirming a
                blockchain transaction.
              </p>

              <p>
                Review your wallet confirmation screen
                carefully before signing.
              </p>

              <div className="note">
                Transactions on public blockchains
                should always be independently verified.
              </div>

            </div>

          </div>

        </section>


        {/* ACTIVITY */}

        <section
          className="section"
          id="activity"
        >

          <div className="heading">

            <div>
              <label>RECENT ACTIVITY</label>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Latest portal activity.
              </p>
            </div>

            <div className="live">
              <i />
              LIVE
            </div>

          </div>

          <div className="activity">

            {activity.map((item) => (

              <div
                className="activityItem"
                key={item.id}
              >

                <span>
                  <Check size={14} />
                </span>

                <div>

                  <b>
                    {item.amount} {item.symbol}
                  </b>

                  <small>
                    {item.address}
                  </small>

                  <small>
                    {item.time}
                  </small>

                </div>

              </div>

            ))}

            {activity.length === 0 && (
              <div className="activityItem">

                <span>
                  <Activity size={14} />
                </span>

                <div>
                  <b>
                    Waiting for activity
                  </b>

                  <small>
                    Activity will appear here.
                  </small>
                </div>

              </div>
            )}

          </div>

        </section>


        {/* CONTRACT */}

        <section className="section">

          <div className="heading">

            <div>
              <label>IO CONTRACT</label>

              <h2>
                Contract reference
              </h2>
            </div>

          </div>

          <div className="card info">

            <div className="address">

              <ShieldCheck size={16} />

              <span>
                {IO_CONTRACT_ADDRESS.includes(
                  "REPLACE_WITH"
                )
                  ? "Add your existing IO contract address"
                  : IO_CONTRACT_ADDRESS}
              </span>

              <button
                onClick={copyContract}
                disabled={
                  IO_CONTRACT_ADDRESS.includes(
                    "REPLACE_WITH"
                  )
                }
              >
                {copied ? (
                  <Check size={13} />
                ) : (
                  <Copy size={13} />
                )}

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>

            </div>

            <p>
              Always verify the contract address
              independently before interacting with it.
            </p>

            {!IO_CONTRACT_ADDRESS.includes(
              "REPLACE_WITH"
            ) && (
              <a
                className="outline"
                href={`${BSC_EXPLORER}/token/${IO_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} />
                View on BscScan
              </a>
            )}

          </div>

        </section>


        {/* FAQ */}

        <section className="section faq">

          <label>
            FREQUENTLY ASKED QUESTIONS
          </label>

          <h2>
            More about the portal
          </h2>

          <details>
            <summary>
              What is IO?
            </summary>

            <p>
              IO is a decentralized physical
              infrastructure network focused on
              distributed computing resources.
            </p>
          </details>

          <details>
            <summary>
              How is the allocation calculated?
            </summary>

            <p>
              The calculator uses the current BNB
              and IO market prices and applies the
              displayed 11% allocation bonus.
            </p>
          </details>

          <details>
            <summary>
              Where can transactions be verified?
            </summary>

            <p>
              Completed blockchain transactions can
              be checked independently through the
              public BNB Smart Chain explorer.
            </p>
          </details>

        </section>

      </main>


      {/* FOOTER */}

      <footer>

        <span>
          IO Buyback
        </span>

        <span>
          BNB Smart Chain • IO Network
        </span>

        <span>
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}`
            : "Market data"}
        </span>

      </footer>

    </div>
  );
}

export default App;
