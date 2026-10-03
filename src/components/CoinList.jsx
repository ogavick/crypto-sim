import { useEffect, useState } from "react";

function CoinList({ onSelectCoin }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
        );
        const data = await res.json();
        setCoins(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchCoins();
  }, []);

  if (loading) return <p>Loading market...</p>;

  return (
    <div>
      {coins.map((coin) => (
        <div key={coin.id} onClick={() => onSelectCoin(coin)} style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid #333", cursor: "pointer" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <img src={coin.image} width={28} height={28} alt="" />
            <b>{coin.symbol.toUpperCase()}</b> {coin.name}
          </div>
          <div>
            ${coin.current_price.toLocaleString()}
            <span style={{ color: coin.price_change_percentage_24h >= 0 ? "lightgreen" : "red", marginLeft: "8px" }}>
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
export default CoinList;