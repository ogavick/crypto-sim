import { useState } from "react";
import { usePortfolio } from "../contexts/PortfolioContext";
import CoinChart from "./CoinChart"; // <- THIS GOES AT TOP, OUTSIDE

function TradeModal({ coin, onClose }) {
  const { buy, sell, holdings, balance } = usePortfolio();
  const [amount, setAmount] = useState(0.01);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#222",
          padding: "20px",
          borderRadius: "12px",
          width: "350px",
          color: "white",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {coin.name} ({coin.symbol.toUpperCase()})
        </h2>
        <p>Price: ${coin.current_price}</p>

        {/* CHART HERE */}
        <CoinChart coinId={coin.id} />

        <p>Your Balance: ${balance.toFixed(2)}</p>
        <p>Owned: {holdings[coin.id]?.amount || 0}</p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          step="0.01"
          style={{
            width: "100%",
            padding: "8px",
            margin: "10px 0",
            boxSizing: "border-box",
          }}
        />
        <p>Cost: ${(amount * coin.current_price).toFixed(6)}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              buy(coin, amount, coin.current_price);
              onClose();
            }}
            style={{
              flex: 1,
              background: "green",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            BUY
          </button>
          <button
            onClick={() => {
              sell(coin.id, amount, coin.current_price);
              onClose();
            }}
            style={{
              flex: 1,
              background: "red",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            SELL
          </button>
        </div>

        <button
          onClick={onClose}
          style={{ marginTop: "10px", width: "100%", padding: "8px" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
export default TradeModal;
