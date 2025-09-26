import React, { useState } from "react";
import logo from '../assets/img/favicon-32x32.png';


const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      // Example: save token to localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        setSuccess("Login successful! Redirecting...");
        // redirect example
        window.location.href = "/dashboard";
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="app" className="auth-container">
      <div className="guest-auth-card">
        <div className="mb-3 text-center">
          <div className="auth-card-icon">
            <a href="https://pharmcccily.co.ke">
           <img src="https://pharmily.co.ke/img/favicon.png" alt="Logo" />
                {/* <img src={logo} alt="Logo" /> */}
            </a>
          </div>
          <h1 className="mt-1 mb-4">Login to your account</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="guest-auth-form-group">
            <label htmlFor="l-email">Email</label>
            <div className="new-input-group">
              <span className="nig-icon">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                id="l-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="guest-form-control"
              />
            </div>
          </div>

          {/* Password */}
          <div className="guest-auth-form-group">
            <label className="guest-abs-label" htmlFor="u-pass">
              Password
            </label>
            <div className="new-input-group">
              <span className="nig-icon">
                <i className="bi bi-lock"></i>
              </span>
              <input
                id="u-pass"
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="guest-form-control"
              />
              <span
                className="nig-icon-right"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={{ cursor: "pointer" }}
              >
                <i
                  className={`fa ${
                    passwordVisible ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </span>
            </div>
          </div>

          {/* Remember + Forgot password */}
          <div className="guest-auth-form-group">
            <div className="row">
              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input shadow-none"
                    type="checkbox"
                    name="remember"
                    id="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Remember Me
                  </label>
                </div>
              </div>
              <div className="col-6">
                <a
                  className="d-block text-center small fw-400 text-orange"
                  href="/forgot-password"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="guest-auth-form-group mb-0">
            <button
              type="submit"
              className="btn btn-orange btn-block text-uppercase fw-500"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {/* Messages */}
        {error && <p className="text-danger mt-3">{error}</p>}
        {success && <p className="text-success mt-3">{success}</p>}

        <div className="outside-form-sect">
          <p>
            No account yet? <a href="/register">Create account</a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
