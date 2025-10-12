import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WalletPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(1500);
  const [walletId] = useState("WALLET-254703622386");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const primary = "#198754";

  useEffect(() => {
    // Simulate fetching transactions
    setLoadingTransactions(true);
    setTimeout(() => {
      setTransactions([
        { id: 1, description: "Top-up via M-Pesa", amount: 500, type: "credit", date: "Today, 10:20 AM" },
        { id: 2, description: "Purchase - Order #A134", amount: -250, type: "debit", date: "Yesterday, 4:10 PM" },
        { id: 3, description: "Top-up via M-Pesa", amount: 1000, type: "credit", date: "Oct 8, 11:45 AM" },
      ]);
      setLoadingTransactions(false);
    }, 1500);
  }, []);

  const handleTopUp = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setToast("Enter a valid amount");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newBalance = balance + parseFloat(amount);
      setBalance(newBalance);
      setLastUpdated(new Date());
      const newTx = {
        id: Date.now(),
        description: "Top-up via M-Pesa",
        amount: parseFloat(amount),
        type: "credit",
        date: "Just now",
      };
      setTransactions([newTx, ...transactions.slice(0, 2)]);
      setToast(`M-Pesa top-up of KSh ${amount} successful!`);
      setShowTopUpModal(false);
      setAmount("");
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: "#f8f9fa",
        padding: "1rem",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 m-3 bg-success text-white px-3 py-2 rounded-3 shadow"
          style={{
            zIndex: 1050,
            animation: "slideIn 0.5s ease",
            fontSize: "0.9rem",
          }}
        >
          <i className="bi bi-check-circle me-2"></i> {toast}
        </div>
      )}

      {/* Wallet Card */}
      <div
        className="bg-white rounded-4 shadow-sm p-4"
        style={{
          maxWidth: "500px",
          width: "100%",
          borderTop: `4px solid ${primary}`,
        }}
      >
        <h5
          className="fw-semibold text-center mb-4"
          style={{ color: primary, letterSpacing: "0.3px" }}
        >
          <i className="bi bi-wallet2 me-2"></i>My Wallet
        </h5>

        {/* Wallet Info */}
        <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#f3f4f6" }}>
          <p className="text-muted small mb-1">Wallet ID</p>
          <p className="fw-semibold text-dark">{walletId}</p>
          <p className="text-muted small mb-1 mt-3">Current Balance</p>
          <h3 className="fw-bold mb-1" style={{ color: primary }}>
            KSh {balance.toFixed(2)}
          </h3>
          <p className="text-secondary small">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Horizontal Buttons */}
        <div className="d-flex justify-content-between gap-2 mb-3 flex-wrap">
          <button
            className="btn btn-success btn-sm flex-fill rounded-pill"
            onClick={() => setShowTopUpModal(true)}
          >
            <i className="bi bi-phone me-1"></i>Top Up
          </button>
          <button
            className="btn btn-outline-success btn-sm flex-fill rounded-pill"
            onClick={() => navigate("/history")}
          >
            <i className="bi bi-clock-history me-1"></i>Transactions
          </button>
          <button
            className="btn btn-outline-secondary btn-sm flex-fill rounded-pill"
            onClick={() => navigate("/products")}
          >
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>

        {/* Transactions */}
        <div>
          <h6 className="fw-semibold text-muted mb-2">
            Recent Transactions
          </h6>

          {/* Shimmer Loading */}
          {loadingTransactions ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="placeholder-glow d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <span className="placeholder col-6 rounded-pill"></span>
                  <span className="placeholder col-2 rounded-pill"></span>
                </div>
              ))}
            </>
          ) : (
            <>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2 small"
                >
                  <div>
                    <span className="fw-medium">{tx.description}</span>
                    <p className="text-secondary mb-0 small">{tx.date}</p>
                  </div>
                  <span
                    className={`fw-bold ${
                      tx.type === "credit" ? "text-success" : "text-danger"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}KSh {Math.abs(tx.amount)}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Show More Button */}
          {!loadingTransactions && (
            <div className="text-center mt-3">
              <button
                className="btn btn-sm btn-outline-success rounded-pill px-3"
                onClick={() => navigate("/history")}
              >
                Show More <i className="bi bi-arrow-right-short ms-1"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0, 0, 0, 0.4)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div
                className="modal-header rounded-top-4 text-white"
                style={{ backgroundColor: primary }}
              >
                <h6 className="modal-title">
                  <i className="bi bi-phone me-2"></i>Top Up Wallet
                </h6>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowTopUpModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label small text-muted">
                  Enter Amount (KSh)
                </label>
                <input
                  type="number"
                  className="form-control border-success"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-secondary rounded-pill px-3 btn-sm"
                  onClick={() => setShowTopUpModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success rounded-pill px-3 btn-sm"
                  onClick={handleTopUp}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    "Top Up"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .placeholder {
          background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
          background-size: 400% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

export default WalletPage;
