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

const OTPPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    setError(""); 
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpValue }),
      });

      if (!res.ok) throw new Error("Invalid OTP");
      await res.json();

      setSuccess("OTP verified successfully!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: `linear-gradient(135deg, ${theme.gradientStart}, ${theme.gradientEnd})`, padding: "1rem" }}
    >
      <div className={`p-3 rounded-4 shadow-sm otp-card ${fadeIn ? "fade-in" : ""}`} style={{ maxWidth: "380px", width: "100%", backgroundColor: theme.cardBg }}>
        <div className="text-center mb-3">
          <img src={leafLogo} alt="Leaf Logo" className="leaf-logo" style={{ maxWidth: "60px" }} />
          <h2 className="mt-2 text-success" style={{ fontSize: "1.3rem" }}>OTP Verification</h2>
          <p className="small text-muted">Enter the 4-digit code sent to your email</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`d-flex justify-content-between mb-3 ${shake ? "shake" : ""} ${glow ? "glow" : ""}`}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleBackspace(e, index)}
                className="form-control form-control-sm text-center border-success"
                style={{ width: "3rem", fontSize: "1.5rem", margin: "0 0.25rem" }}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-success btn-sm w-100">
            {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {error && <p className="text-danger mt-2 small">{error}</p>}
        {success && <p className="text-success mt-2 small">{success}</p>}

        <div className="mt-2 text-center">
          <p className="small">Didn't receive OTP? <span className="text-success fw-bold" style={{ cursor: "pointer" }}>Resend</span></p>
        </div>
      </div>

      <style>{`
        .otp-card { opacity: 0; transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.8s ease; }
        .otp-card.fade-in { opacity: 1; }
        .otp-card:hover { transform: scale(1.04); box-shadow: 0 14px 30px rgba(76, 175, 80, 0.45); }

        .form-control { border-width: 1.5px !important; border-color: ${theme.primary} !important; border-radius: 0.375rem; outline: none; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .form-control:focus { transform: scale(1.05); box-shadow: 0 0 8px rgba(76, 175, 80, 0.5); border-color: ${theme.primary} !important; }

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
          .otp-card { padding: 1.5rem 1rem; }
          .btn { font-size: 0.85rem; padding: 0.4rem; }
        }
      `}</style>
    </main>
  );
};

export default OTPPage;
