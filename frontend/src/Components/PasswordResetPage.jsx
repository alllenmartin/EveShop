import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
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

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordVisible, setPasswordVisible] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [shake, setShake] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "Too weak", color: "danger" });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "newPassword") evaluateStrength(value);
  };

  const evaluateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = "Too weak";
    let color = "danger";

    if (score === 2) { label = "Weak"; color = "warning"; }
    if (score === 3) { label = "Medium"; color = "info"; }
    if (score === 4) { label = "Strong"; color = "success"; }

    setStrength({ score, label, color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Replace URL with your API endpoint
      const res = await fetch("http://127.0.0.1:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password reset successfully!");
        setToasts(prev => [...prev, { id: Date.now(), message: "Password reset successfully!" }]);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message || "Network error");
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
        className={`p-3 rounded-4 shadow-sm login-card ${fadeIn ? "fade-in" : ""}`}
        style={{
          maxWidth: "380px",
          width: "100%",
          backgroundColor: theme.cardBg,
        }}
      >
        <div className="text-center mb-3">
          <img src={leafLogo} alt="Leaf Logo" className="leaf-logo" style={{ maxWidth: "60px" }} />
          <h2 className="mt-2 text-success" style={{ fontSize: "1.3rem" }}>Reset Password</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className={`mb-2 ${shake ? "shake" : ""}`}>
            <label htmlFor="newPassword" className="form-label small">New Password</label>
            <div className="input-group">
              <input
                type={passwordVisible.new ? "text" : "password"}
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-control form-control-sm border-success"
                placeholder="Enter new password"
                required
              />
              <span className="input-group-text bg-light" style={{ cursor: "pointer" }} onClick={() => setPasswordVisible(prev => ({ ...prev, new: !prev.new }))}>
                <i className={`bi ${passwordVisible.new ? "bi-eye-slash" : "bi-eye"} text-success`}></i>
              </span>
            </div>
            {/* Password strength indicator */}
            <div className="mt-1">
              <div className="progress" style={{ height: "6px" }}>
                <div className={`progress-bar bg-${strength.color}`} role="progressbar" style={{ width: `${strength.score * 25}%` }}></div>
              </div>
              <small className={`text-${strength.color}`}>{strength.label}</small>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={`mb-2 ${shake ? "shake" : ""}`}>
            <label htmlFor="confirmPassword" className="form-label small">Confirm Password</label>
            <div className="input-group">
              <input
                type={passwordVisible.confirm ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control form-control-sm border-success"
                placeholder="Confirm new password"
                required
              />
              <span className="input-group-text bg-light" style={{ cursor: "pointer" }} onClick={() => setPasswordVisible(prev => ({ ...prev, confirm: !prev.confirm }))}>
                <i className={`bi ${passwordVisible.confirm ? "bi-eye-slash" : "bi-eye"} text-success`}></i>
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-success btn-sm w-100 mt-2">
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {error && <p className="text-danger mt-2 small">{error}</p>}
        {success && <p className="text-success mt-2 small">{success}</p>}
      </div>

      <style>{`
        .login-card { opacity: 0; transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.8s ease; }
        .login-card.fade-in { opacity: 1; }
        .login-card:hover { transform: scale(1.04); box-shadow: 0 14px 30px rgba(76, 175, 80, 0.45); }

        .form-control { border-width: 1.5px !important; border-color: ${theme.primary} !important; border-radius: 0.375rem; outline: none; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .form-control:focus { transform: scale(1.02); box-shadow: 0 0 8px rgba(76, 175, 80, 0.4); border-color: ${theme.primary} !important; }

        .shake { animation: shake 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }

        .btn { transition: transform 0.2s ease, background-color 0.2s ease; }
        .btn:hover { transform: scale(1.02); }
        .btn:active { transform: scale(0.98); }

        .leaf-logo { width: 15vw; max-width: 60px; height: auto; transition: transform 0.8s ease-in-out; animation: leafFloat 1.5s ease-in-out forwards; }
        @keyframes leafFloat { 0% { transform: scale(0.8) rotate(-5deg); opacity: 0; } 50% { transform: scale(1.05) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

        @media (max-width: 576px) {
          .login-card { padding: 1.5rem 1rem; }
          .form-label { font-size: 0.8rem; }
          .btn { font-size: 0.85rem; padding: 0.4rem; }
        }
      `}</style>
    </main>
  );
};

export default ResetPasswordPage;
