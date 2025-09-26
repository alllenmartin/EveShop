import React, { useState } from "react";
// import logo from "../assets/logo.png"; // place your logo in src/assets/logo.png

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shipping_address: "",
    password: "",
    lat: "-1.286389",
    long: "36.817223",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    // Here you can do your API POST request
  };

  const togglePasswordVisibility = () => {
    const passwordInput = document.getElementById("u-pass");
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  };

  return (
    <main id="app" className="auth-container">
      <div className="guest-auth-card">
        <div className="mb-3 text-center">
          <div className="auth-card-icon">
            <a href="https://pharmily.co.ke">
              {/* <img src={logo} alt="Logo" /> */}
              <img src="https://pharmily.co.ke/img/favicon.png" alt="Logo" />
            </a>
          </div>
          <h1 className="mt-1 mb-4">Create an account</h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="guest-auth-form-group">
            <label htmlFor="l-name">Name</label>
            <div className="new-input-group">
              <span className="nig-icon">
                <i className="bi bi-person"></i>
              </span>
              <input
                id="l-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="guest-form-control"
                autoComplete="off"
              />
            </div>
          </div>

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
                autoComplete="off"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="guest-auth-form-group">
            <label htmlFor="l-phone">Phone Number</label>
            <div className="new-input-group">
              <span className="nig-icon">
                <i className="bi bi-phone"></i>
              </span>
              <input
                id="l-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="guest-form-control"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Shipping Address */}
          {/* <div className="guest-auth-form-group">
            <label htmlFor="l-shipping_address">
              Shipping/Delivery Address
            </label>
            <div className="new-input-group">
              <span className="nig-icon">
                <i className="bi bi-map"></i>
              </span>
              <input
                id="l-shipping_address"
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                required
                className="guest-form-control"
                autoComplete="off"
              />
            </div>
          </div> */}

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
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="guest-form-control"
                autoComplete="new-password"
              />
              <span
                className="nig-icon-right"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                <i className="fa fa-eye"></i>
              </span>
            </div>
          </div>

          {/* Privacy Policy */}
          {/* <div className="guest-auth-form-group">
            <p>
              Your personal data will be used to enhance your experience on
              this website, manage your account access, and fulfill other
              purposes outlined in our{" "}
              <a
                href="https://pharmily.co.ke/privacy-policy"
                className="text-second"
                target="_blank"
                rel="noreferrer"
              >
                privacy policy
              </a>
            </p>
          </div> */}

          {/* Submit Button */}
          <div className="guest-auth-form-group mb-0">
            <button
              type="submit"
              className="btn btn-orange btn-block text-uppercase fw-500"
            >
              Register
            </button>
          </div>
        </form>

        <div className="outside-form-sect">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-second">
              Login
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
