// LoginPage.js
import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import leafLogo from "../assets/leaf.png";
import { loginUser } from "../api";
import { AuthContext } from "../Components/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/products";

  const { login } = useContext(AuthContext); // Get login function from context

  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await loginUser(formData);
      console.log("Response from loginUser:", data);

      if (data.message) {
        setSuccess(data.message);

        if (data.token && data.user) {
          // Pass token + user details to AuthContext login
          login(data.token, formData.remember, data.user);
          console.log("User logged in:", data.user);
        } else
          console.log("Usfjjjf:", data.user);

        // Redirect to Catalog (or previous page)
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="d-flex justify-content-center align-items-center vh-100" style={{ padding: "1rem" }}>
      <div className="p-3 rounded-4 shadow-sm login-card" style={{ maxWidth: "380px", width: "100%", backgroundColor: "#f1f8f2" }}>
        <div className="text-center mb-3">
          <img src={leafLogo} alt="Leaf Logo" style={{ maxWidth: "60px" }} />
          <h2 className="mt-2 text-success" style={{ fontSize: "1.3rem" }}>Login to your account</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="email" className="form-label small">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control form-control-sm border-success"
              placeholder="Email"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="form-label small">Password</label>
            <div className="input-group">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control form-control-sm border-success"
                placeholder="Password"
                required
              />
              <span className="input-group-text bg-light" style={{ cursor: "pointer" }} onClick={() => setPasswordVisible(!passwordVisible)}>
                <i className={`bi ${passwordVisible ? "bi-eye-slash" : "bi-eye"} text-success`}></i>
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
            <div className="form-check">
              <input
                type="checkbox"
                name="remember"
                id="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="form-check-input border-success"
              />
              <label htmlFor="remember" className="form-check-label small">Remember Me</label>
            </div>
            <Link to="/forgotpass" className="text-success small mt-1 mt-sm-0">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-success btn-sm w-100 mt-2">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p className="text-danger mt-2 small">{error}</p>}
        {success && <p className="text-success mt-2 small">{success}</p>}

        <div className="mt-2 text-center">
          <p className="small">No account yet? <Link to="/register" className="text-success fw-bold">Create account</Link></p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
