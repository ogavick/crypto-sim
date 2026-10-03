import { usePortfolio } from "../contexts/PortfolioContext";

function Portfolio() {
 const { balance, holdings } = usePortfolio();
 const holdingsList = Object.values(holdings);

 const totalInvested = holdingsList.reduce((sum, h) => sum + h.amount * h.avgBuy, 0);
 const totalCurrent = holdingsList.reduce((sum, h) => sum + h.amount * (h.current_price || h.avgBuy), 0);
 const totalPnL = totalCurrent - totalInvested;
 const totalWorth = balance + totalCurrent;

 return (
 <div style={{ background: "#111", color: "white", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
 <h2 style={{ margin: 0 }}>Total: ${totalWorth.toFixed(2)}</h2>
 <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
 <span>Cash: ${balance.toFixed(2)}</span>
 <span style={{ color: totalPnL >= 0? "#": "#" }}>
 P/L: {totalPnL >= 0? "+": ""}${totalPnL.toFixed(2)} ({totalInvested > 0? ((totalPnL/totalInvested)*100).toFixed(2): 0}%)
 </span>
 </div>
 {holdingsList.length > 0 && (
 <div style={{ marginTop: "15px", borderTop: "1px solid #333", paddingTop: "10px" }}>
 {holdingsList.map(h => {
 const pnl = (h.current_price - h.avgBuy) * h.amount;
 return (
 <div key={h.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
 <span>{h.amount} {h.symbol.toUpperCase()}</span>
 <span style={{ color: pnl >= 0? "#": "#" }}>{pnl.toFixed(2)}</span>
 </div>
 )
 })}
 </div>
 )}
 </div>
 );
}
export default Portfolio;