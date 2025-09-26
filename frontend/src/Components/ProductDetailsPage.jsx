import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Fetch product data from API
  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`) // adjust API URL as needed
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then(data => setProduct(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = () => {
    if (!product) return;

    const existing = cart.find(p => p.id === product.id);
    if (existing) {
      setCart(prev => prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p));
    } else {
      setCart(prev => [...prev, { ...product, quantity }]);
    }
    setQuantity(1);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCartQuantityChange = (id, newQty) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-center p-5 text-danger">Error: {error}</div>;
  if (!product) return <div className="text-center p-5">Product not found.</div>;

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="#top">Eveshop</a>
          <div className="d-flex align-items-center ms-auto">
            <button className="btn btn-outline-success position-relative me-2" onClick={() => setShowCart(true)}>
              <i className="bi bi-cart3"></i> Cart
              {cart.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{cart.length}</span>}
            </button>
            <button className="btn btn-outline-danger"><i className="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="toast show position-fixed top-0 end-0 m-3 p-2 bg-success text-white shadow"
          style={{ zIndex: 1055, opacity: 0.95 }}
        >
          <div>Added {product.name} to cart!</div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Your Cart</h5>
                <button type="button" className="btn-close" onClick={() => setShowCart(false)}></button>
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  <ul className="list-group">
                    {cart.map(item => (
                      <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                          <span>{item.name}</span>
                          <div className="d-flex gap-1 align-items-center ms-3">
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              style={{ minWidth: "25px" }}
                              onClick={() => handleCartQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                            >-</button>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center"
                              style={{ width: "40px", padding: "0" }}
                              value={item.quantity}
                              min={1}
                              onChange={e => handleCartQuantityChange(item.id, Math.max(1, Number(e.target.value)))}
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              style={{ minWidth: "25px" }}
                              onClick={() => handleCartQuantityChange(item.id, item.quantity + 1)}
                            >+</button>
                          </div>
                          <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                        </div>
                        <span className="fw-bold">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <h6 className="me-auto">Grand Total: Ksh {grandTotal.toLocaleString()}</h6>
                <button className="btn btn-secondary" onClick={() => setShowCart(false)}>Close</button>
                {cart.length > 0 && <button className="btn btn-primary">Checkout</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="container py-5">
        <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>← Back to catalogue</button>
        <div className="row">
          <div className="col-md-6">
            <img src={product.image} alt={product.name} className="img-fluid" />
          </div>
          <div className="col-md-6">
            <h3>{product.name}</h3>
            <div className="mb-2">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`bi bi-star-fill ${i < product.rating ? "text-warning" : "text-muted"}`}></i>
              ))}
            </div>
            <h4 className="text-primary">Ksh {product.price.toLocaleString()}</h4>
            <p>{product.description}</p>

            {/* Quantity selector */}
            <div className="d-flex align-items-center mb-2 gap-2">
              <button className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <input type="number" className="form-control form-control-sm text-center" style={{ width: "60px", padding: "0" }}
                value={quantity} min={1} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} />
              <button className="btn btn-sm btn-outline-secondary p-1" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            {/* Live subtotal */}
            <p className="fw-bold mb-3">Subtotal: Ksh {(product.price * quantity).toLocaleString()}</p>

            <button className="btn btn-primary" onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i> Add {quantity} to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
