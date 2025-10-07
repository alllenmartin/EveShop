import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DeliveryAddress = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("checkoutData");
    if (!storedData) {
      navigate("/checkout"); // Redirect if no checkout data
      return;
    }
    setCheckoutData(JSON.parse(storedData));
  }, [navigate]);

  const currency = (value) => `Ksh ${value.toLocaleString()}`;

  const placeOrder = () => {
    if (!address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    const order = {
      ...checkoutData,
      deliveryAddress: address,
      reference: `ORDER-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`
    };

    console.log("Order placed:", order);
    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    localStorage.removeItem("checkoutData");
    navigate("/"); // Redirect home
  };

  if (!checkoutData) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "1.5rem", color: "#2E7D32" }}>Delivery Address & Order Summary</h3>

      {/* Delivery Address Input */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>Full Address</label>
        <textarea
          style={{ width: "100%", padding: "0.75rem", borderRadius: 8, border: "1px solid #ddd", resize: "none" }}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter your full delivery address"
        />
      </div>

      {/* Order Summary Card */}
      <div style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: "1.5rem", backgroundColor: "#fff" }}>
        <h5 style={{ fontWeight: 600, marginBottom: "1rem", color: "#2E7D32" }}>Order Summary</h5>

        {/* Cart Items */}
       <ul style={{ listStyle: "none", padding: 0, marginBottom: "1rem" }}>
  {checkoutData.cart.map(item => (
    <li
      key={item.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: 50,
            height: 50,
            overflow: "hidden",
            borderRadius: 6,
            transition: "transform 0.3s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 500 }}>{item.name} x {item.quantity}</div>
          <small style={{ color: "#555" }}>{currency(item.price)} each</small>
        </div>
      </div>
      <div style={{ fontWeight: 600 }}>{currency(item.price * item.quantity)}</div>
    </li>
  ))}
</ul>


        {/* Delivery Details */}
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
          <span>Delivery Method:</span>
          <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
            {checkoutData.selectedDelivery} ({currency(checkoutData.deliveryFee)})
          </span>
        </div>
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
          <span>Delivery Date:</span>
          <span style={{ fontWeight: 600 }}>{checkoutData.deliveryDate}</span>
        </div>
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
          <span>Delivery Time:</span>
          <span style={{ fontWeight: 600 }}>{checkoutData.deliveryTime}</span>
        </div>

        {/* Payment & Wallet */}
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
          <span>Payment Method:</span>
          <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{checkoutData.paymentMethod}</span>
        </div>
        {checkoutData.useWallet && (
          <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", color: "#2E7D32", fontWeight: 600 }}>
            <span>Wallet Discount:</span>
            <span>- {currency(checkoutData.subtotal * 0.05)}</span>
          </div>
        )}

        {/* Total */}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: "1rem", fontSize: "1.1rem" }}>
          <span>Total:</span>
          <span>{currency(checkoutData.total)}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={placeOrder}
        style={{
          marginTop: "1.5rem",
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#2E7D32",
          color: "#fff",
          fontWeight: 600,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1B5E20"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2E7D32"}
      >
        <i className="bi bi-cart-plus me-2"></i> Place Order
      </button>
    </div>
  );
};

export default DeliveryAddress;
