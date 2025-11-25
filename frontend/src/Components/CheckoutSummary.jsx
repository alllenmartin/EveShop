import React, { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Components/AuthContext";

const CheckoutSummary = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  const [userPhone, setUserPhone] = useState(localStorage.getItem("phone") || "254703622386");
  const [userAddress, setUserAddress] = useState(() => JSON.parse(localStorage.getItem("userAddress") || "null"));
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [useWallet, setUseWallet] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ message: "", type: "success" });

  const [walletBalance, setWalletBalance] = useState(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    return savedBalance ? parseFloat(savedBalance) : 500; // default 500
  });

  const [walletUsageAmount, setWalletUsageAmount] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isToppingUp, setIsToppingUp] = useState(false);

  const [mpesaNumber, setMpesaNumber] = useState(userPhone || "");
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaProgress, setMpesaProgress] = useState(0);

  const deliveryOptions = {
    standard: { name: "Standard Delivery (2–4 days)", fee: 150, minDays: 2 },
    express: { name: "Express Delivery (1 day)", fee: 300, minDays: 1 },
    pickup: { name: "Pickup – Free", fee: 0, minDays: 0 },
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.length ? deliveryOptions[selectedDelivery].fee : 0;
  const taxes = Math.round((subtotal + deliveryFee) * 0.16);
  const total = subtotal + deliveryFee + taxes;

  const computedWalletDeduction = useWallet ? Math.min(walletUsageAmount, total) : 0;
  const remainingPayment = total - computedWalletDeduction;

  const currency = (value) => `KSh ${value.toLocaleString()}`;

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("walletBalance", walletBalance.toString()); }, [walletBalance]);

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + deliveryOptions[selectedDelivery].minDays);
    return today.toISOString().split("T")[0];
  };

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const today = new Date().toISOString().split("T")[0];
    let slots = selectedDelivery === "express"
      ? ["08:00", "10:00", "12:00", "14:00", "16:00"]
      : selectedDelivery === "standard"
      ? ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]
      : ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

    if (deliveryDate === today) {
      const currentHour = now.getHours();
      slots = slots.filter(time => parseInt(time.split(":")[0]) > currentHour);
    }
    return slots;
  };

  const showToastMessage = (message, type = "success") => {
    setToastMsg({ message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const isValidMpesaNumber = (number) => /^07\d{8}$/.test(number) || /^2547\d{8}$/.test(number);

  const handleMpesaPush = (amount) => {
    setShowMpesaModal(true);
    setMpesaProgress(0);

    const interval = setInterval(() => {
      setMpesaProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowMpesaModal(false);
          showToastMessage(`M-PESA push sent successfully! Pay KSh ${amount.toLocaleString()} on your phone.`);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
  };

  // const placeOrder = () => {
  //   if (cart.length === 0) return showToastMessage("Your cart is empty!", "danger");
  //   if (!deliveryDate || !deliveryTime) return alert("Select delivery date and time.");

  //   if (useWallet && walletUsageAmount > 0) {
  //     setWalletBalance(prev => prev - computedWalletDeduction);
  //     localStorage.setItem("walletBalance", (walletBalance - computedWalletDeduction).toString());
  //   }

  //   if (paymentMethod === "mpesa" && remainingPayment > 0) {
  //     if (!isValidMpesaNumber(mpesaNumber)) {
  //       return showToastMessage("Enter a valid M-Pesa number", "danger");
  //     }
  //     handleMpesaPush(remainingPayment);
  //   }

  //   const finalPaymentMethod = remainingPayment === 0 && useWallet ? "wallet" : paymentMethod;

  //   const order = {
  //     reference: `ORDER-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
  //     userPhone,
  //     items: cart,
  //     deliveryMethod: selectedDelivery,
  //     deliveryFee,
  //     deliveryDate,
  //     deliveryTime,
  //     paymentMethod: finalPaymentMethod,
  //     total,
  //     walletDeduction: computedWalletDeduction,
  //     remainingPayment,
  //     address: userAddress,
  //   };

    
  //   console.log("Placing order:", order);
  //   showToastMessage("Order placed successfully!");
  //   setCart([]);
  //   localStorage.removeItem("cart");

  //   const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  //   existingOrders.push(order);
  //   localStorage.setItem("orders", JSON.stringify(existingOrders));


  // };

const placeOrder = async () => {
  if (cart.length === 0) return showToastMessage("Your cart is empty!", "danger");
  if (!deliveryDate || !deliveryTime) return alert("Select delivery date and time.");

  console.log("AuthContext user:", user); // Debug: check what your user object contains

  // Adjust this field based on your AuthContext

  // Helper to decode JWT payload
const parseJwt = (token) => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
};

// Inside placeOrder
const token = user; // your AuthContext gives the JWT
const decoded = parseJwt(token);

if (!decoded?.user_id) {
  return showToastMessage("User not logged in", "danger");
}

const userId = decoded.user_id; // t
  // const userId = user?._id || user?.id;
  if (!userId) return showToastMessage("User not logged in", "danger");

  // Deduct wallet if used
  if (useWallet && walletUsageAmount > 0) {
    setWalletBalance(prev => prev - computedWalletDeduction);
  }

  const finalPaymentMethod = remainingPayment === 0 && useWallet ? "wallet" : paymentMethod;

  // Build payload for backend
  const orderPayload = {
    user_id: userId, // use correct ID
    quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
    total_amount: total,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    deliveryMethod: selectedDelivery,
    deliveryFee,
    deliveryDate,
    deliveryTime,
    paymentMethod: finalPaymentMethod,
    walletDeduction: computedWalletDeduction,
    remainingPayment,
    address: userAddress,
    reference: `ORDER-${Date.now()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
    userPhone
  };

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Order Placement Error:", data);
      showToastMessage("Failed to place order", "danger");
      return;
    }

    // Order success
    showToastMessage("Order placed successfully!");
    console.log("Order placed:", data);

    // Clear cart
    setCart([]);
    localStorage.removeItem("cart");

    // Save to local orders for history
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    existingOrders.push(orderPayload);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // Optionally redirect user after order
    navigate("/orders");

  } catch (err) {
    console.error("Order Placement Exception:", err);
    showToastMessage("Failed to place order", "danger");
  }
};



 return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top" style={{ minHeight: "60px" }}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a className="navbar-brand fw-bold text-success d-flex align-items-center" href="home">
            <i className="bi bi-leaf-fill me-2"></i> EveShop
          </a>
          <button
            className="btn btn-outline-success p-1 rounded-circle logout-btn"
            style={{ borderColor: "#2E7D32", color: "#2E7D32", width: "32px", height: "32px" }}
            onClick={() => {
              localStorage.removeItem("phone");
              navigate("/");
            }}
            title="Logout"
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }}></i>
          </button>
        </div>
      </nav>

      <style>
        {`
        .logout-btn:hover {
          background-color: #f5f5f5;
          border-color: #2E7D32;
        }
        `}
      </style>

      {showToast && (
        <div
          className={`toast show position-fixed top-0 end-0 m-3 p-2 shadow text-white`}
          style={{ zIndex: 1055, opacity: 0.95, backgroundColor: toastMsg.type === "danger" ? "#D32F2F" : "#2E7D32" }}
        >
          {toastMsg.message}
        </div>
      )}

      {showMpesaModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1056 }}
        >
          <div className="bg-success text-white p-4 rounded shadow text-center" style={{ maxWidth: 350 }}>
            <i className="bi bi-phone-fill fs-1 mb-3"></i>
            <h6 className="fw-semibold mb-2">M-PESA Payment</h6>
            <p className="small mb-3">
              A payment request has been sent to <br /><strong>{userPhone}</strong> <br />Please check your phone and enter your PIN.
            </p>
            <div className="progress rounded-pill" style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.3)" }}>
              <div className="progress-bar bg-white" role="progressbar" style={{ width: `${mpesaProgress}%`, transition: "width 0.06s linear" }}></div>
            </div>
            <button className="btn btn-outline-light btn-sm rounded-pill mt-3" onClick={() => setShowMpesaModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Cart Summary */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-semibold text-success mb-3">
                  <i className="bi bi-bag-check-fill me-2"></i> Order Summary
                </h5>
                {cart.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 60, height: 60, objectFit: "contain" }}
                          className="rounded"
                        />
                        <div>
                          <div className="fw-medium">{item.name}</div>
                          <small className="text-muted">
                            {item.quantity} × {currency(item.price)}
                          </small>
                        </div>
                      </div>
                      <span className="fw-bold text-success">
                        {currency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Address */}
            {userAddress && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h6 className="fw-semibold text-success mb-2">
                    <i className="bi bi-geo-alt-fill me-2"></i> Delivery Address
                  </h6>
                  <div>{userAddress.fullName}</div>
                  <div>{userAddress.phone}</div>
                  <div>{userAddress.addressLine}</div>
                  <div>{userAddress.city}</div>
                  <button
                    className="btn btn-outline-success btn-sm rounded-pill mt-3"
                    onClick={() => navigate("/address")}
                  >
                    <i className="bi bi-pencil me-1"></i> Edit Address
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Options */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h6 className="fw-semibold text-success mb-3">
                  <i className="bi bi-truck me-2"></i> Delivery Options
                </h6>
                <div className="d-flex flex-column gap-2">
                  {Object.entries(deliveryOptions).map(([key, opt]) => (
                    <label
                      key={key}
                      className={`border rounded p-3 d-flex justify-content-between align-items-center ${
                        selectedDelivery === key ? "border-success bg-success bg-opacity-10" : ""
                      }`}
                      onClick={() => {
                        setSelectedDelivery(key);
                        setDeliveryDate(getMinDate());
                        setDeliveryTime("");
                      }}
                    >
                      <div>
                        <div className="fw-medium">{opt.name}</div>
                        <small className="text-muted">
                          {key === "pickup"
                            ? "Collect from store"
                            : "Delivered to your address"}
                        </small>
                      </div>
                      <span className="fw-bold text-success">{currency(opt.fee)}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">Delivery Date & Time</label>
                  <div className="d-flex gap-2">
                    <input
                      type="date"
                      className="form-control"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={getMinDate()}
                    />
                    <select
                      className="form-select"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                    >
                      <option value="">Select time</option>
                      {getAvailableTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
           <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="fw-semibold text-success mb-3">
              <i className="bi bi-credit-card me-2"></i> Payment Method
            </h6>

            {["mpesa", "card", "cash"].map((method) => (
              <label
                key={method}
                className={`border rounded p-3 d-flex justify-content-between align-items-center mb-2 ${
                  paymentMethod === method ? "border-success bg-success bg-opacity-10" : ""
                }`}
                onClick={() => setPaymentMethod(method)}
              >
                <span className="fw-medium text-capitalize">
                  {method === "mpesa"
                    ? "M-Pesa"
                    : method === "card"
                    ? "Debit / Credit Card"
                    : "Cash on Delivery"}
                </span>
                <input type="radio" name="payment" checked={paymentMethod === method} readOnly />
              </label>
            ))}

            {/* Stylish M-Pesa Number Input */}
           {paymentMethod === "mpesa" && (
                  <div className="form-floating mt-3">
                    <input
                      type="tel"
                      className="form-control border-success"
                      id="mpesaNumber"
                      placeholder="Enter M-Pesa number"
                      value={mpesaNumber}
                      onChange={(e) => {
                        // Remove all non-digit characters
                        let raw = e.target.value.replace(/\D/g, "");

                        // Limit to max length 12
                        if (raw.startsWith("254")) raw = raw.slice(0, 12);
                        else if (raw.startsWith("07")) raw = raw.slice(0, 10);
                        else raw = raw.slice(0, 10);

                        setMpesaNumber(raw);
                        setUserPhone(raw); // Update the actual userPhone state for order
                      }}
                    />
                    <label htmlFor="mpesaNumber" className="text-success fw-medium">
                      M-Pesa Number
                    </label>
                    <small className="text-muted d-block mt-1">
                      You can use a different M-Pesa number than your account.
                    </small>
                  </div>
                )}
                  
            {/* --- Wallet Section --- */}
<div className="border rounded p-3 mt-3">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <div className="form-check">
      <input
        className="form-check-input me-2"
        type="checkbox"
        checked={useWallet}
        onChange={() => {
          setUseWallet(!useWallet);
          if (!useWallet) {
            setWalletUsageAmount(Math.min(walletBalance, total));
          } else {
            setWalletUsageAmount(0);
          }
        }}
        id="walletCheck"
      />
      <label className="form-check-label fw-medium text-success" htmlFor="walletCheck">
        Use Wallet Balance
      </label>
    </div>
    <span className="fw-semibold text-success">
      Available: KSh {walletBalance.toLocaleString()}
    </span>
  </div>


  {useWallet && (
    <div className="mb-3">
      <label className="form-label small fw-medium">Amount to Use</label>
      <div className="input-group">
        <span className="input-group-text bg-success text-white">KSh</span>
        <input
          type="number"
          className="form-control border-success"
          min="0"
          max={Math.min(walletBalance, total)}
          value={walletUsageAmount}
          onChange={(e) => {
            let val = parseFloat(e.target.value) || 0;
            val = Math.min(val, walletBalance, total);
            setWalletUsageAmount(val);
          }}
        />
      </div>
      <small className="text-muted">
        You can use up to KSh {Math.min(walletBalance, total).toLocaleString()} from your wallet.
      </small>
    </div>
  )}

  
              {/* --- Wallet Top-Up --- */}
  <div className="mt-2">
    {!isToppingUp ? (
      <button className="btn btn-outline-success btn-sm" onClick={() => setIsToppingUp(true)}>
        <i className="bi bi-wallet2 me-1"></i> Top Up Wallet
      </button>
    ) : (
      <div className="mt-2">
        <div className="input-group">
          <span className="input-group-text bg-success text-white">KSh</span>
          <input
            type="number"
            className="form-control border-success"
            placeholder="Enter amount"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={() => {
              const amount = parseFloat(topUpAmount);
              if (!amount || amount < 10) return showToastMessage("Minimum top-up is KSh 10", "danger");

              showToastMessage(`M-PESA STK push sent for KSh ${amount}`);
              setTimeout(() => {
                setWalletBalance(prev => prev + amount);
                showToastMessage("Wallet topped up successfully!");
                setTopUpAmount("");
                setIsToppingUp(false);

                // Update max usable wallet if wallet active
                if (useWallet) setWalletUsageAmount(Math.min(walletBalance + amount, total));
              }, 2000);
            }}
          >
            <i className="bi bi-phone"></i> Push to SIM
          </button>
        </div>
        <button className="btn btn-link text-muted mt-2 small" onClick={() => setIsToppingUp(false)}>Cancel</button>
      </div>
    )}
  </div>
</div>

              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: "100px" }}>
              <div className="card-body">
                <h5 className="fw-semibold text-success mb-3">
                  <i className="bi bi-receipt me-2"></i> Payment Summary
                </h5>
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>{currency(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery Fee</span>
                  <span>{currency(deliveryFee)}</span>
                </div>
               {computedWalletDeduction > 0 && (
                  <div className="d-flex justify-content-between text-success">
                  <span>Wallet Used</span>
                  <span>-{currency(computedWalletDeduction)}</span>
                </div>
                
                )}
                
                  {/* {walletDeduction > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Wallet Used</span>
                  <span>-{currency(walletDeduction)}</span>
                </div>
              )} */}
                <div className="d-flex justify-content-between">
                  <span>Taxes (16%)</span>
                  <span>{currency(taxes)}</span>
                </div>
                <div className="d-flex justify-content-between">
                <span>Wallet Balance</span>
                <span>{currency(walletBalance)}</span>
              </div>
              <div className="d-flex justify-content-between">
                  <span>Total to Pay</span>
                  <span>{currency(remainingPayment)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold text-success">
                  <span>Total</span>
                  <span>{currency(total)}</span>
                </div>

             <button
  className="btn w-100 mt-3 rounded-pill text-white fw-semibold"
  style={{
    backgroundColor: cart.length === 0 ? "#9E9E9E" : "#2E7D32",
    cursor: cart.length === 0 ? "not-allowed" : "pointer"
  }}
  onClick={placeOrder}
  disabled={cart.length === 0} // disables the button
>
  <i className="bi bi-check-circle me-2"></i> Confirm Order
</button>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;


