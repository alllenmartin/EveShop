import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CheckoutSummary = () => {
  const navigate = useNavigate();

  // Cart state
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Address state
  const [address, setAddress] = useState(() => {
    const stored = localStorage.getItem("address");
    return stored ? JSON.parse(stored) : null;
  });

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [userPhone, setUserPhone] = useState(localStorage.getItem("phone") || "254703622386");
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [useWallet, setUseWallet] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const deliveryOptions = {
    standard: { name: "Standard Delivery (2-4 days)", fee: 150, minDays: 2 },
    express: { name: "Express Delivery (1 day)", fee: 300, minDays: 1 },
    pickup: { name: "Pickup - Free", fee: 0, minDays: 0 },
  };

  const currency = (value) => `Ksh ${value.toLocaleString()}`;

  const subtotal = cart.length > 0 ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const deliveryFee = cart.length > 0 ? deliveryOptions[selectedDelivery].fee : 0;
  const walletDiscount = cart.length > 0 && useWallet ? Math.min(200, Math.floor(subtotal * 0.05)) : 0;
  const taxes = cart.length > 0 ? Math.round((subtotal + deliveryFee - walletDiscount) * 0.16) : 0;
  const total = subtotal + deliveryFee + taxes - walletDiscount;

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + deliveryOptions[selectedDelivery].minDays);
    return today.toISOString().split("T")[0];
  };

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const today = new Date().toISOString().split("T")[0];
    let slots = [];

    if (selectedDelivery === "express") {
      slots = ["08:00", "10:00", "12:00", "14:00", "16:00"];
    } else if (selectedDelivery === "standard") {
      slots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
    } else if (selectedDelivery === "pickup") {
      slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    }

    // Only show future times if deliveryDate is today
    if (deliveryDate === today) {
      const currentHour = now.getHours();
      slots = slots.filter(time => parseInt(time.split(":")[0]) > currentHour);
    }

    return slots;
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (cart.length === 0) {
      setDeliveryDate("");
      setDeliveryTime("");
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("address", JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("address");
      setAddress(stored ? JSON.parse(stored) : null);
      // Reset delivery date/time on address change
      setDeliveryDate(getMinDate());
      setDeliveryTime("");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedDelivery]);

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToastMessage("Item removed from cart");
  };

  const showToastMessage = (message) => {
    setToastMsg(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const placeOrder = () => {
    if (!userPhone) {
      alert("You must be logged in to place an order.");
      return;
    }

    if (!address) {
      alert("Please add your delivery address first.");
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      alert("Please select delivery date and time.");
      return;
    }

    const order = {
      reference: `ORDER-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
      userPhone,
      address,
      items: cart,
      deliveryMethod: selectedDelivery,
      deliveryFee,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      total,
    };

    console.log("Placing order:", order);
    alert("Order placed successfully!");
    setCart([]);
    localStorage.removeItem("cart");
    setCheckoutMode(false);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-success d-flex align-items-center" href="#top">
            <i className="bi bi-leaf-fill me-2 text-success"></i>EveShop
          </a>
          <div className="d-flex align-items-center ms-auto">
            <button className="btn btn-outline-danger" onClick={() => {
              localStorage.removeItem("phone");
              navigate("/");
            }}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Toast */}
      {showToast && (
        <div
          className="toast show position-fixed top-0 end-0 m-3 p-2 bg-success text-white shadow"
          style={{ zIndex: 1055, opacity: 0.95 }}
        >
          <div>{toastMsg}</div>
        </div>
      )}

      {/* Checkout Items */}
      <div className="container py-5">
        <h3 className="fw-semibold mb-4">Checkout Summary</h3>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul className="list-group mb-4">
            {cart.map(item => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: "contain" }} className="rounded" />
                  <div>
                    {item.name} x {item.quantity}
                    <br />
                    <small className="text-muted">Ksh {item.price.toLocaleString()} each</small>
                  </div>
                </div>
                <span className="fw-bold">{currency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Delivery Options */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Delivery Options</label>
          <div className="d-flex flex-column gap-2">
            {Object.entries(deliveryOptions).map(([key, opt]) => (
              <label
                key={key}
                className={`border rounded p-3 d-flex justify-content-between align-items-center cursor-pointer ${selectedDelivery === key ? "border-success shadow-sm" : "border-light"}`}
                onClick={() => {
                  setSelectedDelivery(key);
                  setDeliveryDate(getMinDate());
                  setDeliveryTime("");
                }}
              >
                <div>
                  <div className="fw-medium">{opt.name}</div>
                  <small className="text-muted">{key === "pickup" ? "Collect from store" : "Delivered to your address"}</small>
                </div>
                <div>
                  <span className="fw-bold">{currency(opt.fee)}</span>
                  <input type="radio" name="delivery" checked={selectedDelivery === key} readOnly className="ms-2" />
                </div>
              </label>
            ))}
          </div>

          <label className="form-label fw-semibold mt-3">Select Delivery Date & Time</label>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              min={getMinDate()}
            />
            <select className="form-select" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}>
              <option value="">Select time</option>
              {getAvailableTimeSlots().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <label className="form-label fw-semibold mt-3">Payment Method</label>
          <div className="d-flex flex-column gap-2">
            {["mpesa", "card", "cash"].map(method => (
              <label
                key={method}
                className={`border rounded p-3 d-flex justify-content-between align-items-center cursor-pointer ${paymentMethod === method ? "border-success shadow-sm" : "border-light"}`}
                onClick={() => setPaymentMethod(method)}
              >
                <div className="fw-medium text-capitalize">{method === "mpesa" ? "M-Pesa" : method === "card" ? "Debit / Credit Card" : "Cash on Delivery"}</div>
                <input type="radio" name="payment" checked={paymentMethod === method} readOnly />
              </label>
            ))}
          </div>

          <div className="form-check mt-2">
            <input className="form-check-input" type="checkbox" checked={useWallet} onChange={() => setUseWallet(!useWallet)} id="walletCheck" />
            <label className="form-check-label" htmlFor="walletCheck">
              Use Wallet balance (avail KSh 500)
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="border rounded p-3 mb-3">
          <div className="d-flex justify-content-between"><span>Subtotal:</span><span>{currency(subtotal)}</span></div>
          <div className="d-flex justify-content-between"><span>Delivery Fee:</span><span>{currency(deliveryFee)}</span></div>
          {useWallet && <div className="d-flex justify-content-between"><span>Wallet Discount:</span><span>- {currency(walletDiscount)}</span></div>}
          <div className="d-flex justify-content-between"><span>Taxes (16%):</span><span>{currency(taxes)}</span></div>
          <div className="d-flex justify-content-between fw-bold mt-2"><span>Total:</span><span>{currency(total)}</span></div>
        </div>

        <button className="btn btn-success w-100" onClick={placeOrder}>
          <i className="bi bi-cart-plus me-2"></i> Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;
