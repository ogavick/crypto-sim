import { createContext, useContext, useState, useEffect } from "react";

const PortfolioContext = createContext();

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }) => {
  const [balance, setBalance] = useState(() => {
    return Number(localStorage.getItem("balance") || 10000);
  });
  const [holdings, setHoldings] = useState(() => {
    return JSON.parse(localStorage.getItem("holdings") || "{}");
  });

  useEffect(() => {
    localStorage.setItem("balance", balance);
    localStorage.setItem("holdings", JSON.stringify(holdings));
  }, [balance, holdings]);

  const buy = (coin, amount, price) => {
    const cost = amount * price;
    if (cost > balance) return alert("Not enough balance!");
    setBalance(b => b - cost);
    setHoldings(h => ({
     ...h,
      [coin.id]: {
       ...coin,
        amount: (h[coin.id]?.amount || 0) + amount,
        avgBuy: price
      }
    }));
  };

  const sell = (coinId, amount, price) => {
    if (!holdings[coinId] || holdings[coinId].amount < amount) return alert("Not enough coins!");
    setBalance(b => b + amount * price);
    setHoldings(h => {
      const newAmount = h[coinId].amount - amount;
      if (newAmount === 0) {
        const { [coinId]: _,...rest } = h;
        return rest;
      }
      return {...h, [coinId]: {...h[coinId], amount: newAmount } };
    });
  };

  return (
    <PortfolioContext.Provider value={{ balance, holdings, buy, sell }}>
      {children}
    </PortfolioContext.Provider>
  );
};