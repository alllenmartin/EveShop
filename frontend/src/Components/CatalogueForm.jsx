import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

// Toast Component (unchanged)
const Toast = ({ message, duration = 3000, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  return (
    <div
      className="position-fixed top-0 end-0 m-3 p-2 bg-success text-white shadow rounded"
      style={{ zIndex: 1055, minWidth: "200px", animation: `fadeInOut ${duration}ms forwards` }}
    >
      {message}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

const CataloguePage = () => {
  // Products fetched from API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  // Sidebar & Navbar states
  const [selectedCategory, setSelectedCategory] = useState(localStorage.getItem("category") || "All");
  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("search") || "");
  const [minPrice, setMinPrice] = useState(localStorage.getItem("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(localStorage.getItem("maxPrice") || "");
  const [selectedRatings, setSelectedRatings] = useState(JSON.parse(localStorage.getItem("ratings")) || []);
  const [sortOption, setSortOption] = useState(localStorage.getItem("sort") || "default");
  const [itemsPerPage, setItemsPerPage] = useState(Number(localStorage.getItem("itemsPerPage")) || 6);
  const [page, setPage] = useState(Number(localStorage.getItem("page")) || 1);
  const [checkoutMode, setCheckoutMode] = useState(false);

  // Cart & quantities
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [quantities, setQuantities] = useState({});

  // Toasts array
  const [toasts, setToasts] = useState([]);

  // Fetch products from Flask API on mount
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setQuantities(data.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
        // Extract unique categories
        const cats = ["All", ...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(cats);
      })
      .catch(err => console.error(err));
  }, []);

  // Persist states in localStorage
  useEffect(() => { localStorage.setItem("category", selectedCategory); }, [selectedCategory]);
  useEffect(() => { localStorage.setItem("search", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("minPrice", minPrice); }, [minPrice]);
  useEffect(() => { localStorage.setItem("maxPrice", maxPrice); }, [maxPrice]);
  useEffect(() => { localStorage.setItem("ratings", JSON.stringify(selectedRatings)); }, [selectedRatings]);
  useEffect(() => { localStorage.setItem("sort", sortOption); }, [sortOption]);
  useEffect(() => { localStorage.setItem("itemsPerPage", itemsPerPage); }, [itemsPerPage]);
  useEffect(() => { localStorage.setItem("page", page); }, [page]);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const toggleRating = (rating) => {
    setPage(1);
    setSelectedRatings(prev => prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]);
  };

  // Filtering & sorting
  let filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMin = minPrice === "" || p.price >= Number(minPrice);
    const matchesMax = maxPrice === "" || p.price <= Number(maxPrice);
    const matchesRating = selectedRatings.length === 0 || selectedRatings.includes(p.rating);
    return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesRating;
  });

  if (sortOption === "priceLowHigh") filteredProducts.sort((a,b)=>a.price-b.price);
  else if (sortOption === "priceHighLow") filteredProducts.sort((a,b)=>b.price-a.price);
  else if (sortOption === "ratingHighLow") filteredProducts.sort((a,b)=>b.rating-a.rating);
  else if (sortOption === "nameAZ") filteredProducts.sort((a,b)=>a.name.localeCompare(b.name));
  else if (sortOption === "nameZA") filteredProducts.sort((a,b)=>b.name.localeCompare(a.name));

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage + 1;
  const endIdx = Math.min(page * itemsPerPage, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSortChange = e => { setSortOption(e.target.value); setPage(1); };
  const handleItemsPerPageChange = e => { setItemsPerPage(Number(e.target.value)); setPage(1); };

  const handleAddToCart = (product) => {
    const existing = cart.find(p => p.id === product.id);
    const quantity = quantities[product.id] || 1;
    if (existing) {
      setCart(prev => prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p));
    } else {
      setCart(prev => [...prev, { ...product, quantity }]);
    }
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));

    const id = Date.now();
    setToasts(prev => [...prev, { id, message: `${product.name} added to cart!` }]);
  };

  const handleCartQuantityChange = (id, newQty) => { setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)); };
  const handleRemoveFromCart = (id) => { setCart(prev => prev.filter(item => item.id !== id)); };
  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div id="top">
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={3000}
          onDone={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-primary" href="#top">EveShop</a>
          <form className="d-flex mx-auto" onSubmit={e => e.preventDefault()} style={{ maxWidth: "400px", width: "100%" }}>
            <input className="form-control me-2" type="search" placeholder="Search..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
            <button className="btn btn-outline-primary" type="submit"><i className="bi bi-search"></i></button>
          </form>
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-success position-relative me-2" onClick={() => setShowCart(true)}>
              <i className="bi bi-cart3"></i> Cart
              {cart.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{cart.length}</span>}
            </button>
            <button className="btn btn-outline-danger"><i className="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </div>
      </nav>
      
{/* Cart Modal */}
{showCart && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{checkoutMode ? "Checkout" : "Your Cart"}</h5>
          <button type="button" className="btn-close" onClick={() => setShowCart(false)}></button>
        </div>
        <div
          className="modal-body"
          style={{
            transition: "all 0.3s ease",
            minHeight: "200px",
            overflow: "hidden",
          }}
        >
          {/* Animate container */}
          <div
            style={{
              opacity: checkoutMode ? 0 : 1,
              transform: checkoutMode ? "translateX(-20px)" : "translateX(0)",
              transition: "all 0.3s ease",
              position: checkoutMode ? "absolute" : "relative",
              width: "100%",
            }}
          >
            {/* Cart view */}
            {cart.length === 0 ? <p>Your cart is empty.</p> :
              <ul className="list-group">
                {cart.map(item => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                      <span>{item.name}</span>
                      <div className="d-flex gap-1 align-items-center ms-3">
                        <button className="btn btn-sm btn-outline-secondary p-1" style={{ minWidth: "25px" }} onClick={() => handleCartQuantityChange(item.id, Math.max(1, item.quantity - 1))}>-</button>
                        <input type="number" className="form-control form-control-sm text-center" style={{ width: "40px", padding: "0" }} value={item.quantity} min={1} onChange={e => handleCartQuantityChange(item.id, Math.max(1, Number(e.target.value)))} />
                        <button className="btn btn-sm btn-outline-secondary p-1" style={{ minWidth: "25px" }} onClick={() => handleCartQuantityChange(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                    </div>
                    <span className="fw-bold">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            }
          </div>

          <div
            style={{
              opacity: checkoutMode ? 1 : 0,
              transform: checkoutMode ? "translateX(0)" : "translateX(20px)",
              transition: "all 0.3s ease",
              position: checkoutMode ? "relative" : "absolute",
              width: "100%",
            }}
          >
            {/* Checkout view */}
            {checkoutMode && (
              <div>
                <h6>Confirm your order</h6>
                <p>Grand Total: Ksh {grandTotal.toLocaleString()}</p>
                <p>Enter your details here for checkout...</p>
                <button
                className="btn btn-success me-2"
                onClick={() => {
                    alert("Order placed successfully!");
                    setCart([]);                // Clear cart
                    setQuantities(products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})); // Reset quantities
                    setCheckoutMode(false);     // Go back to cart view
                    setShowCart(false);         // Close modal
                    localStorage.removeItem("cart"); // Clear persisted cart
                }}
                >
             Place Order
              </button>

              
  <button
    className="btn btn-secondary"
    onClick={() => {
      setCheckoutMode(false);  // Exit checkout view
      setShowCart(false);      // Close modal to continue shopping
    }}
  >
    Continue Shopping
  </button>
              </div>
            )}
          </div>
        </div>
        {!checkoutMode && (
          <div className="modal-footer">
            <h6 className="me-auto">Grand Total: Ksh {grandTotal.toLocaleString()}</h6>
            <button className="btn btn-secondary" onClick={() => setShowCart(false)}>Close</button>
            {cart.length > 0 && <button className="btn btn-primary" onClick={() => setCheckoutMode(true)}>Checkout</button>}
          </div>
        )}
      </div>
    </div>
  </div>
)}



      {/* Main Content */}
      <div className="main py-4 py-lg-5">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3 col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <input type="text" className="form-control mb-3" placeholder="Search products..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
                  <h6>Categories</h6>
                  <ul className="list-group list-group-flush mb-3">
                    {categories.map(cat => (
                      <li key={cat} className={`list-group-item ${selectedCategory === cat ? "active" : ""}`} style={{ cursor: "pointer" }} onClick={() => { setSelectedCategory(cat); setPage(1); }}>{cat}</li>
                    ))}
                  </ul>
                  <h6>Price Range</h6>
                  <div className="d-flex gap-2 mb-3">
                    <input type="number" className="form-control" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
                    <input type="number" className="form-control" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
                  </div>
                  <h6>Rating</h6>
                  {[5,4,3,2,1].map(r => (
                    <div className="form-check" key={r}>
                      <input type="checkbox" className="form-check-input" id={`rating-${r}`} checked={selectedRatings.includes(r)} onChange={() => toggleRating(r)} />
                      <label className="form-check-label" htmlFor={`rating-${r}`}>
                        {[...Array(r)].map((_, i) => <i key={i} className="bi bi-star-fill text-warning"></i>)}
                        {[...Array(5-r)].map((_, i) => <i key={i} className="bi bi-star-fill text-muted"></i>)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="col-lg-9 col-md-8">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-0">Products</h5>
                  <small className="text-muted">Showing {filteredProducts.length === 0 ? 0 : startIdx}-{endIdx} of {filteredProducts.length}</small>
                </div>
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" value={sortOption} onChange={handleSortChange}>
                    <option value="default">Sort By</option>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="ratingHighLow">Rating: High to Low</option>
                    <option value="nameAZ">Name: A-Z</option>
                    <option value="nameZA">Name: Z-A</option>
                  </select>
                  <select className="form-select form-select-sm" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={6}>6 per page</option>
                    <option value={9}>9 per page</option>
                    <option value={12}>12 per page</option>
                  </select>
                </div>
              </div>

              <div className="row">
                {paginatedProducts.length === 0 ? (
                  <div className="col-12 text-center py-5">No products found.</div>
                ) : (
                  paginatedProducts.map(product => (
                    <div key={product.id} className="col-lg-4 col-md-6 col-6 mb-3">
                      <div className="card p-2 h-100">
                        <img
                          src={product.image}
                          className="card-img-top"
                          alt={product.name}
                          style={{ maxHeight: "120px", objectFit: "contain" }}
                        />
                        <div className="card-body p-2 d-flex flex-column">
                          <h6 className="card-title mb-1" style={{ fontSize: "0.85rem" }}>
                            {product.name}
                          </h6>
                          <div className="mb-1">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`bi bi-star-fill ${i < product.rating ? "text-warning" : "text-muted"}`}
                                style={{ fontSize: "0.7rem" }}
                              ></i>
                            ))}
                          </div>
                          <p className="mb-2 text-primary" style={{ fontSize: "0.9rem" }}>
                            Ksh {product.price.toLocaleString()}
                          </p>

                          <div className="d-flex gap-1 mb-2 align-items-center">
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              onClick={() =>
                                setQuantities(prev => ({
                                  ...prev,
                                  [product.id]: Math.max(1, prev[product.id] - 1),
                                }))
                              }
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center"
                              style={{ width: "40px", padding: "0" }}
                              value={quantities[product.id]}
                              onChange={e =>
                                setQuantities(prev => ({
                                  ...prev,
                                  [product.id]: Math.max(1, Number(e.target.value)),
                                }))
                              }
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              onClick={() =>
                                setQuantities(prev => ({
                                  ...prev,
                                  [product.id]: prev[product.id] + 1,
                                }))
                              }
                            >
                              +
                            </button>

                            <Link
                              to={`/product/${product.id}`}
                              className="btn btn-link text-primary p-0 ms-auto"
                              style={{ fontSize: "0.85rem", textDecoration: "none" }}
                            >
                              View Details →
                            </Link>
                          </div>

                          <p className="fw-bold mb-2">
                            Subtotal: Ksh {(product.price * quantities[product.id]).toLocaleString()}
                          </p>

                          <button
                            className="btn btn-sm btn-outline-primary mt-auto"
                            onClick={() => handleAddToCart(product)}
                          >
                            <i className="bi bi-cart-plus"></i> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage(p => p - 1)}>Prev</button></li>
                    {[...Array(totalPages)].map((_, i) => <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>)}
                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button></li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;
