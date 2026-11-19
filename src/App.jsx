import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("all");
    const [watchlist, setWatchlist] = useState([]);
  const handleGoogleSignIn = async () => {
  setAuthError("");
  setAuthSubmitting(true);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  } catch (error) {
    setAuthError(error.message);
    setAuthSubmitting(false);
  }
};

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) throw sessionError;
        if (active) {
          setSession(data.session);
          setAuthLoading(false);
        }
      })
      .catch((sessionError) => {
        if (active) {
          setAuthError(sessionError.message);
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  // Load watchlist from Supabase
  useEffect(() => {
    if (!session) {
      setWatchlist([]);
      return;
    }
    const loadWatchlist = async () => {
      const { data } = await supabase
        .from("watchlist")
        .select("coin_id")
        .eq("user_id", session.user.id);
      if (data) setWatchlist(data.map((row) => row.coin_id));
    };
    loadWatchlist();
  }, [session]);


  const fetchCoins = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
      );
      if (!res.ok) throw new Error("API limit hit or network error");
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthSubmitting(true);

    try {
      if (authMode === "sign_in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setAuthMessage("Check your email for a confirmation link to finish signing up.");
        }
      }
    } catch (authSubmitError) {
      setAuthError(authSubmitError.message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError("");
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setAuthError(signOutError.message);
    } catch (signOutError) {
      setAuthError(signOutError.message);
    }
  };

  const toggleWatchlist = async (id) => {
    if (!session) return;
    const isSaved = watchlist.includes(id);

    if (isSaved) {
      setWatchlist((prev) => prev.filter((coinId) => coinId !== id));
      await supabase.from("watchlist").delete().eq("coin_id", id).eq("user_id", session.user.id);
    } else {
      setWatchlist((prev) => [...prev, id]);
      await supabase.from("watchlist").insert({ user_id: session.user.id, coin_id: id });
    }
  };

  const filtered = coins
    .filter((coin) => (view === "watchlist" ? watchlist.includes(coin.id) : true))
    .filter((coin) => coin.name.toLowerCase().includes(search.toLowerCase()));

  if (authLoading) {
    return <div className="center">Checking your session...</div>;
  }

  if (!session) {
    return (
      <main className="auth-screen">
        <form className="auth-card" onSubmit={handleAuthSubmit}>
          <h1>Victor&apos;s Crypto Tracker</h1>
          <h2>{authMode === "sign_in" ? "Sign in" : "Create your account"}</h2>
          <p>Sign in to access your crypto tracker.</p>
         <button
  type="button"
  style={{
    background: "white",
    color: "black",
    border: "1px solid #ddd",
  }}
  onClick={handleGoogleSignIn}
  disabled={authSubmitting}
>
  {authSubmitting ? "Connecting..." : "Continue with Google"}
</button>

<p style={{textAlign: "center", margin: "10px 0"}}>— or —</p>

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={authMode === "sign_in" ? "current-password" : "new-password"}
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {authError && <p className="auth-error" role="alert">{authError}</p>}
          {authMessage && <p className="auth-message" role="status">{authMessage}</p>}

          <button type="submit" disabled={authSubmitting}>
            {authSubmitting
              ? "Please wait..."
              : authMode === "sign_in"
                ? "Sign in"
                : "Sign up"}
          </button>
          <button
            className="auth-mode-button"
            type="button"
            onClick={() => {
              setAuthMode((mode) => (mode === "sign_in" ? "sign_up" : "sign_in"));
              setAuthError("");
              setAuthMessage("");
            }}
          >
            {authMode === "sign_in"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </main>
    );
  }

  if (loading) return <div className="center">⏳ Loading crypto prices...</div>;
  if (error) {
    return (
      <div className="center">
        ❌ {error}
        <br />
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            fetchCoins();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="crypto-app">
      <div className="account-bar">
        <span>Signed in as {session.user.email}</span>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
      {authError && <p className="auth-error" role="alert">{authError}</p>}
      <h2>Victor&apos;s Crypto Tracker</h2>

      <div className="tabs">
        <button
          className={view === "all" ? "active" : ""}
          onClick={() => setView("all")}
        >
          All Coins ({coins.length})
        </button>
        <button
          className={view === "watchlist" ? "active" : ""}
          onClick={() => setView("watchlist")}
        >
          ★ Watchlist ({watchlist.length})
        </button>
      </div>

      <input
        placeholder="Search Bitcoin, Ethereum..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {view === "watchlist" && watchlist.length === 0 ? (
        <p style={{ marginTop: "20px" }}>
          Your watchlist is empty. Go to All Coins and add ★
        </p>
      ) : filtered.length === 0 ? (
        <p>No coins found for &quot;{search}&quot;</p>
      ) : (
        <div className="grid">
          {filtered.map((coin) => (
            <div key={coin.id} className="coin-card">
              <img src={coin.image} width="30" alt="" />
              <h4>
                {coin.name} ({coin.symbol.toUpperCase()})
              </h4>
              <p>${coin.current_price.toLocaleString()}</p>
              <p
                style={{
                  color: coin.price_change_percentage_24h > 0 ? "green" : "red",
                }}
              >
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </p>
              <button onClick={() => toggleWatchlist(coin.id)}>
                {watchlist.includes(coin.id) ? "★ Remove" : "☆ Watchlist"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
