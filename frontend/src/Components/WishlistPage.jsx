import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import leafLogo from "../assets/leaf.png";

const theme = {
  primary: "#4caf50",
  hover: "#45a049",
  cardBg: "#f1f8f2",
  gradientStart: "#e8f5e9",
  gradientEnd: "#c8e6c9",
};

const userPhone = "254703622386"; // replace with actual logged-in user's phone number

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
    fetchWishlist();
  }, []);

  // Fetch wishlist from Flask
  const fetchWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:5000/wishlist?user_phone=${userPhone}`);
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const handleAddToCart = async (item) => {
    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_phone: userPhone, product_id: item.id }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      setMessage(`${item.name} added to cart`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/wishlist/remove/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
      setWishlist((prev) => prev.filter((item) => item.id !== id));
      setMessage("Removed from wishlist");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Auto-hide messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <main
      className="vh-100 d-flex flex-column"
      style={{
        background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      {/* Top bar */}
      <nav
        className="navbar navbar-light justify-content-between mb-3 shadow-sm rounded-4 px-3"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="d-flex align-items-center">
          <img src={leafLogo} alt="Leaf Logo" width="40" height="40" className="me-2" />
          <span className="fw-bold text-success fs-5">EveShop</span>
        </div>
        <div>
          <Link to="/cart" className="btn btn-sm btn-outline-success me-2">
            <i className="bi bi-cart4"></i> Cart
          </Link>
          <Link to="/logout" className="btn btn-sm btn-outline-danger">
            <i className="bi bi-box-arrow-right"></i> Logout
          </Link>
        </div>
      </nav>

      {/* Toast message */}
      {message && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-2 text-center rounded-3 shadow-sm"
          style={{
            zIndex: 2000,
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.primary}`,
            color: theme.primary,
            minWidth: "200px",
            fontSize: "0.9rem",
          }}
        >
          {message}
        </div>
      )}

      {/* Wishlist Content */}
      <div className={`container ${fadeIn ? "fade-in" : ""}`}>
        <h4 className="text-success mb-3 text-center">My Wishlist</h4>

        {loading ? (
          <div className="text-center mt-5 text-muted">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2">Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <i className="bi bi-heart" style={{ fontSize: "3rem" }}></i>
            <p className="mt-2">Your wishlist is empty!</p>
            <Link to="/products" className="btn btn-success btn-sm mt-2">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {wishlist.map((item) => (
              <div key={item.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className="card shadow-sm rounded-4 border-0 h-100 wishlist-card"
                  style={{ backgroundColor: theme.cardBg }}
                >
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="card-img-top rounded-top-4"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center p-2">
                    <h6 className="card-title text-success mb-1">{item.name}</h6>
                    <p className="text-muted small mb-2">Ksh {item.price}</p>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <i className="bi bi-cart-plus"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.8s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wishlist-card {
          transition: transform 0.25s ease, box-shadow 0.3s ease;
        }
        .wishlist-card:hover {
          transform: scale(1.04);
          box-shadow: 0 10px 25px rgba(76, 175, 80, 0.4);
        }

        .btn-success {
          background-color: ${theme.primary};
          border-color: ${theme.primary};
        }
        .btn-success:hover {
          background-color: ${theme.hover};
        }
      `}</style>
    </main>
  );
};

export default WishlistPage;
