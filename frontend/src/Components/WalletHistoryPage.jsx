import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const WalletHistoryPage = () => {
  const navigate = useNavigate();
  const primary = "#198754";

  const allTransactions = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    description: i % 2 === 0 ? `Top-up via M-Pesa` : `Purchase - Order #A1${i}`,
    amount: i % 2 === 0 ? 500 + i * 10 : -(200 + i * 5),
    type: i % 2 === 0 ? "credit" : "debit",
    date: `Oct ${10 - i}, 0${i % 12}:00 AM`,
  }));

  const perPage = 6;
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      loadPage(1);
      setLoading(false);
      setAnimate(true);
    }, 500);
  }, []);

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
      <div className="bg-white shadow-sm rounded-4 p-3 mb-4 d-flex justify-content-between align-items-center" style={{ width: "100%", maxWidth: "750px", borderTop: `4px solid ${primary}` }}>
        <h5 className="m-0 text-success fw-semibold"><i className="bi bi-clock-history me-2"></i>Wallet History</h5>
        <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => navigate("/wallet")}><i className="bi bi-arrow-left me-1"></i>Back</button>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
        {["all", "credit", "debit"].map((f) => (
          <button key={f} className={`btn btn-sm rounded-pill px-3 ${filter === f ? "btn-success text-white" : "btn-outline-success"}`} onClick={() => handleFilterChange(f)}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
          </button>
        ))}
      </div>

      <div className="input-group mb-3 shadow-sm" style={{ width: "100%", maxWidth: "750px" }}>
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
        <input type="text" className="form-control border-start-0" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className={`bg-white rounded-4 shadow-sm p-3 transition-section ${animate ? "fade-slide-in" : "fade-slide-out"}`} style={{ width: "100%", maxWidth: "750px", minHeight: "300px", maxHeight: "450px", overflowY: "auto" }}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success"></div>
            <p className="text-muted mt-2 small">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-muted m-0 py-4">No transactions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle text-nowrap small mb-0">
              <thead className="table-light sticky-top" style={{ top: 0, zIndex: 2 }}>
                <tr className="text-success border-bottom">
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Type</th>
                  <th className="text-end">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-bottom">
                    <td>{tx.description}</td>
                    <td className={`fw-semibold text-end ${tx.type === "credit" ? "text-success" : "text-danger"}`}>
                      {tx.type === "credit" ? "+" : "-"}KSh {Math.abs(tx.amount)}
                    </td>
                    <td className="text-end text-capitalize">
                      <span className={`badge rounded-pill ${tx.type === "credit" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
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
          <button className="btn btn-outline-success btn-sm rounded-pill px-3" onClick={handleLoadMore}>
            <i className="bi bi-list-ul me-1"></i>Load More Transactions
          </button>
        </div>
      )}

      <style>{`
        .bg-success-subtle { background-color: rgba(25, 135, 84, 0.1) !important; }
        .bg-danger-subtle { background-color: rgba(220, 53, 69, 0.1) !important; }
        .transition-section { transition: all 0.3s ease-in-out; }
        .fade-slide-in { opacity: 1; transform: translateY(0); }
        .fade-slide-out { opacity: 0; transform: translateY(15px); }
        input:focus { box-shadow: none !important; border-color: #198754 !important; }
        .sticky-top th { background-color: #ffffff; }
      `}</style>
    </div>
  );
};

export default WalletHistoryPage;
