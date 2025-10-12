import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// API functions
const fetchTransactions = async (userId) => {
  const res = await fetch(`http://127.0.0.1:5000/wallet/${userId}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

const WalletHistoryPage = () => {
  const navigate = useNavigate();
  const primary = "#198754";

  const perPage = 6;
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // full list from backend
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [page, setPage] = useState(1);

  // Replace this with the logged-in user ID
  const userId = '404be18c-9513-4d34-8470-12755c93eea1';

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const data = await fetchTransactions(userId);
        setAllTransactions(data);
        setTransactions(data.slice(0, perPage));
        setPage(1);
        setAnimate(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [userId]);

  const loadPage = (pageNum) => {
    const start = 0;
    const end = pageNum * perPage;
    setTransactions(allTransactions.slice(start, end));
    setPage(pageNum);
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter !== filter) {
      setAnimate(false);
      setTimeout(() => {
        setFilter(newFilter);
        setAnimate(true);
      }, 200);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLoadMore = () => {
    loadPage(page + 1);
  };

  const hasMore = transactions.length < allTransactions.length;

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center" style={{ background: "#f8f9fa", padding: "2rem 1rem" }}>
      <div className="bg-white shadow-sm rounded-4 p-3 mb-3 d-flex justify-content-between align-items-center" style={{ width: "100%", maxWidth: "900px", borderTop: `4px solid ${primary}` }}>
        <h5 className="m-0 text-success fw-semibold"><i className="bi bi-clock-history me-2"></i>Wallet History</h5>
        <button className="btn btn-outline-secondary btn-sm rounded-circle p-1" onClick={() => navigate("/wallet")}><i className="bi bi-arrow-left"></i></button>
      </div>

      {/* Filter Buttons + Stats */}
      <div className="d-flex gap-2 mb-3 flex-wrap" style={{ width: "100%", maxWidth: "900px" }}>
  <div className="d-flex justify-content-between mb-3 flex-wrap" style={{ width: "100%", maxWidth: "900px", gap: "1rem" }}>
    {/* Total Credits */}
    <div className="stat-card flex-fill p-3 text-center bg-success-subtle text-success">
      <h6 className="mb-1 small">Total Credits</h6>
      <p className="m-0 fw-bold stat-number">
        KSh {allTransactions
          .filter(t => t.type === "credit")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
      </p>
    </div>

    {/* Total Debits */}
    <div className="stat-card flex-fill p-3 text-center bg-danger-subtle text-danger">
      <h6 className="mb-1 small">Total Debits</h6>
      <p className="m-0 fw-bold stat-number">
        KSh {allTransactions
          .filter(t => t.type === "debit")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
      </p>
    </div>

    {/* Current Balance */}
    <div className="stat-card flex-fill p-3 text-center bg-success-subtle text-success">
      <h6 className="mb-1 small">Current Balance</h6>
      <p className="m-0 fw-bold stat-number">
        KSh {allTransactions
          .reduce((balance, t) => t.type === "credit" ? balance + Math.abs(t.amount) : balance - Math.abs(t.amount), 0)}
      </p>
    </div>
  </div>



        {["all", "credit", "debit"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm px-3 py-1 rounded-pill ${filter === f ? "btn-success text-white" : "btn-outline-success"}`}
            onClick={() => handleFilterChange(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="input-group mb-3 shadow-sm" style={{ width: "100%", maxWidth: "900px" }}>
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
        <input type="text" className="form-control border-start-0 small" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Transaction Table */}
      <div className={`bg-white rounded-4 shadow-sm p-2 transition-section ${animate ? "fade-slide-in" : "fade-slide-out"}`} style={{ width: "100%", maxWidth: "900px", minHeight: "250px", maxHeight: "500px", overflowY: "auto" }}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success"></div>
            <p className="text-muted mt-2 small">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-muted m-0 py-4 small">No transactions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle text-nowrap mb-0 small">
              <thead className="table-light sticky-top" style={{ top: 0, zIndex: 2 }}>
                <tr className="text-success border-bottom">
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Type</th>
                  <th className="text-end">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => (
                  <tr key={tx.id} className={`border-bottom ${idx % 2 === 0 ? "bg-light-subtle" : ""} hover-row`}>
                    <td>{tx.description}</td>
                    <td className={`fw-semibold text-end ${tx.type === "credit" ? "text-success" : "text-danger"}`}>
                      {tx.type === "credit" ? "+" : "-"}KSh {Math.abs(tx.amount)}
                    </td>
                    <td className="text-end">
                      <span className={`badge rounded-pill ${tx.type === "credit" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} small`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-end text-secondary small">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-3">
          <button className="btn btn-outline-success btn-sm rounded-pill px-3 py-1" onClick={handleLoadMore}>
            <i className="bi bi-list-ul me-1"></i>More Transactions
          </button>
        </div>
      )}

      <style>{`
        .bg-success-subtle { background-color: rgba(25, 135, 84, 0.1) !important; }
        .bg-danger-subtle { background-color: rgba(220, 53, 69, 0.1) !important; }
        .bg-light-subtle { background-color: #f8f9fa; }
        .transition-section { transition: all 0.3s ease-in-out; }
        .fade-slide-in { opacity: 1; transform: translateY(0); }
        .fade-slide-out { opacity: 0; transform: translateY(15px); }
        input:focus { box-shadow: none !important; border-color: ${primary} !important; }
        .hover-row:hover { background-color: rgba(25, 135, 84, 0.05); transition: background-color 0.2s; }
        .sticky-top th { background-color: #ffffff; }
        .stat-card { border-radius: 2rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .stat-number { font-size: 1.25rem; background: linear-gradient(90deg, #198754, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>
    </div>
  );
};

export default WalletHistoryPage;
