import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusSteps = [
  { name: "Order Placed", icon: "bi-cart-check", etaHours: 0 },
  { name: "Packed", icon: "bi-box-seam", etaHours: 4 },
  { name: "Out for Delivery", icon: "bi-truck", etaHours: 24 },
  { name: "Delivered", icon: "bi-house-check", etaHours: 48 },
];

const ORDERS_PER_PAGE = 3;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [activeOrdersPage, setActiveOrdersPage] = useState(1);
  const [cancelledOrdersPage, setCancelledOrdersPage] = useState(1);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const savedCancelled = JSON.parse(localStorage.getItem("cancelledOrders") || "[]");

    const activeOrders = savedOrders.map((o) => ({
      ...o,
      statusStep: o.statusStep ?? 0,
      lastUpdated: o.lastUpdated ?? Date.now(),
    }));

    setOrders(activeOrders);
    setCancelledOrders(savedCancelled);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.statusStep >= statusSteps.length - 1) return order;

          const currentStep = statusSteps[order.statusStep];
          const nextStep = statusSteps[order.statusStep + 1];

          const now = Date.now();
          const elapsedHours = (now - order.lastUpdated) / (3600 * 1000);

          if (elapsedHours >= nextStep.etaHours) {
            return { ...order, statusStep: order.statusStep + 1, lastUpdated: now };
          }
          return order;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cancelOrder = (reference) => {
    const updatedOrders = orders.filter((o) => o.reference !== reference);
    const cancelled = orders.find((o) => o.reference === reference);

    if (cancelled) {
      cancelled.status = "Cancelled";
      cancelled.statusStep = statusSteps.length;
      const updatedCancelledOrders = [cancelled, ...cancelledOrders];
      setCancelledOrders(updatedCancelledOrders);
      localStorage.setItem("cancelledOrders", JSON.stringify(updatedCancelledOrders));
    }

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.name || ""}${address.name ? ", " : ""}` +
           `${address.street || ""}${address.street ? ", " : ""}` +
           `${address.city || ""}${address.city ? " — " : ""}` +
           `${address.postal || ""}${address.postal ? ", " : ""}` +
           `${address.phone || ""}`;
  };

  const getRemainingTime = (order, stepIndex) => {
    const orderTime = order.lastUpdated;
    const targetTime = orderTime + statusSteps[stepIndex].etaHours * 3600 * 1000;
    const diffMs = targetTime - currentTime;

    if (diffMs <= 0) return "00h 00m";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  };

  const activeTotalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const cancelledTotalPages = Math.ceil(cancelledOrders.length / ORDERS_PER_PAGE);

  const paginatedActiveOrders = orders.slice(
    (activeOrdersPage - 1) * ORDERS_PER_PAGE,
    activeOrdersPage * ORDERS_PER_PAGE
  );

  const paginatedCancelledOrders = cancelledOrders.slice(
    (cancelledOrdersPage - 1) * ORDERS_PER_PAGE,
    cancelledOrdersPage * ORDERS_PER_PAGE
  );

  return (
    <div style={{ background: "#f0f9f4", minHeight: "100vh", paddingBottom: "50px" }}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a
            className="navbar-brand fw-bold text-success d-flex align-items-center"
            href="#"
            onClick={() => navigate("/home")}
          >
            <i className="bi bi-leaf-fill me-2"></i> EveShop
          </a>
          <button
            className="btn btn-outline-success p-1 rounded-circle"
            style={{ borderColor: "#2E7D32", color: "#2E7D32", width: "32px", height: "32px" }}
            onClick={() => navigate(-1)}
            title="Back"
          >
            <i className="bi bi-arrow-left"></i>
          </button>
        </div>
      </nav>

      <div className="container py-5">
        <h4 className="fw-bold text-success mb-4">
          <i className="bi bi-box-seam me-2"></i> My Orders
        </h4>

        {/* Active Orders */}
        <div className="mb-5">
          <h6 className="fw-semibold mb-3 text-success">Active Orders</h6>
          {paginatedActiveOrders.length === 0 ? (
            <p className="text-muted">You have no active orders.</p>
          ) : (
            paginatedActiveOrders.map((order) => (
              <div key={order.reference} className="card mb-3 border-0 shadow-sm rounded-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="fw-bold text-success mb-1">{order.reference}</h6>
                      <p className="mb-1"><strong>Total:</strong> KSh {order.total.toLocaleString()}</p>
                      <p className="mb-1"><strong>Delivery:</strong> {order.deliveryMethod} ({order.deliveryDate} at {order.deliveryTime})</p>
                      <p className="mb-1"><strong>Payment:</strong> {order.paymentMethod}</p>
                      <p className="mb-1"><strong>Address:</strong> {formatAddress(order.address)}</p>

                      {/* Timeline */}
                      <div className="d-flex align-items-center mt-3">
                        {statusSteps.map((step, idx) => {
                          const isCompleted = idx < order.statusStep;
                          const isCurrent = idx === order.statusStep;

                          return (
                            <div key={idx} className="d-flex flex-column align-items-center position-relative me-3" title={step.name}>
                              <div
                                className={`rounded-circle d-flex justify-content-center align-items-center`}
                                style={{
                                  width: 30,
                                  height: 30,
                                  backgroundColor: isCompleted ? "#2E7D32" : isCurrent ? "#FFC107" : "#ccc",
                                  color: "white",
                                  transition: "background-color 0.3s",
                                  zIndex: 2
                                }}
                              >
                                <i className={`bi ${step.icon}`}></i>
                              </div>
                              <small className="text-center mt-1" style={{ maxWidth: 60 }}>
                                {step.name}
                              </small>
                              {isCurrent && (
                                <small className="text-warning fw-semibold">
                                  {getRemainingTime(order, idx)}
                                </small>
                              )}
                              {idx < statusSteps.length - 1 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 15,
                                    left: 30,
                                    width: 50,
                                    height: 4,
                                    backgroundColor: idx < order.statusStep ? "#2E7D32" : "#ccc",
                                    zIndex: 1
                                  }}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      className="btn btn-outline-danger btn-sm rounded-pill ms-3"
                      onClick={() => cancelOrder(order.reference)}
                      disabled={order.statusStep === statusSteps.length - 1}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Active Orders Pagination */}
          {activeTotalPages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button className="btn btn-sm btn-success" disabled={activeOrdersPage === 1} onClick={() => setActiveOrdersPage(p => p - 1)}>Previous</button>
              <span className="fw-semibold">Page {activeOrdersPage} of {activeTotalPages}</span>
              <button className="btn btn-sm btn-success" disabled={activeOrdersPage === activeTotalPages} onClick={() => setActiveOrdersPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>

        {/* Cancelled Orders */}
        <div>
          <h6 className="fw-semibold mb-3 text-danger">Cancelled Orders</h6>
          {paginatedCancelledOrders.length === 0 ? (
            <p className="text-muted">No cancelled orders yet.</p>
          ) : (
            paginatedCancelledOrders.map((order) => (
              <div key={order.reference} className="card mb-3 border-0 shadow-sm rounded-4 bg-light">
                <div className="card-body">
                  <h6 className="fw-bold text-danger mb-1">{order.reference}</h6>
                  <p className="mb-1"><strong>Total:</strong> KSh {order.total.toLocaleString()}</p>
                  <p className="mb-1"><strong>Delivery:</strong> {order.deliveryMethod} ({order.deliveryDate} at {order.deliveryTime})</p>
                  <p className="mb-1"><strong>Payment:</strong> {order.paymentMethod}</p>
                  <p className="mb-1"><strong>Address:</strong> {formatAddress(order.address)}</p>
                  <span className="badge bg-danger">Cancelled</span>
                </div>
              </div>
            ))
          )}

          {/* Cancelled Orders Pagination */}
          {cancelledTotalPages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button className="btn btn-sm btn-danger" disabled={cancelledOrdersPage === 1} onClick={() => setCancelledOrdersPage(p => p - 1)}>Previous</button>
              <span className="fw-semibold">Page {cancelledOrdersPage} of {cancelledTotalPages}</span>
              <button className="btn btn-sm btn-danger" disabled={cancelledOrdersPage === cancelledTotalPages} onClick={() => setCancelledOrdersPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
