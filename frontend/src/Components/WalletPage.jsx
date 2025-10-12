import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WalletPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const userId = '404be18c-9513-4d34-8470-12755c93eea1';
  const primary = "#198754";

  const fetchWalletData = async () => {
    try {
      setLoadingTransactions(true);
      const res = await fetch(`http://127.0.0.1:5000/wallet/${userId}/transactions`);
      if (!res.ok) throw new Error("Failed to fetch wallet data");
      const data = await res.json();

      const txs = Array.isArray(data) ? data : data.transactions || [];
      setWalletId(data.walletId || "WALLET-XXXX");
      setAllTransactions(txs);

      const balance = txs.reduce(
        (sum, tx) => sum + (tx.type === "credit" ? Math.abs(tx.amount) : -Math.abs(tx.amount)),
        0
      );
      setBalance(balance);
      setLastUpdated(new Date());
      setLoadingTransactions(false);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setToast("Failed to fetch wallet data.");
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleTopUp = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setToast("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      if (!res.ok) throw new Error("Top-up failed");
      const data = await res.json();
      const newTx = data.transaction;

      setAllTransactions(prev => [newTx, ...prev]);
      const newBalance = [newTx, ...allTransactions].reduce(
        (sum, tx) => sum + (tx.type === "credit" ? Math.abs(tx.amount) : -Math.abs(tx.amount)),
        0
      );
      setBalance(newBalance);
      setLastUpdated(new Date());
      setToast(`M-Pesa top-up of KSh ${amount} successful!`);
      setShowTopUpModal(false);
      setAmount("");
    } catch (err) {
      console.error("Top-up failed:", err);
      setToast("Top-up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const recentTransactions = allTransactions.slice(0, 3);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#f8f9fa", padding: "1rem" }}>
      {toast && (
        <div className="position-fixed top-0 end-0 m-3 bg-success text-white px-3 py-2 rounded-3 shadow" style={{ zIndex: 1050, animation: "slideIn 0.5s ease", fontSize: "0.9rem" }}>
          <i className="bi bi-check-circle me-2"></i> {toast}
        </div>
      )}

      <div className="bg-white rounded-4 shadow-sm p-4" style={{ maxWidth: "500px", width: "100%", borderTop: `4px solid ${primary}` }}>
        <h5 className="fw-semibold text-center mb-4" style={{ color: primary, letterSpacing: "0.3px" }}>
          <i className="bi bi-wallet2 me-2"></i>My Wallet
        </h5>

        <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#f3f4f6" }}>
          <p className="text-muted small mb-1">Wallet ID</p>
          <p className="fw-semibold text-dark">{walletId}</p>
          <p className="text-muted small mb-1 mt-3">Current Balance</p>
          <h3 className="fw-bold mb-1" style={{ color: primary }}>KSh {balance.toFixed(2)}</h3>
          <p className="text-secondary small">Updated {lastUpdated.toLocaleTimeString()}</p>
        </div>

        <div className="d-flex justify-content-between gap-2 mb-3 flex-wrap">
          <button className="btn btn-success btn-sm flex-fill rounded-pill" onClick={() => setShowTopUpModal(true)}>
            <i className="bi bi-phone me-1"></i>Top Up
          </button>
          <button className="btn btn-outline-success btn-sm flex-fill rounded-pill" onClick={() => navigate("/history")}>
            <i className="bi bi-clock-history me-1"></i>Transactions
          </button>
          <button className="btn btn-outline-secondary btn-sm flex-fill rounded-pill" onClick={() => navigate("/products")}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>

        {/* Transactions */}
<div>
  <h6 className="fw-semibold text-muted mb-2">Recent Transactions</h6>
  {loadingTransactions ? (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-2">
          <div className="w-75">
            <div className="placeholder-glow mb-1">
              <span className="placeholder col-12 rounded-pill"></span>
            </div>
            <div className="placeholder-glow">
              <span className="placeholder col-6 rounded-pill"></span>
            </div>
          </div>
          <div className="w-25 text-end">
            <div className="placeholder-glow">
              <span className="placeholder col-12 rounded-pill"></span>
            </div>
          </div>
        </div>
      ))}
    </>
  ) : (
    recentTransactions.map((tx) => (
      <div key={tx.id} className="d-flex justify-content-between align-items-center border-bottom py-2 small">
        <div>
          <span className="fw-medium">{tx.description}</span>
          <p className="text-secondary mb-0 small">{tx.date}</p>
        </div>
        <span className={`fw-bold ${tx.type === "credit" ? "text-success" : "text-danger"}`}>
          {tx.type === "credit" ? "+" : "-"}KSh {Math.abs(tx.amount)}
        </span>
      </div>
    ))
  )}

  {!loadingTransactions && (
    <div className="text-center mt-3">
      <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => navigate("/history")}>
        Show More <i className="bi bi-arrow-right-short ms-1"></i>
      </button>
    </div>
  )}
</div>

<style>{`

    .placeholder { 
    background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
    background-size: 400% 100%; 
    animation: shimmer 1.2s infinite; 
    display: inline-block; 
    height: 1rem;
  }
  @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
`}</style>

      </div>

      {showTopUpModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header rounded-top-4 text-white" style={{ backgroundColor: primary }}>
                <h6 className="modal-title"><i className="bi bi-phone me-2"></i>Top Up Wallet</h6>
                <button className="btn-close btn-close-white" onClick={() => setShowTopUpModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label small text-muted">Enter Amount (KSh)</label>
                <input type="number" className="form-control border-success" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" />
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary rounded-pill px-3 btn-sm" onClick={() => setShowTopUpModal(false)}>Cancel</button>
                <button className="btn btn-success rounded-pill px-3 btn-sm" onClick={handleTopUp} disabled={loading}>
                  {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>) : "Top Up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .placeholder { background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%); background-size: 400% 100%; animation: shimmer 1.2s infinite; }
        @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
      `}</style>
    </div>
  );
};

export default WalletPage;
