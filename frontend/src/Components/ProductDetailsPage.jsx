import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [userPhone, setUserPhone] = useState(localStorage.getItem("phone") || "");

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  });
  const [showWishlist, setShowWishlist] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error loading products:", err));
  }, []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const found = products.find(p => p.id.toString() === id);
      setProduct(found || null);
    }
  }, [products, id]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleAddToCart = () => {
    if (!product) return;

    const existing = cart.find(p => p.id === product.id);
    if (existing) {
      setCart(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p
        )
      );
    } else {
      setCart(prev => [...prev, { ...product, quantity }]);
    }
    setQuantity(1);
    setToastMsg(`Added ${product.name} to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleWishlist = () => {
    if (!product) return;
    const exists = wishlist.find(p => p.id === product.id);
    let msg = "";
    if (exists) {
      const newList = wishlist.filter(p => p.id !== product.id);
      setWishlist(newList);
      msg = `${product.name} removed from wishlist`;
    } else {
      const newList = [...wishlist, product];
      setWishlist(newList);
      msg = `${product.name} added to wishlist`;
    }
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const isInWishlist = wishlist.find(p => p.id === product?.id);

  const handleCartQuantityChange = (id, newQty) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveFromCart = id => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const placeOrder = () => {
    if (!userPhone) {
      alert("You must be logged in to place an order.");
      return;
    }

    const order = {
      reference: `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      userPhone,
      items: cart,
      total: grandTotal,
    };

    console.log("Placing order:", order);
    alert("Order placed successfully!");
    setCart([]);
    localStorage.removeItem("cart");
    setShowCart(false);
    setCheckoutMode(false);
  };

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status"></div>
          <p className="text-muted">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-success d-flex align-items-center" href="#top">
            <i className="bi bi-leaf-fill me-2 text-success"></i>EveShop
          </a>
          <div className="d-flex align-items-center ms-auto">
            <button
              className="btn btn-outline-success position-relative me-2"
              onClick={() => setShowCart(true)}
            >
              <i className="bi bi-cart3"></i> Cart
              {cart.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              className="btn btn-outline-warning position-relative me-2"
              onClick={() => setShowWishlist(true)}
            >
              <i className={`bi ${isInWishlist ? "bi-heart-fill" : "bi-heart"}`}></i> Wishlist
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => {
                localStorage.removeItem("phone");
                navigate("/");
              }}
            >
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

      {/* Wishlist Modal */}
      {showWishlist && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title">Your Wishlist</h5>
                <button type="button" className="btn-close" onClick={() => setShowWishlist(false)}></button>
              </div>
              <div className="modal-body">
                {wishlist.length === 0 ? (
                  <p>Your wishlist is empty.</p>
                ) : (
                  <ul className="list-group">
                    {wishlist.map(item => (
                      <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                          <span>{item.name}</span>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() =>
                              setWishlist(prev => prev.filter(p => p.id !== item.id))
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <span className="fw-bold">
                          Ksh {item.price.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {wishlist.length > 0 && (
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowWishlist(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Your Cart</h5>
                <button type="button" className="btn-close" onClick={() => setShowCart(false)}></button>
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : checkoutMode ? (
                  <div>
                    <h6>Confirm Your Order</h6>
                    <p>Total Items: {cart.length}</p>
                    <p>Grand Total: Ksh {grandTotal.toLocaleString()}</p>
                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={userPhone}
                        onChange={e => setUserPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success" onClick={placeOrder}>
                        <i className="bi bi-check-circle me-2"></i> Place Order
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setCheckoutMode(false)}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Back to Cart
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="list-group">
                    {cart.map(item => (
                      <li
                        key={item.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                          <span>{item.name}</span>
                          <div className="d-flex gap-1 align-items-center ms-3">
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              style={{ minWidth: "25px" }}
                              onClick={() =>
                                handleCartQuantityChange(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center"
                              style={{ width: "40px", padding: "0" }}
                              value={item.quantity}
                              min={1}
                              onChange={e =>
                                handleCartQuantityChange(
                                  item.id,
                                  Math.max(1, Number(e.target.value))
                                )
                              }
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              style={{ minWidth: "25px" }}
                              onClick={() =>
                                handleCartQuantityChange(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                        <span className="fw-bold">
                          Ksh {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!checkoutMode && cart.length > 0 && (
                <div className="modal-footer">
                  <div className="me-auto">
                    <h6 className="mb-0">
                      Grand Total:{" "}
                      <span className="fw-bold">
                        Ksh {grandTotal.toLocaleString()}
                      </span>
                    </h6>
                  </div>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCart(false)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => setCheckoutMode(true)}
                  >
                    <i className="bi bi-credit-card-2-front me-2"></i> Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="container py-5">
        <button className="btn btn-link text-success fw-semibold mb-3" style={{ textDecoration: "none" }} onClick={() => navigate(-1)}>
          ← Back to catalogue
        </button>
        <div className="row">
          <div className="col-md-6">
            <div className="overflow-hidden rounded-4 hover-shadow position-relative">
              <img
                src={product.image}
                alt={product.name}
                className="img-fluid w-100"
                style={{
                  maxHeight: "240px",
                  objectFit: "contain",
                  transition: "transform 0.25s ease",
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={e =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
              <button
                className="btn btn-sm btn-outline-warning position-absolute top-0 end-0 m-2"
                onClick={handleWishlist}
              >
                <i className={`bi ${isInWishlist ? "bi-heart-fill" : "bi-heart"}`}></i>
              </button>
            </div>
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-start">
            <h3 className="fw-semibold">{product.name}</h3>
            <div className="mb-2">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`bi bi-star-fill ${
                    i < product.rating ? "text-warning" : "text-muted"
                  }`}
                ></i>
              ))}
            </div>
            <h4 className="text-success fw-bold">
              Ksh {product.price.toLocaleString()}
            </h4>
            <p className="text-muted">{product.description}</p>

            <div className="d-flex align-items-center mb-3 gap-2">
              <button
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="number"
                className="form-control form-control-sm text-center"
                style={{ width: 60 }}
                value={quantity}
                min={1}
                onChange={e =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
              />
              <button
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => setQuantity(q => q + 1)}
              >
                +
              </button>
            </div>

            <p className="fw-bold mb-3">
              Subtotal: Ksh {(product.price * quantity).toLocaleString()}
            </p>

            <button className="btn btn-success rounded-pill shadow-sm" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus me-2"></i> Add {quantity} to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
