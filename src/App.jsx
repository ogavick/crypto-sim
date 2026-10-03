import { useState } from "react";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import CoinList from "./components/CoinList";
import Portfolio from "./components/Portfolio";
import TradeModal from "./components/TradeModal";
import "./App.css";


function App() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  return (
    <PortfolioProvider>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Crypto Simulator</h1>
        <Portfolio />
        <h2>Market</h2>
        <CoinList onSelectCoin={setSelectedCoin} />
        {selectedCoin && <TradeModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />}
      </div>
    </PortfolioProvider>
  );
}
export default App;