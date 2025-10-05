import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
import leafLogo from "../assets/leaf.png";

const theme = {
  primary: "#4caf50",
  hover: "#45a049",
  cardBg: "#f1f8f2",
  gradientStart: "#e8f5e9",
  gradientEnd: "#c8e6c9",
};

const Toast = ({ message, duration = 3000, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  return (
    <div
      className="position-fixed top-0 end-0 m-3 p-3 bg-success text-white shadow-lg rounded-4 toast-slide"
      style={{ zIndex: 1055, minWidth: "220px" }}
      aria-live="polite"
    >
      <i className="bi bi-check-circle me-2"></i>
      {message}
      <style>{`
        .toast-slide {
          animation: slideIn 0.5s forwards, fadeOut ${duration}ms ${duration - 500}ms forwards;
        }
        @keyframes slideIn { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [shake, setShake] = useState(false);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setGlow(true);
      const timer = setTimeout(() => setGlow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Email not found or request failed");
      await res.json();

      setSuccess("Reset link sent to your email!");
      setToasts(prev => [...prev, { id: Date.now(), message: "Check your email for reset link!" }]);
      setEmail("");
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`, padding: "1rem" }}
    >
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}

      <div
        className={`p-3 rounded-4 shadow-sm forgot-card ${fadeIn ? "fade-in" : ""}`}
        style={{ maxWidth: "380px", width: "100%", backgroundColor: theme.cardBg }}
      >
        <div className="text-center mb-3">
          <img src={leafLogo} alt="Leaf Logo" className="leaf-logo" style={{ maxWidth: "60px" }} />
          <h2 className="mt-2 text-success" style={{ fontSize: "1.3rem" }}>Forgot Password</h2>
          <p className="small text-muted">Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`mb-3 ${shake ? "shake" : ""} ${glow ? "glow" : ""}`}>
            <label htmlFor="email" className="form-label small">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-sm border-success"
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="btn btn-success btn-sm w-100">
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {error && <p className="text-danger mt-2 small">{error}</p>}
        {success && <p className="text-success mt-2 small">{success}</p>}

        <div className="mt-2 text-center">
          <p className="small">Remembered your password? <Link to="/login" className="text-success fw-bold">Login</Link></p>
        </div>
      </div>

      <style>{`
        .forgot-card { opacity: 0; transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.8s ease; }
        .forgot-card.fade-in { opacity: 1; }
        .forgot-card:hover { transform: scale(1.04); box-shadow: 0 14px 30px rgba(76, 175, 80, 0.45); }

        .form-control { border-width: 1.5px !important; border-color: ${theme.primary} !important; border-radius: 0.375rem; outline: none; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .form-control:focus { transform: scale(1.02); box-shadow: 0 0 8px rgba(76, 175, 80, 0.4); border-color: ${theme.primary} !important; }

        .shake { animation: shake 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }

        .glow { animation: glow 1s ease-in-out; }
        @keyframes glow { 0% { box-shadow: 0 0 0 rgba(76,175,80,0); } 50% { box-shadow: 0 0 8px rgba(76,175,80,0.6); } 100% { box-shadow: 0 0 0 rgba(76,175,80,0); } }

        .btn { transition: transform 0.2s ease, background-color 0.2s ease; }
        .btn:hover { transform: scale(1.02); }
        .btn:active { transform: scale(0.98); }

        .leaf-logo { width: 15vw; max-width: 60px; height: auto; transition: transform 0.8s ease-in-out; animation: leafFloat 1.5s ease-in-out forwards; }
        @keyframes leafFloat { 0% { transform: scale(0.8) rotate(-5deg); opacity: 0; } 50% { transform: scale(1.05) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

        @media (max-width: 576px) {
          .forgot-card { padding: 1.5rem 1rem; }
          .form-label { font-size: 0.8rem; }
          .btn { font-size: 0.85rem; padding: 0.4rem; }
        }
      `}</style>
    </main>
  );
};

export default ForgotPassword;
