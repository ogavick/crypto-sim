import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

function CoinChart({ coinId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`,
    )
      .then((r) => r.json())
      .then((d) => {
        const formatted = d.prices.map((p) => ({ price: p[1] }));
        setData(formatted);
      });
  }, [coinId]);

 if (!data.length) return <p>Loading chart...</p>;

  return (
    <div style={{ height: "120px", width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00ff88"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default CoinChart;
